// ============================================================
// MGN Research System Domain Types
// modules/research/domain/types.ts
// ============================================================

export type ResearchProjectStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "recruiting"
  | "completed"
  | "archived"
  | "suspended";

export type ResearchOpportunityType =
  | "research_assistant"
  | "student_researcher"
  | "clinical_research"
  | "data_collection"
  | "research_volunteer"
  | "statistical_analysis"
  | "academic_collaboration"
  | "co_author";

export interface ResearchMemberRecord {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  contribution_details?: string | null;
  joined_at: string;
  user_name?: string;
  user_image?: string;
  user_profession?: string;
  user_specialization?: string;
}

export interface ResearchCollabRequestRecord {
  id: string;
  project_id: string;
  project_title?: string;
  sender_id: string;
  receiver_id: string;
  role_applied?: string | null;
  proposal_message: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  created_at: string;
  sender_name?: string;
  sender_image?: string;
  sender_profession?: string;
}

export interface ResearchOpportunityRecord {
  id: string;
  project_id?: string | null;
  project_title?: string | null;
  organization_id?: string | null;
  organization_name?: string | null;
  created_by: string;
  creator_name?: string;
  creator_image?: string;
  creator_profession?: string;
  title: string;
  opportunity_type: ResearchOpportunityType;
  description: string;
  required_qualifications?: string[] | null;
  required_skills?: string[] | null;
  stipend_amount?: number | null;
  stipend_currency?: string;
  is_funded: boolean;
  location_type: "remote" | "onsite" | "hybrid";
  city?: string | null;
  application_deadline?: string | null;
  slots_available: number;
  applicant_count: number;
  status: "draft" | "published" | "closed" | "archived";
  created_at: string;
  is_user_applied?: boolean;
}

export interface ResearchPublicationRecord {
  id: string;
  user_id: string;
  project_id?: string | null;
  project_title?: string | null;
  title: string;
  authors: string[];
  journal_or_conference: string;
  publication_date?: string | null;
  doi?: string | null;
  abstract?: string | null;
  research_area?: string | null;
  external_url?: string | null;
  pdf_url?: string | null;
  citation_count: number;
  created_at: string;
  author_name?: string;
  author_image?: string;
  author_profession?: string;
}

export interface ResearchProjectRecord {
  id: string;
  slug: string;
  title: string;
  lead_researcher_id: string;
  lead_name?: string;
  lead_image?: string;
  lead_profession?: string;
  lead_verified?: boolean;
  organization_id?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
  organization_verification?: string | null;
  research_area: string;
  abstract: string;
  methodology?: string | null;
  research_questions?: string[] | null;
  required_skills?: string[] | null;
  status: ResearchProjectStatus;
  start_date?: string | null;
  estimated_end_date?: string | null;
  cover_url?: string | null;
  ethical_approval_number?: string | null;
  funding_status?: string | null;
  documents?: any[] | null;
  collaborators_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  members?: ResearchMemberRecord[];
  opportunities?: ResearchOpportunityRecord[];
  publications?: ResearchPublicationRecord[];
  user_membership_role?: string | null;
  user_pending_collab_request?: boolean;
}

export interface CreateResearchProjectInput {
  title: string;
  organization_id?: string | null;
  research_area: string;
  abstract: string;
  methodology?: string;
  research_questions?: string[];
  required_skills?: string[];
  start_date?: string;
  estimated_end_date?: string;
  cover_url?: string;
  ethical_approval_number?: string;
  funding_status?: string;
  documents?: any[];
  submit_for_review?: boolean;
}

export interface CreateResearchOpportunityInput {
  project_id?: string;
  organization_id?: string | null;
  title: string;
  opportunity_type: ResearchOpportunityType;
  description: string;
  required_qualifications?: string[];
  required_skills?: string[];
  stipend_amount?: number;
  stipend_currency?: string;
  is_funded?: boolean;
  location_type?: "remote" | "onsite" | "hybrid";
  city?: string;
  application_deadline?: string;
  slots_available?: number;
}

export interface AddPublicationInput {
  project_id?: string;
  title: string;
  authors: string[];
  journal_or_conference: string;
  publication_date?: string;
  doi?: string;
  abstract?: string;
  research_area?: string;
  external_url?: string;
  pdf_url?: string;
}
