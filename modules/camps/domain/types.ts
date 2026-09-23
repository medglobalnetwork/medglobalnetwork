// ============================================================
// MGN Medical Camps Domain Types
// modules/camps/domain/types.ts
// ============================================================

export type CampType =
  | "health_screening"
  | "physiotherapy"
  | "rehabilitation"
  | "rural_health"
  | "awareness"
  | "preventive_health"
  | "community_outreach"
  | "blood_donation"
  | "other";

export type CampStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "published"
  | "active"
  | "completed"
  | "cancelled"
  | "archived";

export interface CampRequiredRole {
  id: string;
  camp_id?: string;
  role_title: string;
  is_professional: boolean;
  profession?: string | null;
  slots_needed: number;
  slots_filled: number;
  description?: string | null;
}

export interface CampVolunteerApplication {
  id: string;
  camp_id: string;
  user_id: string;
  role_id: string;
  role_title?: string;
  user_name?: string;
  user_image?: string;
  user_profession?: string;
  user_specialization?: string;
  status: "pending" | "approved" | "rejected" | "attended" | "cancelled";
  application_note?: string | null;
  attended: boolean;
  certificate_issued: boolean;
  created_at: string;
}

export interface CampReportRecord {
  id: string;
  camp_id: string;
  submitted_by: string;
  participants_screened: number;
  volunteers_present: number;
  professionals_present: number;
  referrals_made: number;
  services_delivered: string[];
  key_findings_summary: string;
  challenges_and_feedback?: string | null;
  photos?: string[] | null;
  documents?: string[] | null;
  status: "submitted" | "verified" | "rejected";
  created_at: string;
}

export interface CampRecord {
  id: string;
  slug: string;
  title: string;
  camp_type: CampType;
  description: string;
  cover_url?: string | null;
  organizer_type: "individual" | "organization";
  organizer_id: string;
  organization_id?: string | null;
  organization_name?: string | null;
  organization_slug?: string | null;
  organization_verification?: string | null;
  organizer_name?: string | null;
  organizer_image?: string | null;
  organizer_profession?: string | null;
  organizer_verified?: boolean;
  start_date: string;
  end_date: string;
  venue_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  target_population?: string | null;
  expected_beneficiaries: number;
  participant_capacity?: number | null;
  participant_registered_count: number;
  services: string[];
  guidelines?: string | null;
  certificate_enabled: boolean;
  status: CampStatus;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  required_roles?: CampRequiredRole[];
  user_volunteer_status?: string | null;
  user_volunteer_role_id?: string | null;
  is_user_participant?: boolean;
  report?: CampReportRecord | null;
}

export interface CreateCampInput {
  title: string;
  camp_type: CampType;
  description: string;
  cover_url?: string;
  organization_id?: string | null;
  start_date: string;
  end_date: string;
  venue_name: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  target_population?: string;
  expected_beneficiaries?: number;
  participant_capacity?: number | null;
  services: string[];
  guidelines?: string;
  certificate_enabled?: boolean;
  required_roles?: Array<{
    role_title: string;
    is_professional: boolean;
    profession?: string;
    slots_needed: number;
    description?: string;
  }>;
  submit_for_review?: boolean;
}

export interface CampFilterParams {
  search?: string;
  camp_type?: string;
  city?: string;
  timeframe?: "upcoming" | "past" | "active";
  has_volunteer_slots?: boolean;
  page?: number;
  limit?: number;
  organizer_id?: string;
}
