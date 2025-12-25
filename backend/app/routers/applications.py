from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.rbac import require_contractor, require_agent
from app.models import Application, Job, JobStatus, ApplicationStatus
from app.schemas import ApplicationCreate, ApplicationOut

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/apply/{job_id}", response_model=ApplicationOut)
def apply_to_job(
    job_id: int,
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    user=Depends(require_contractor),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or job.status != JobStatus.OPEN:
        raise HTTPException(status_code=400, detail="Job not open")

    existing = db.query(Application).filter(
        Application.job_id == job_id,
        Application.contractor_id == user["id"],
        Application.status == ApplicationStatus.SUBMITTED,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    application = Application(
        job_id=job_id,
        contractor_id=user["id"],
        proposed_cost=payload.proposed_cost,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/job/{job_id}", response_model=list[ApplicationOut])
def list_applications_for_job(
    job_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_agent),
):
    job = db.query(Job).filter(Job.id == job_id, Job.agent_id == user["id"]).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or not owned by agent")
    return db.query(Application).filter(Application.job_id == job_id).all()


@router.get("/me", response_model=list[ApplicationOut])
def list_my_applications(db: Session = Depends(get_db), user=Depends(require_contractor)):
    return db.query(Application).filter(Application.contractor_id == user["id"]).all()


@router.post("/approve/{application_id}")
def approve_application(
    application_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_agent),
):
    application = db.query(Application).filter(Application.id == application_id).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = application.job
    if job.agent_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized for this job")
    if job.status != JobStatus.OPEN:
        raise HTTPException(status_code=400, detail="Job not open for approval")

    application.status = ApplicationStatus.APPROVED
    job.status = JobStatus.ASSIGNED
    job.assigned_contractor_id = application.contractor_id

    # optional: mark other submissions as rejected to avoid ambiguity
    db.query(Application).filter(
        Application.job_id == job.id,
        Application.id != application.id,
    ).update({Application.status: ApplicationStatus.REJECTED})

    db.commit()
    return {"message": "Application approved", "job_id": job.id}


@router.post("/reject/{application_id}")
def reject_application(
    application_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_agent),
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.job.agent_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized for this job")

    application.status = ApplicationStatus.REJECTED
    db.commit()
    return {"message": "Application rejected"}
