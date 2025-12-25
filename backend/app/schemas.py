from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models import (
    UserRole,
    JobStatus,
    ApplicationStatus,
    WorkPlanStatus,
    InvoiceStatus,
)

# --------------------
# USERS
# --------------------
class UserCreate(BaseModel):
    name: str = Field(..., max_length=100)
    role: UserRole
    email: Optional[str] = None
    contact_number: Optional[str] = None
    skills: Optional[str] = None
    education: Optional[str] = None
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    role: UserRole
    email: Optional[str]
    contact_number: Optional[str]
    skills: Optional[str]
    education: Optional[str]
    created_at: datetime


# --------------------
# JOBS
# --------------------
class JobCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    budget: Optional[float] = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str]
    budget: Optional[float]
    status: JobStatus
    agent_id: int
    assigned_contractor_id: Optional[int]
    created_at: datetime


# --------------------
# APPLICATIONS
# --------------------
class ApplicationCreate(BaseModel):
    proposed_cost: float


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    contractor_id: int
    contractor: Optional[UserOut] = None
    proposed_cost: Optional[float]
    status: ApplicationStatus
    created_at: datetime


# --------------------
# WORK PLANS
# --------------------
class WorkPlanCreate(BaseModel):
    plan_description: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class WorkPlanUpdate(BaseModel):
    plan_description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[WorkPlanStatus] = None


class WorkPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    contractor_id: int
    plan_description: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    status: WorkPlanStatus
    created_at: datetime


# --------------------
# INVOICES
# --------------------
class InvoiceCreate(BaseModel):
    amount: float


class InvoiceUpdateStatus(BaseModel):
    status: InvoiceStatus


class InvoiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    contractor_id: int
    amount: float
    status: InvoiceStatus
    created_at: datetime
