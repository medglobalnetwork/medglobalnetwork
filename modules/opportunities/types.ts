// ============================================================
// MGN Opportunities & Healthcare Jobs System — TypeScript Types
// modules/opportunities/types.ts
// Canonical shared types for Jobs, Internships, Applications, and Recruiters
// ============================================================

import { ProfessionalProfile } from "../network/types";

export type OpportunityType =
  | "job"
  | "internship"
  | "clinical_internship"
  | "research_internship"
  | "observership"
  | "fellowship"
  | "training";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "fellowship"
  | "volunteer"
  | "temporary";

export type WorkMode = "onsite" | "hybrid" | "remote";

export type JobStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "paused"
  | "closed"
  | "expired";

export type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

export type RecruiterRole =
  | "owner"
  | "admin"
  | "recruiter"
  | "hiring_manager"
  | "viewer";

export type OrganizationType =
  | "Hospital"
  | "Clinic"
  | "Medical College"
  | "University"
  | "Research Institute"
  | "Diagnostic Center"
  | "Pharmaceutical"
  | "Medical Device"
  | "Healthcare Startup"
  | "NGO"
  | "Other";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  cover_url?: string | null;
  description?: string | null;
  organization_type: OrganizationType | string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  specialties?: string[] | null;
  verification_status: "unverified" | "pending" | "verified" | "suspended";
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Computed
  active_jobs_count?: number;
  is_recruiter?: boolean;
  recruiter_role?: RecruiterRole;
}

export interface ApplicationQuestion {
  id: string;
  question: string;
  type: "text" | "choice" | "boolean";
  options?: string[];
  required: boolean;
}

export interface Job {
  id: string;
  organization_id: string;
  recruiter_id?: string | null;
  title: string;
  slug: string;
  opportunity_type: OpportunityType;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency: string;
  salary_period: "monthly" | "yearly" | "hourly";
  is_salary_negotiable: boolean;
  is_salary_visible: boolean;
  profession?: string | null;
  specialization?: string | null;
  experience_min: number;
  experience_max?: number | null;
  skills?: string[] | null;
  qualifications?: string[] | null;
  description: string;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string[] | null;
  application_questions?: ApplicationQuestion[] | null;
  application_deadline?: string | null;
  status: JobStatus;
  applicant_count: number;
  views_count: number;
  is_featured: boolean;
  is_urgent: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  organization?: Organization;
  recruiter?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  has_applied?: boolean;
  is_saved?: boolean;
  user_application_status?: ApplicationStatus | null;
}

export interface InterviewDetails {
  scheduled_at: string;
  meeting_link?: string;
  mode: "video" | "phone" | "onsite";
  location?: string;
  notes?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_url?: string | null;
  resume_type: "uploaded" | "profile_generated";
  cover_letter?: string | null;
  answers?: Record<string, any> | null;
  status: ApplicationStatus;
  interview_details?: InterviewDetails | null;
  recruiter_notes?: string | null;
  applied_at: string;
  updated_at: string;
  
  // Joined fields
  job?: Job;
  applicant?: ProfessionalProfile & {
    user?: {
      name: string;
      email: string;
      image?: string | null;
    };
  };
  history?: ApplicationStatusHistory[];
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  from_status?: string | null;
  to_status: string;
  changed_by?: string | null;
  changed_by_name?: string;
  note?: string | null;
  created_at: string;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
}

export interface JobFilterParams {
  query?: string;
  opportunityType?: string;
  profession?: string;
  specialization?: string;
  employmentType?: string;
  workMode?: string;
  location?: string;
  city?: string;
  experienceMin?: number;
  experienceMax?: number;
  salaryMin?: number;
  verifiedOnly?: boolean;
  sort?: "newest" | "salary_desc" | "deadline" | "popular" | "recommended";
  page?: number;
  pageSize?: number;
}

export interface CreateJobInput {
  organization_id: string;
  title: string;
  opportunity_type?: OpportunityType;
  employment_type: EmploymentType;
  work_mode: WorkMode;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: "monthly" | "yearly" | "hourly";
  is_salary_negotiable?: boolean;
  is_salary_visible?: boolean;
  profession?: string;
  specialization?: string;
  experience_min?: number;
  experience_max?: number;
  skills?: string[];
  qualifications?: string[];
  description: string;
  responsibilities?: string;
  requirements?: string;
  benefits?: string[];
  application_questions?: ApplicationQuestion[];
  application_deadline?: string;
  status?: JobStatus;
}
