export const UserRole = {
  AGENT: "AGENT",
  CONTRACTOR: "CONTRACTOR",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const JobStatus = {
  OPEN: "OPEN",
  ASSIGNED: "ASSIGNED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export const ApplicationStatus = {
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export const WorkPlanStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type WorkPlanStatus = typeof WorkPlanStatus[keyof typeof WorkPlanStatus];

export const InvoiceStatus = {
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  PAID: "PAID",
} as const;

export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];

export interface User {
  id: number;
  name: string;
  role: UserRole;
  email?: string;
  contact_number?: string;
  skills?: string;
  education?: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  description: string | null;
  budget: number | null;
  status: JobStatus;
  agent_id: number;
  assigned_contractor_id: number | null;
  created_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  contractor_id: number;
  contractor?: User;
  proposed_cost: number | null;
  status: ApplicationStatus;
  created_at: string;
}

export interface WorkPlan {
  id: number;
  job_id: number;
  contractor_id: number;
  plan_description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: WorkPlanStatus;
  created_at: string;
}

export interface Invoice {
  id: number;
  job_id: number;
  contractor_id: number;
  amount: number;
  status: InvoiceStatus;
  created_at: string;
}
