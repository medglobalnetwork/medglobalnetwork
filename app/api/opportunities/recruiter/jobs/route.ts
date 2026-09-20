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

    // Get organizations where current user has recruiter/admin/owner role
    const orgsResult: any = await sql`
      SELECT o.id, o.name, o.slug, o.logo_url, o.verification_status, om.role
      FROM organizations o
      JOIN organization_members om ON o.id = om.organization_id
      WHERE om.user_id = ${currentUserId}
    `.execute(database);

    const organizations = orgsResult.rows || [];

    // Get all jobs managed by user's organizations
    const jobsResult: any = await sql`
      SELECT 
        j.*,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug,
          'logo_url', o.logo_url,
          'verification_status', o.verification_status
        ) as organization,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as total_applications,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id AND ja.status = 'applied') as new_applications,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id AND ja.status = 'shortlisted') as shortlisted_applications,
        (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id AND ja.status = 'interview') as interview_applications
      FROM jobs j
      JOIN organizations o ON j.organization_id = o.id
      JOIN organization_members om ON o.id = om.organization_id
      WHERE om.user_id = ${currentUserId}
      ORDER BY j.created_at DESC
    `.execute(database);

    return NextResponse.json({
      organizations,
      jobs: jobsResult.rows || [],
    });
  } catch (error: any) {
    console.error("Failed to fetch recruiter jobs:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch recruiter jobs" }, { status: 500 });
  }
}
