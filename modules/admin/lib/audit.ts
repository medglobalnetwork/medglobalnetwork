// ============================================================
// MGN Admin Immutable Audit Logging Engine
// modules/admin/lib/audit.ts
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import { generateAdminId, ensureAdminTables } from "./admin-db";
import { AdminSessionContext } from "./rbac";

export interface RecordAuditParams {
  admin: AdminSessionContext;
  action: string;
  entityType: string;
  entityId: string;
  previousState?: Record<string, any> | null;
  newState?: Record<string, any> | null;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function recordAuditLog(params: RecordAuditParams): Promise<void> {
  try {
    await ensureAdminTables();
    const id = generateAdminId();
    const adminRole = params.admin.roles[0] || (params.admin.isSuperAdmin ? "SUPER_ADMIN" : "ADMIN");

    await sql`
      INSERT INTO admin_audit_logs (
        id, admin_id, admin_email, admin_role, action, entity_type, entity_id,
        previous_state, new_state, reason, ip_address, user_agent, created_at
      ) VALUES (
        ${id},
        ${params.admin.userId},
        ${params.admin.email},
        ${adminRole},
        ${params.action},
        ${params.entityType},
        ${params.entityId},
        ${params.previousState ? JSON.stringify(params.previousState) : null}::jsonb,
        ${params.newState ? JSON.stringify(params.newState) : null}::jsonb,
        ${params.reason || null},
        ${params.ipAddress || null},
        ${params.userAgent || null},
        NOW()
      )
    `.execute(database);
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}

export interface AuditLogItem {
  id: string;
  admin_id: string;
  admin_email: string;
  admin_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_state: any;
  new_state: any;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export async function getAuditLogs(options: {
  entityType?: string;
  entityId?: string;
  action?: string;
  adminEmail?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogItem[]; total: number }> {
  await ensureAdminTables();
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  try {
    let whereClause = sql`1 = 1`;

    if (options.entityType) {
      whereClause = sql`${whereClause} AND entity_type = ${options.entityType}`;
    }
    if (options.entityId) {
      whereClause = sql`${whereClause} AND entity_id = ${options.entityId}`;
    }
    if (options.action) {
      whereClause = sql`${whereClause} AND action = ${options.action}`;
    }
    if (options.adminEmail) {
      whereClause = sql`${whereClause} AND LOWER(admin_email) LIKE ${`%${options.adminEmail.toLowerCase()}%`}`;
    }

    const countRes: any = await sql`
      SELECT COUNT(*) as total FROM admin_audit_logs WHERE ${whereClause}
    `.execute(database);
    const total = parseInt(countRes?.rows?.[0]?.total || "0", 10);

    const logsRes: any = await sql`
      SELECT * FROM admin_audit_logs
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `.execute(database);

    return {
      logs: (logsRes?.rows || []) as AuditLogItem[],
      total,
    };
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    return { logs: [], total: 0 };
  }
}
