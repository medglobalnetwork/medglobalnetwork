import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const appsResult: any = await sql`
      SELECT 
        ja.id,
        ja.job_id,
        ja.status,
        ja.resume_url,
        ja.resume_type,
        ja.cover_letter,
        ja.interview_details,
        ja.applied_at,
        ja.updated_at,
        json_build_object(
          'id', j.id,
          'title', j.title,
          'slug', j.slug,
          'opportunity_type', j.opportunity_type,
          'employment_type', j.employment_type,
          'work_mode', j.work_mode,
          'city', j.city,
          'state', j.state,
          'salary_min', j.salary_min,
          'salary_max', j.salary_max,
          'salary_currency', j.salary_currency,
          'salary_period', j.salary_period,
          'status', j.status,
          'organization', json_build_object(
            'id', o.id,
            'name', o.name,
            'slug', o.slug,
            'logo_url', o.logo_url,
            'verification_status', o.verification_status
          )
        ) as job
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN organizations o ON j.organization_id = o.id
      WHERE ja.applicant_id = ${currentUserId}
      ORDER BY ja.applied_at DESC
    `.execute(database);

    const applications = appsResult.rows || [];

    // Group counts for summary
    const counts = {
      all: applications.length,
      applied: applications.filter((a: any) => a.status === "applied").length,
      under_review: applications.filter((a: any) => a.status === "under_review").length,
      shortlisted: applications.filter((a: any) => a.status === "shortlisted").length,
      interview: applications.filter((a: any) => a.status === "interview").length,
      offer: applications.filter((a: any) => a.status === "offer" || a.status === "hired").length,
      rejected: applications.filter((a: any) => a.status === "rejected").length,
      withdrawn: applications.filter((a: any) => a.status === "withdrawn").length,
    };

    return NextResponse.json({
      applications,
      counts,
    });
  } catch (error: any) {
    console.error("Failed to fetch my applications:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;
    const body = await req.json();
    const { applicationId, action } = body;

    if (!applicationId || action !== "withdraw") {
      return NextResponse.json({ error: "Valid applicationId and action are required" }, { status: 400 });
    }

    const appRes: any = await sql`
      SELECT id, status, job_id FROM job_applications 
      WHERE id = ${applicationId} AND applicant_id = ${currentUserId}
      LIMIT 1
    `.execute(database);

    if (!appRes.rows?.[0]) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const currentApp = appRes.rows[0];
    if (["withdrawn", "hired", "rejected"].includes(currentApp.status)) {
      return NextResponse.json({ error: `Cannot withdraw an application that is already ${currentApp.status}` }, { status: 400 });
    }

    await sql`
      UPDATE job_applications 
      SET status = 'withdrawn', updated_at = now()
      WHERE id = ${applicationId}
    `.execute(database);

    await sql`
      INSERT INTO job_application_status_history (
        application_id, from_status, to_status, changed_by, note
      ) VALUES (
        ${applicationId}, ${currentApp.status}, 'withdrawn', ${currentUserId}, 'Withdrawn by candidate'
      )
    `.execute(database);

    return NextResponse.json({ success: true, message: "Application withdrawn successfully" });
  } catch (error: any) {
    console.error("Failed to withdraw application:", error);
    return NextResponse.json({ error: error.message || "Failed to withdraw application" }, { status: 500 });
  }
}
