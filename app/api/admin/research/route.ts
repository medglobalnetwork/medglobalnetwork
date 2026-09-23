// app/api/admin/research/route.ts
import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import { ResearchRepository } from "@/modules/research/repository/research-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "research.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission research.read required." }, { status: 403 });
    }

    await ResearchRepository.ensureTables();

    const projectsRes: any = await sql`
      SELECT 
        rp.id, rp.slug, rp.title, rp.research_area, rp.status, rp.collaborators_count,
        rp.created_at, rp.published_at,
        u.name as lead_name, u.email as lead_email,
        o.name as organization_name
      FROM research_projects rp
      LEFT JOIN "user" u ON u.id = rp.lead_researcher_id
      LEFT JOIN organizations o ON o.id = rp.organization_id
      ORDER BY rp.created_at DESC
      LIMIT 100
    `.execute(database);

    const oppsRes: any = await sql`
      SELECT 
        ro.id, ro.title, ro.opportunity_type, ro.slots_available, ro.applicant_count,
        ro.status, ro.created_at,
        u.name as creator_name
      FROM research_opportunities ro
      LEFT JOIN "user" u ON u.id = ro.created_by
      ORDER BY ro.created_at DESC
      LIMIT 50
    `.execute(database);

    const pubsRes: any = await sql`
      SELECT 
        pub.id, pub.title, pub.journal_or_conference, pub.doi, pub.publication_date, pub.created_at,
        u.name as author_name
      FROM research_publications pub
      LEFT JOIN "user" u ON u.id = pub.user_id
      ORDER BY pub.created_at DESC
      LIMIT 50
    `.execute(database);

    return NextResponse.json({
      projects: projectsRes?.rows || [],
      opportunities: oppsRes?.rows || [],
      publications: pubsRes?.rows || [],
    });
  } catch (error: any) {
    console.error("Error in admin research API:", error);
    return NextResponse.json({ error: error.message || "Failed to load research data" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "research.approve")) {
      return NextResponse.json({ error: "Unauthorized. Permission research.approve required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetId, status, reason } = body;

    if (action === "update_project_status") {
      await sql`
        UPDATE research_projects 
        SET status = ${status}, updated_at = NOW() 
        WHERE id = ${targetId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: `research.project_status_${status}`,
        entityType: "research_project",
        entityId: targetId,
        newState: { status, reason },
        reason: reason || `Admin updated project status to ${status}`,
        userAgent: req.headers.get("user-agent") || undefined,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      });

      return NextResponse.json({ success: true, status });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in admin research PATCH:", error);
    return NextResponse.json({ error: error.message || "Failed to update research" }, { status: 500 });
  }
}
