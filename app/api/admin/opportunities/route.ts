import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "jobs.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission jobs.read required." }, { status: 403 });
    }

    const jobsRes: any = await sql`
      SELECT 
        j.id, j.title, j.opportunity_type, j.profession, j.specialization,
        j.employment_type, j.work_mode, j.city, j.state, j.status,
        j.views_count, j.applications_count, j.created_at,
        o.name as organization_name,
        o.verification_status as organization_verification
      FROM jobs j
      LEFT JOIN organizations o ON o.id = j.organization_id
      ORDER BY j.created_at DESC
      LIMIT 100
    `.execute(database);

    const orgsRes: any = await sql`
      SELECT id, name, slug, organization_type, city, state, verification_status, created_at
      FROM organizations
      ORDER BY created_at DESC
      LIMIT 50
    `.execute(database);

    return NextResponse.json({
      jobs: jobsRes?.rows || [],
      organizations: orgsRes?.rows || [],
    });
  } catch (error: any) {
    console.error("Error in admin opportunities API:", error);
    return NextResponse.json({ error: error.message || "Failed to load opportunities" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "jobs.approve")) {
      return NextResponse.json({ error: "Unauthorized. Permission jobs.approve required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetId, status, reason } = body;

    if (action === "update_job_status") {
      await sql`
        UPDATE jobs SET status = ${status}, updated_at = NOW() WHERE id = ${targetId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: `job.status_${status}`,
        entityType: "job",
        entityId: targetId,
        newState: { status },
        reason,
      });

      return NextResponse.json({ success: true, message: `Job updated to ${status}` });
    }

    if (action === "verify_organization") {
      if (!hasPermission(admin, "organizations.verify")) {
        return NextResponse.json({ error: "Unauthorized. Permission organizations.verify required." }, { status: 403 });
      }

      await sql`
        UPDATE organizations SET verification_status = ${status}, updated_at = NOW() WHERE id = ${targetId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: `organization.verification_${status}`,
        entityType: "organization",
        entityId: targetId,
        newState: { verification_status: status },
        reason,
      });

      return NextResponse.json({ success: true, message: `Organization status set to ${status}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating opportunities:", error);
    return NextResponse.json({ error: error.message || "Failed to update opportunity" }, { status: 500 });
  }
}
