from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.rbac import require_contractor, require_agent
from app.models import WorkPlan, Job, JobStatus
from app.schemas import WorkPlanCreate, WorkPlanUpdate, WorkPlanOut

router = APIRouter(prefix="/work-plans", tags=["WorkPlans"])


def _ensure_assignment(job: Job, contractor_id: int):
    if job.assigned_contractor_id != contractor_id:
        raise HTTPException(status_code=403, detail="Not assigned to this job")


@router.post("/{job_id}", response_model=WorkPlanOut)
def create_work_plan(
    job_id: int,
    payload: WorkPlanCreate,
    db: Session = Depends(get_db),
    user=Depends(require_contractor),
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or job.status != JobStatus.ASSIGNED:
        raise HTTPException(status_code=400, detail="Job not assigned")
    _ensure_assignment(job, user["id"])

    if job.work_plan:
        raise HTTPException(status_code=400, detail="Work plan already exists")

    work_plan = WorkPlan(
        job_id=job_id,
        contractor_id=user["id"],
        plan_description=payload.plan_description,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(work_plan)
    db.commit()
    db.refresh(work_plan)
    return work_plan


@router.patch("/{job_id}", response_model=WorkPlanOut)
def update_work_plan(
    job_id: int,
    payload: WorkPlanUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_contractor),
):
    work_plan = db.query(WorkPlan).filter(WorkPlan.job_id == job_id).first()
    if not work_plan:
        raise HTTPException(status_code=404, detail="Work plan not found")

    _ensure_assignment(work_plan.job, user["id"])

    if payload.plan_description is not None:
        work_plan.plan_description = payload.plan_description
    if payload.start_date is not None:
        work_plan.start_date = payload.start_date
    if payload.end_date is not None:
        work_plan.end_date = payload.end_date
    if payload.status is not None:
        work_plan.status = payload.status

    db.commit()
    db.refresh(work_plan)
    return work_plan


@router.get("/{job_id}", response_model=WorkPlanOut)
def get_work_plan(
    job_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_contractor),
):
    work_plan = db.query(WorkPlan).filter(WorkPlan.job_id == job_id).first()
    if not work_plan:
        raise HTTPException(status_code=404, detail="Work plan not found")
    _ensure_assignment(work_plan.job, user["id"])
    return work_plan


@router.get("/agent-view/{job_id}", response_model=WorkPlanOut)
def get_work_plan_as_agent(
    job_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_agent),
):
    work_plan = db.query(WorkPlan).join(Job).filter(
        WorkPlan.job_id == job_id,
        Job.agent_id == user["id"],
    ).first()
    if not work_plan:
        raise HTTPException(status_code=404, detail="Work plan not found")
    return work_plan
