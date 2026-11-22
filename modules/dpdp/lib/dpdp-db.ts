// ============================================================
// MedGlobalNetwork (MGN) — DPDP (Digital Personal Data Protection) Module
// modules/dpdp/lib/dpdp-db.ts
//
// Implements database schemas, consent definitions, and helper methods
// for DPDP Act 2023 compliance.
// ============================================================

import { database, pool } from "@/lib/auth";
import { sql } from "kysely";

export {
  type UserNominee,
  type UserPrivacyConsent,
  DPDP_OFFICER_INFO,
  DEFAULT_CONSENT_ITEMS,
} from "./dpdp-constants";

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
