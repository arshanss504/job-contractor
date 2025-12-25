from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.dependencies.rbac import require_agent, require_contractor
from app.models import Job, JobStatus
from app.schemas import JobCreate, JobOut

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/", response_model=JobOut)
def create_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    user=Depends(require_agent),
):
    job = Job(
        title=payload.title,
        description=payload.description,
        budget=payload.budget,
        agent_id=user["id"],
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/", response_model=list[JobOut])
def list_open_jobs(
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Job).filter(Job.status == JobStatus.OPEN)
    if search:
        query = query.filter(Job.title.ilike(f"%{search}%"))
    return query.all()


@router.get("/assigned/me", response_model=list[JobOut])
def get_assigned_jobs(
    db: Session = Depends(get_db),
    user=Depends(require_contractor),
):
    return (
        db.query(Job)
        .filter(
            Job.assigned_contractor_id == user["id"],
            Job.status.in_([JobStatus.ASSIGNED, JobStatus.COMPLETED]),
        )
        .all()
    )


@router.get("/agent/me", response_model=list[JobOut])
def list_agent_jobs(db: Session = Depends(get_db), user=Depends(require_agent)):
    return db.query(Job).filter(Job.agent_id == user["id"]).all()


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
