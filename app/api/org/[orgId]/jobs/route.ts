// app/api/org/[orgId]/jobs/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { OrgEntitlementService } from "@/modules/organizations/lib/org-entitlements";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { generateOrgId } from "@/modules/organizations/lib/org-db";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  try {
    const jobsRes = await sql<any>`
      SELECT 
        j.*,
        (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applicant_count
      FROM jobs j
      WHERE j.organization_id = ${orgId}
      ORDER BY j.created_at DESC
    `.execute(db);

    const appsRes = await sql<any>`
      SELECT 
        ja.*,
        j.title as job_title,
        u.name as applicant_name,
        u.email as applicant_email
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      LEFT JOIN "user" u ON ja.applicant_id = u.id
      WHERE j.organization_id = ${orgId}
      ORDER BY ja.created_at DESC
    `.execute(db);

    return Response.json({
      jobs: jobsRes.rows,
      applications: appsRes.rows,
    });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/jobs error:`, err);
    return Response.json({ error: err.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const { member } = await OrganizationService.getOrganizationById(orgId, session.user.id);
    if (!member || !hasOrgPermission(member.role, undefined, "JOBS_CREATE")) {
      return Response.json({ error: "Permission denied to create jobs" }, { status: 403 });
    }

    // Check Plan Entitlement Limits
    const entitlement = await OrgEntitlementService.canCreateJob(orgId);
    if (!entitlement.allowed) {
      return Response.json({ error: entitlement.reason }, { status: 403 });
    }

    const body = await request.json();
    const id = generateOrgId();
    const slug = (body.title || "job")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);

    await sql`
      INSERT INTO jobs (
        id, organization_id, recruiter_id, title, slug, employment_type, work_mode,
        city, state, experience_min, experience_max, specialization,
        salary_min, salary_max, salary_currency, description, responsibilities,
        requirements, skills, application_deadline, status, created_at, updated_at
      ) VALUES (
        ${id}, ${orgId}, ${session.user.id}, ${body.title}, ${slug},
        ${body.employment_type || "full_time"}, ${body.work_mode || "onsite"},
        ${body.city || null}, ${body.state || null}, ${body.experience_min || 0},
        ${body.experience_max || null}, ${body.specialization || null},
        ${body.salary_min || null}, ${body.salary_max || null}, ${body.salary_currency || "INR"},
        ${body.description}, ${body.responsibilities || null}, ${body.requirements || null},
        ${body.skills || []}, ${body.application_deadline ? new Date(body.application_deadline) : null},
        ${body.status || "published"}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Admin",
      user_email: session.user.email || "",
      action: "JOB_CREATED",
      entity_type: "JOB",
      entity_id: id,
      details: { title: body.title },
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/jobs error:`, err);
    return Response.json({ error: err.message || "Failed to post job" }, { status: 500 });
  }
}
