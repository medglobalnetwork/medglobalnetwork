// app/api/admin/camps/route.ts
import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import { CampsRepository } from "@/modules/camps/repository/camps-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "camps.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission camps.read required." }, { status: 403 });
    }

    await CampsRepository.ensureTables();

    const campsRes: any = await sql`
      SELECT 
        c.id, c.slug, c.title, c.camp_type, c.city, c.state, c.venue_name,
        c.start_date, c.end_date, c.expected_beneficiaries, c.participant_registered_count,
        c.status, c.created_at,
        u.name as organizer_name, u.email as organizer_email,
        o.name as organization_name,
        cr.id as report_id, cr.status as report_status, cr.participants_screened
      FROM camps c
      LEFT JOIN "user" u ON u.id = c.organizer_id
      LEFT JOIN organizations o ON o.id = c.organization_id
      LEFT JOIN camp_reports cr ON cr.camp_id = c.id
      ORDER BY c.created_at DESC
      LIMIT 100
    `.execute(database);

    const statsRes: any = await sql`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'pending_review' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = 'active' OR status = 'published' THEN 1 END)::int as active,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as completed
      FROM camps
    `.execute(database);

    return NextResponse.json({
      camps: campsRes?.rows || [],
      stats: statsRes?.rows?.[0] || { total: 0, pending: 0, active: 0, completed: 0 },
    });
  } catch (error: any) {
    console.error("Error in admin camps API:", error);
    return NextResponse.json({ error: error.message || "Failed to load camps" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "camps.approve")) {
      return NextResponse.json({ error: "Unauthorized. Permission camps.approve required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetId, status, reason } = body;

    if (action === "update_camp_status") {
      const publishedAt = status === "published" || status === "active" ? new Date() : null;

      await sql`
        UPDATE camps 
        SET status = ${status}, 
            published_at = COALESCE(published_at, ${publishedAt}),
            rejection_reason = ${reason || null},
            updated_at = NOW() 
        WHERE id = ${targetId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: `camps.status_${status}`,
        entityType: "camp",
        entityId: targetId,
        newState: { status, reason },
        reason: reason || `Admin updated camp status to ${status}`,
        userAgent: req.headers.get("user-agent") || undefined,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      });

      return NextResponse.json({ success: true, status });
    } else if (action === "verify_camp_report") {
      await sql`
        UPDATE camp_reports
        SET status = 'verified', verified_by = ${admin.userId}, verified_at = NOW(), updated_at = NOW()
        WHERE id = ${targetId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "camps.verify_report",
        entityType: "camp",
        entityId: targetId,
        newState: { status: "verified" },
        reason: "Admin verified post-camp outcome report",
        userAgent: req.headers.get("user-agent") || undefined,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in admin camps PATCH:", error);
    return NextResponse.json({ error: error.message || "Failed to update camp" }, { status: 500 });
  }
}
