import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import { generateAdminId, ensureAdminTables } from "@/modules/admin/lib/admin-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "moderation.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission moderation.read required." }, { status: 403 });
    }

    await ensureAdminTables();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    let whereClause = sql`1=1`;
    if (status !== "all") {
      whereClause = sql`status = ${status}`;
    }

    const reportsRes: any = await sql`
      SELECT * FROM admin_moderation_reports
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT 100
    `.execute(database);

    return NextResponse.json({ reports: reportsRes?.rows || [] });
  } catch (error: any) {
    console.error("Error in moderation API:", error);
    return NextResponse.json({ error: error.message || "Failed to load moderation reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "moderation.action")) {
      return NextResponse.json({ error: "Unauthorized. Permission moderation.action required." }, { status: 403 });
    }

    await ensureAdminTables();
    const body = await req.json();
    const { action, reportId, targetType, targetId, resolutionAction, resolutionNotes } = body;

    if (action === "resolve") {
      await sql`
        UPDATE admin_moderation_reports
        SET 
          status = 'resolved_action_taken',
          resolved_by = ${admin.userId},
          resolution_action = ${resolutionAction || 'action_taken'},
          resolution_notes = ${resolutionNotes || null},
          resolved_at = NOW()
        WHERE id = ${reportId}
      `.execute(database);

      // Take action on content if required
      if (resolutionAction === "delete_content") {
        if (targetType === "post") {
          await sql`DELETE FROM network_posts WHERE id = ${targetId}`.execute(database);
        } else if (targetType === "comment") {
          await sql`DELETE FROM post_comments WHERE id = ${targetId}`.execute(database);
        } else if (targetType === "story") {
          await sql`DELETE FROM stories WHERE id = ${targetId}`.execute(database);
        }
      }

      await recordAuditLog({
        admin,
        action: `moderation.${resolutionAction || 'resolved'}`,
        entityType: targetType || "moderation_report",
        entityId: targetId || reportId,
        reason: resolutionNotes,
        newState: { status: "resolved_action_taken", resolutionAction, resolutionNotes },
      });

      return NextResponse.json({ success: true, message: "Report resolved and action recorded." });
    }

    if (action === "dismiss") {
      await sql`
        UPDATE admin_moderation_reports
        SET 
          status = 'resolved_dismissed',
          resolved_by = ${admin.userId},
          resolution_action = 'dismissed',
          resolution_notes = ${resolutionNotes || 'No violation found'},
          resolved_at = NOW()
        WHERE id = ${reportId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "moderation.report_dismissed",
        entityType: "moderation_report",
        entityId: reportId,
        reason: resolutionNotes,
      });

      return NextResponse.json({ success: true, message: "Report dismissed." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in moderation action:", error);
    return NextResponse.json({ error: error.message || "Failed to process moderation action" }, { status: 500 });
  }
}
