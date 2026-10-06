// ============================================================
// MedGlobalNetwork (MGN) — DPDP (Digital Personal Data Protection) Module
// modules/dpdp/lib/dpdp-db.ts
//
// Implements database schemas, consent definitions, and helper methods
// for DPDP Act 2023 compliance.
// ============================================================

import { database, pool } from "@/lib/auth";
import { sql } from "kysely";

export interface UserNominee {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  email: string;
  phone: string | null;
  identity_proof_type: string | null;
  identity_proof_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPrivacyConsent {
  id: string;
  user_id: string;
  consent_key: string;
  granted: boolean;
  granted_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export const DPDP_OFFICER_INFO = {
  officerName: "Data Protection & Grievance Officer",
  organization: "MedGlobalNetwork (MGN)",
  email: "grievance@mgn.life",
  supportEmail: "support@mgn.life",
  address: "MedGlobalNetwork Compliance Desk, Mumbai & New Delhi, India",
  responseWindowDays: 30,
  actReference: "Digital Personal Data Protection Act, 2023 (DPDP Act) & DPDP Rules 2025",
};

export const DEFAULT_CONSENT_ITEMS = [
  {
    key: "public_search_indexing",
    title: "Public Profile Discovery & AI Search Indexing",
    description: "Allow your verified clinical profile to be discovered on Google, MGN Public Directory, and AI Knowledge Graphs.",
    category: "discovery",
    defaultGranted: true,
  },
  {
    key: "cme_accreditation_sharing",
    title: "CME Credits & Accrediting Board Verification",
    description: "Share completed course transcripts and credit hours with medical colleges and CME accreditation councils.",
    category: "education",
    defaultGranted: true,
  },
  {
    key: "recruiter_inquiries",
    title: "Hospital & Healthcare Recruiter Inquiries",
    description: "Allow verified hospitals and healthcare organizations to contact you regarding relevant clinical job openings and fellowships.",
    category: "career",
    defaultGranted: true,
  },
  {
    key: "research_collaboration",
    title: "Clinical Research & Multi-Center Trial Invites",
    description: "Receive invitations from clinical researchers and institutions for peer reviews, papers, and multi-center clinical trials.",
    category: "research",
    defaultGranted: true,
  },
  {
    key: "clinical_newsletter",
    title: "Continuing Medical Education & Practice Updates",
    description: "Receive clinical summaries, medical conference notices, and journal highlights via email.",
    category: "communications",
    defaultGranted: true,
  },
];

let tablesInitialized = false;

export async function ensureDpdpTables() {
  if (tablesInitialized) return;

  try {
    // 1. User Nominees table (Right to Nominate under Sec 14)
    await sql`
      CREATE TABLE IF NOT EXISTS user_nominees (
        id                     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id                TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        full_name              TEXT NOT NULL,
        relationship           TEXT NOT NULL,
        email                  TEXT NOT NULL,
        phone                  TEXT,
        identity_proof_type    TEXT,
        identity_proof_number  TEXT,
        notes                  TEXT,
        created_at             TIMESTAMPTZ DEFAULT now(),
        updated_at             TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT uq_user_nominee UNIQUE (user_id)
      );
    `.execute(database);

    // 2. User Privacy Consents table (Consent Management under Sec 6)
    await sql`
      CREATE TABLE IF NOT EXISTS user_privacy_consents (
        id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id      TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        consent_key  TEXT NOT NULL,
        granted      BOOLEAN NOT NULL DEFAULT true,
        granted_at   TIMESTAMPTZ DEFAULT now(),
        ip_address   TEXT,
        user_agent   TEXT,
        CONSTRAINT uq_user_consent_key UNIQUE (user_id, consent_key)
      );
    `.execute(database);

    // Create indexes for fast lookup
    await sql`CREATE INDEX IF NOT EXISTS idx_user_nominees_user_id ON user_nominees(user_id);`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_privacy_consents(user_id);`.execute(database);

    tablesInitialized = true;
  } catch (err) {
    console.error("Failed to ensure DPDP tables:", err);
  }
}
