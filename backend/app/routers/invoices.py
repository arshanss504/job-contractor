from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.rbac import require_contractor, require_agent
from app.models import Invoice, Job, JobStatus, WorkPlanStatus, InvoiceStatus
from app.schemas import InvoiceCreate, InvoiceUpdateStatus, InvoiceOut

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.post("/{job_id}", response_model=InvoiceOut)
def submit_invoice(
    job_id: int,
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    user=Depends(require_contractor),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or job.assigned_contractor_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not allowed to invoice this job")

    if job.work_plan is None:
        raise HTTPException(status_code=400, detail="Work plan required before invoicing")
    if job.work_plan.status != WorkPlanStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Work plan must be completed before invoicing")
    if job.invoice:
        raise HTTPException(status_code=400, detail="Invoice already submitted")

    invoice = Invoice(
        job_id=job_id,
        contractor_id=user["id"],
        amount=payload.amount,
    )
    db.add(invoice)
    job.status = JobStatus.COMPLETED
    db.commit()
    db.refresh(invoice)
    return invoice


@router.patch("/{invoice_id}/status", response_model=InvoiceOut)
def update_invoice_status(
    invoice_id: int,
    payload: InvoiceUpdateStatus,
    db: Session = Depends(get_db),
    user=Depends(require_agent),
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.job.agent_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized for this job")

    invoice.status = payload.status
    if payload.status == InvoiceStatus.PAID:
        invoice.job.status = JobStatus.COMPLETED

    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/job/{job_id}", response_model=InvoiceOut)
def get_job_invoice(job_id: int, db: Session = Depends(get_db), user=Depends(require_agent)):
    invoice = (
        db.query(Invoice)
        .join(Job)
        .filter(Invoice.job_id == job_id, Job.agent_id == user["id"])
        .first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/job/{job_id}/me", response_model=InvoiceOut)
def get_my_invoice_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_contractor),
):
    invoice = (
        db.query(Invoice)
        .join(Job)
        .filter(
            Invoice.job_id == job_id,
            Invoice.contractor_id == user["id"],
        )
        .first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.get("/me", response_model=list[InvoiceOut])
def list_my_invoices(db: Session = Depends(get_db), user=Depends(require_contractor)):
    return db.query(Invoice).filter(Invoice.contractor_id == user["id"]).all()
