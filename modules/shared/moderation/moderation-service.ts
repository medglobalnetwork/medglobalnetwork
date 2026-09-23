// ============================================================
// MGN Shared Moderation & Audit Service
// modules/shared/moderation/moderation-service.ts
// ============================================================

import { database } from "@/lib/auth";
import crypto from "crypto";

const db = database as any;

export interface LogAuditParams {
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  entityType: "event" | "camp" | "research_project" | "research_opportunity" | "research_publication" | "certificate";
  entityId: string;
  previousState?: any;
  newState?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface FlagContentParams {
  reporterId?: string;
  reporterEmail?: string;
  targetType: "event" | "camp" | "research_project" | "research_opportunity" | "research_publication";
  targetId: string;
  targetAuthorId?: string;
  targetContentPreview?: string;
  reason: string;
  description?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

export class SharedModerationService {
  /**
   * Records an immutable administrative audit log.
   */
  static async logAdminAction(params: LogAuditParams): Promise<void> {
    try {
      const id = crypto.randomUUID();
      await db
        .insertInto("admin_audit_logs" as any)
        .values({
          id,
          admin_id: params.adminId,
          admin_email: params.adminEmail,
          admin_role: params.adminRole,
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId,
          previous_state: params.previousState ? JSON.stringify(params.previousState) : null,
          new_state: params.newState ? JSON.stringify(params.newState) : null,
          reason: params.reason || null,
          ip_address: params.ipAddress || null,
          user_agent: params.userAgent || null,
          created_at: new Date(),
        })
        .execute();
    } catch (err) {
      console.error("[SharedModerationService] Failed to record audit log:", err);
    }
  }

  /**
   * Flags content for moderation review.
   */
  static async flagContent(params: FlagContentParams): Promise<void> {
    try {
      const id = crypto.randomUUID();
      await db
        .insertInto("admin_moderation_reports" as any)
        .values({
          id,
          reporter_id: params.reporterId || null,
          reporter_email: params.reporterEmail || null,
          target_type: params.targetType,
          target_id: params.targetId,
          target_author_id: params.targetAuthorId || null,
          target_content_preview: params.targetContentPreview || null,
          reason: params.reason,
          description: params.description || null,
          status: "pending",
          severity: params.severity || "medium",
          created_at: new Date(),
        })
        .execute();
    } catch (err) {
      console.error("[SharedModerationService] Failed to flag content:", err);
    }
  }
}
