// ============================================================
// MGN Admin Database Schema & Interface
// modules/admin/lib/admin-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { Kysely, sql } from "kysely";
import crypto from "crypto";

export interface AdminUserRoleTable {
  id: string;
  user_id: string;
  user_email: string;
  role: string;
  granted_by: string | null;
  granted_by_email: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdminAuditLogTable {
  id: string;
  admin_id: string;
  admin_email: string;
  admin_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_state: string | null; // json string / jsonb
  new_state: string | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface AdminModerationReportTable {
  id: string;
  reporter_id: string | null;
  reporter_email: string | null;
  target_type: string;
  target_id: string;
  target_content_preview: string | null;
  target_author_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  severity: string;
  assigned_to: string | null;
  resolved_by: string | null;
  resolution_action: string | null;
  resolution_notes: string | null;
  created_at: Date;
  resolved_at: Date | null;
}

export interface AdminSettingTable {
  key: string;
  value: string; // json string / jsonb
  category: string;
  description: string | null;
  updated_by: string | null;
  updated_by_email: string | null;
  updated_at: Date;
}

export interface AdminDatabaseSchema {
  admin_user_roles: AdminUserRoleTable;
  admin_audit_logs: AdminAuditLogTable;
  admin_moderation_reports: AdminModerationReportTable;
  admin_settings: AdminSettingTable;
}

export const adminDb = database as unknown as Kysely<AdminDatabaseSchema>;

export function generateAdminId(): string {
  return crypto.randomUUID();
}

let isInitialized = false;

export async function ensureAdminTables(): Promise<void> {
  if (isInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS admin_user_roles (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        granted_by VARCHAR(36),
        granted_by_email VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_admin_user_role UNIQUE (user_id, role)
      );
      CREATE INDEX IF NOT EXISTS idx_admin_user_roles_user ON admin_user_roles(user_id);
      CREATE INDEX IF NOT EXISTS idx_admin_user_roles_email ON admin_user_roles(user_email);

      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        admin_id VARCHAR(36) NOT NULL,
        admin_email VARCHAR(255) NOT NULL,
        admin_role VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(36) NOT NULL,
        previous_state JSONB,
        new_state JSONB,
        reason TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_logs(created_at DESC);

      CREATE TABLE IF NOT EXISTS admin_moderation_reports (
        id VARCHAR(36) PRIMARY KEY,
        reporter_id VARCHAR(36),
        reporter_email VARCHAR(255),
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(36) NOT NULL,
        target_content_preview TEXT,
        target_author_id VARCHAR(36),
        reason VARCHAR(100) NOT NULL,
        description TEXT,
        status VARCHAR(30) DEFAULT 'pending',
        severity VARCHAR(20) DEFAULT 'medium',
        assigned_to VARCHAR(36),
        resolved_by VARCHAR(36),
        resolution_action VARCHAR(50),
        resolution_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP WITH TIME ZONE
      );
      CREATE INDEX IF NOT EXISTS idx_mod_status ON admin_moderation_reports(status);

      CREATE TABLE IF NOT EXISTS admin_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'general',
        description TEXT,
        updated_by VARCHAR(36),
        updated_by_email VARCHAR(255),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `.execute(database);
    isInitialized = true;
  } catch (err) {
    console.warn("ensureAdminTables warning (might be offline or read-only):", err);
  }
}
