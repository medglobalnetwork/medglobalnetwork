// ============================================================
// MGN Verification & Identity System — Kysely Database Schema
// modules/onboarding/lib/verification-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { ColumnType, Generated, Kysely, sql } from "kysely";

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

let isInitialized = false;

/**
 * Self-healing table auto-creator that ensures all verification tables exist in PostgreSQL.
 */
export async function ensureVerificationTables(): Promise<void> {
  if (isInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS mgn_identities (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE,
        account_type VARCHAR(32) NOT NULL,
        category VARCHAR(64) NOT NULL,
        profession_or_type VARCHAR(64) NOT NULL,
        legal_first_name VARCHAR(100),
        legal_middle_name VARCHAR(100),
        legal_last_name VARCHAR(100),
        display_name VARCHAR(200),
        dob DATE,
        gender VARCHAR(32),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        phone VARCHAR(32),
        official_email VARCHAR(200),
        website VARCHAR(255),
        profile_photo_url TEXT,
        experience_years INT DEFAULT 0,
        current_organization VARCHAR(200),
        specialization VARCHAR(150),
        sub_specialization VARCHAR(150),
        verification_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
        verification_deadline TIMESTAMP WITH TIME ZONE,
        enrolled_at TIMESTAMP WITH TIME ZONE,
        submitted_at TIMESTAMP WITH TIME ZONE,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by VARCHAR(64),
        correction_reason TEXT,
        correction_fields JSONB,
        rejection_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mgn_identities_user ON mgn_identities(user_id);
      CREATE INDEX IF NOT EXISTS idx_mgn_identities_status ON mgn_identities(verification_status);

      CREATE TABLE IF NOT EXISTS mgn_professional_titles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        title_type VARCHAR(16) NOT NULL,
        claimed_title VARCHAR(32) NOT NULL,
        verified_title VARCHAR(32),
        status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED',
        document_id VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mgn_titles_user ON mgn_professional_titles(user_id);

      CREATE TABLE IF NOT EXISTS mgn_qualifications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        degree VARCHAR(150) NOT NULL,
        specialization VARCHAR(150),
        institution VARCHAR(200) NOT NULL,
        graduation_year INT,
        status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED',
        document_id VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mgn_qualifications_user ON mgn_qualifications(user_id);

      CREATE TABLE IF NOT EXISTS mgn_registrations (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        council_name VARCHAR(200) NOT NULL,
        registration_number VARCHAR(100) NOT NULL,
        state_or_jurisdiction VARCHAR(100),
        valid_until DATE,
        status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED',
        document_id VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mgn_registrations_user ON mgn_registrations(user_id);

      CREATE TABLE IF NOT EXISTS mgn_organisation_identities (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL UNIQUE,
        legal_name VARCHAR(200) NOT NULL,
        display_name VARCHAR(200),
        org_type VARCHAR(64) NOT NULL,
        registration_number VARCHAR(100),
        tax_id VARCHAR(100),
        year_established INT,
        accreditations TEXT[],
        auth_rep_name VARCHAR(150),
        auth_rep_designation VARCHAR(150),
        auth_rep_email VARCHAR(200),
        auth_rep_phone VARCHAR(32),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mgn_org_identities_user ON mgn_organisation_identities(user_id);

      CREATE TABLE IF NOT EXISTS mgn_verification_documents (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        document_type VARCHAR(64) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mgn_verif_docs_user ON mgn_verification_documents(user_id);

      CREATE TABLE IF NOT EXISTS mgn_verification_audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        target_user_id VARCHAR(64) NOT NULL,
        actor_id VARCHAR(64) NOT NULL,
        action VARCHAR(100) NOT NULL,
        reason TEXT,
        previous_state VARCHAR(50),
        new_state VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_mgn_verif_audit_target ON mgn_verification_audit_logs(target_user_id);
    `.execute(database);
    isInitialized = true;
  } catch (err) {
    console.warn("ensureVerificationTables warning (might be offline or read-only):", err);
  }
}
