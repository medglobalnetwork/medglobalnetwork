// ============================================================
// MGN Admin Control Plane — Communication Engine API
// app/api/admin/communication/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import { ensureCommunicationTables } from "@/modules/communication/lib/communication-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "moderation.read")) {
      return NextResponse.json(
        { error: "Unauthorized. Permission moderation.read required." },
        { status: 403 }
      );
    }

    await ensureCommunicationTables();

    // 1. Overview counts
    const countsRes: any = await sql`
      SELECT 
        (SELECT COUNT(*)::INT FROM conversations) as total_conversations,
        (SELECT COUNT(*)::INT FROM conversations WHERE type = 'DIRECT') as direct_conversations,
        (SELECT COUNT(*)::INT FROM conversations WHERE type = 'GROUP') as group_conversations,
        (SELECT COUNT(*)::INT FROM conversations WHERE type IN ('EVENT', 'CAMP', 'RESEARCH', 'JOB', 'ORGANIZATION', 'COMMUNITY')) as context_conversations,
        (SELECT COUNT(*)::INT FROM communication_messages) as total_messages,
        (SELECT COUNT(*)::INT FROM communication_calls) as total_calls,
        (SELECT COUNT(*)::INT FROM communication_reports WHERE status = 'PENDING') as pending_reports,
        (SELECT COUNT(*)::INT FROM communication_user_blocks) as total_blocks
    `.execute(database);

    const counts = countsRes.rows?.[0] || {
      total_conversations: 0,
      direct_conversations: 0,
      group_conversations: 0,
      context_conversations: 0,
      total_messages: 0,
      total_calls: 0,
      pending_reports: 0,
      total_blocks: 0,
    };

    // 2. Pending reports with user info
    const reportsRes: any = await sql`
      SELECT 
        r.*,
        u_rep.name as reporter_name,
        u_rep.email as reporter_email,
        u_tgt.name as reported_user_name,
        u_tgt.email as reported_user_email,
        m.content as message_snippet,
        m.type as message_type
      FROM communication_reports r
      LEFT JOIN "user" u_rep ON u_rep.id = r.reporter_id
      LEFT JOIN "user" u_tgt ON u_tgt.id = r.reported_user_id
      LEFT JOIN communication_messages m ON m.id = r.message_id
      ORDER BY r.created_at DESC
      LIMIT 50;
    `.execute(database);

    // 3. Recent audit logs
    const auditRes: any = await sql`
      SELECT a.*, u.name as actor_name
      FROM communication_audit_logs a
      LEFT JOIN "user" u ON u.id = a.actor_id
      ORDER BY a.created_at DESC
      LIMIT 30;
    `.execute(database);

    return NextResponse.json({
      metrics: counts,
      reports: reportsRes.rows || [],
      auditLogs: auditRes.rows || [],
    });
  } catch (err: any) {
    console.error("GET /api/admin/communication error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load communication metrics" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "moderation.action")) {
      return NextResponse.json(
        { error: "Unauthorized. Permission moderation.action required." },
        { status: 403 }
      );
    }

    await ensureCommunicationTables();
    const body = await req.json();
    const { reportId, action, reason } = body;
    // action: 'RESOLVE' | 'DISMISS' | 'DELETE_MESSAGE' | 'WARN_USER' | 'RESTRICT_USER'

    if (!reportId || !action) {
      return NextResponse.json({ error: "reportId and action are required" }, { status: 400 });
    }

    const reportRes: any = await sql`
      SELECT * FROM communication_reports WHERE id = ${reportId} LIMIT 1;
    `.execute(database);

    const report = reportRes.rows?.[0];
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const now = new Date();

    if (action === "DELETE_MESSAGE" && report.message_id) {
      await sql`
        UPDATE communication_messages
        SET 
          deleted_at = ${now},
          deleted_for_all = true,
          content = '[Message deleted by moderation]',
          media_urls = null,
          updated_at = ${now}
        WHERE id = ${report.message_id};
      `.execute(database);
    }

    // Update report
    await sql`
      UPDATE communication_reports
      SET 
        status = 'RESOLVED',
        resolution_action = ${action},
        resolved_by = ${admin.userId},
        resolved_at = ${now}
      WHERE id = ${reportId};
    `.execute(database);

    // Audit log
    await recordAuditLog({
      admin,
      action: `communication.report.${action.toLowerCase()}`,
      entityType: "communication_report",
      entityId: reportId,
      reason: reason || `Admin resolved communication report with action ${action}`,
    });

    return NextResponse.json({ success: true, message: `Report marked as ${action}` });
  } catch (err: any) {
    console.error("POST /api/admin/communication error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to execute moderation action" },
      { status: 500 }
    );
  }
}
