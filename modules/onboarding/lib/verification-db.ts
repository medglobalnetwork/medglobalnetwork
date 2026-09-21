// ============================================================
// MGN Verification & Identity System — Kysely Database Schema
// modules/onboarding/lib/verification-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { ColumnType, Generated, Kysely } from "kysely";

type OptionalColumn<T> = ColumnType<T, T | undefined, T | undefined>;

export interface MgnIdentityTable {
  id: string;
  user_id: string;
  account_type: "INDIVIDUAL" | "ORGANISATION";
  category: string;
  profession_or_type: string;
  legal_first_name: OptionalColumn<string | null>;
  legal_middle_name: OptionalColumn<string | null>;
  legal_last_name: OptionalColumn<string | null>;
  display_name: OptionalColumn<string | null>;
  dob: OptionalColumn<string | null>;
  gender: OptionalColumn<string | null>;
  country: OptionalColumn<string | null>;
  state: OptionalColumn<string | null>;
  city: OptionalColumn<string | null>;
  address: OptionalColumn<string | null>;
  phone: OptionalColumn<string | null>;
  official_email: OptionalColumn<string | null>;
  website: OptionalColumn<string | null>;
  profile_photo_url: OptionalColumn<string | null>;
  experience_years: OptionalColumn<number | null>;
  current_organization: OptionalColumn<string | null>;
  specialization: OptionalColumn<string | null>;
  sub_specialization: OptionalColumn<string | null>;
  verification_status: string;
  verification_deadline: OptionalColumn<Date | null>;
  enrolled_at: OptionalColumn<Date | null>;
  submitted_at: OptionalColumn<Date | null>;
  reviewed_at: OptionalColumn<Date | null>;
  reviewed_by: OptionalColumn<string | null>;
  correction_reason: OptionalColumn<string | null>;
  correction_fields: OptionalColumn<any>;
  rejection_reason: OptionalColumn<string | null>;
  created_at: OptionalColumn<Date>;
  updated_at: OptionalColumn<Date>;
}

export interface MgnProfessionalTitleTable {
  id: string;
  user_id: string;
  title_type: "PREFIX" | "SUFFIX";
  claimed_title: string;
  verified_title: OptionalColumn<string | null>;
  status: string;
  document_id: OptionalColumn<string | null>;
  created_at: OptionalColumn<Date>;
  updated_at: OptionalColumn<Date>;
}

export interface MgnQualificationTable {
  id: string;
  user_id: string;
  degree: string;
  specialization: OptionalColumn<string | null>;
  institution: string;
  graduation_year: OptionalColumn<number | null>;
  status: string;
  document_id: OptionalColumn<string | null>;
  created_at: OptionalColumn<Date>;
}

export interface MgnRegistrationTable {
  id: string;
  user_id: string;
  council_name: string;
  registration_number: string;
  state_or_jurisdiction: OptionalColumn<string | null>;
  valid_until: OptionalColumn<string | null>;
  status: string;
  document_id: OptionalColumn<string | null>;
  created_at: OptionalColumn<Date>;
}

export interface MgnOrganisationIdentityTable {
  id: string;
  user_id: string;
  legal_name: string;
  display_name: OptionalColumn<string | null>;
  org_type: string;
  registration_number: OptionalColumn<string | null>;
  tax_id: OptionalColumn<string | null>;
  year_established: OptionalColumn<number | null>;
  accreditations: OptionalColumn<string[] | null>;
  auth_rep_name: OptionalColumn<string | null>;
  auth_rep_designation: OptionalColumn<string | null>;
  auth_rep_email: OptionalColumn<string | null>;
  auth_rep_phone: OptionalColumn<string | null>;
  created_at: OptionalColumn<Date>;
}

export interface MgnVerificationDocumentTable {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: string;
  uploaded_at: OptionalColumn<Date>;
}

export interface MgnVerificationAuditLogTable {
  id: string;
  target_user_id: string;
  actor_id: string;
  action: string;
  reason: OptionalColumn<string | null>;
  previous_state: OptionalColumn<string | null>;
  new_state: OptionalColumn<string | null>;
  metadata: OptionalColumn<any>;
  created_at: OptionalColumn<Date>;
}

export interface VerificationDatabase {
  mgn_identities: MgnIdentityTable;
  mgn_professional_titles: MgnProfessionalTitleTable;
  mgn_qualifications: MgnQualificationTable;
  mgn_registrations: MgnRegistrationTable;
  mgn_organisation_identities: MgnOrganisationIdentityTable;
  mgn_verification_documents: MgnVerificationDocumentTable;
  mgn_verification_audit_logs: MgnVerificationAuditLogTable;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
  };
  professional_profiles: any;
}

export const verifDb = (database as unknown as Kysely<VerificationDatabase>);
