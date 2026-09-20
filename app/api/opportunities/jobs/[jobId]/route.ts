import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    const currentUserId = session?.user?.id;

    // Increment view count asynchronously
    sql`UPDATE jobs SET views_count = views_count + 1 WHERE id = ${jobId} OR slug = ${jobId}`.execute(database).catch(() => {});

    const jobResult: any = await sql`
      SELECT 
        j.*,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug,
          'logo_url', o.logo_url,
          'cover_url', o.cover_url,
          'description', o.description,
          'organization_type', o.organization_type,
          'website', o.website,
          'email', o.email,
          'phone', o.phone,
          'address', o.address,
          'city', o.city,
          'state', o.state,
          'country', o.country,
          'specialties', o.specialties,
          'verification_status', o.verification_status
        ) as organization,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'image', u.image
        ) as recruiter,
        ${
          currentUserId
            ? sql`EXISTS (SELECT 1 FROM job_applications ja WHERE ja.job_id = j.id AND ja.applicant_id = ${currentUserId})`
            : sql`false`
        } as has_applied,
        ${
          currentUserId
            ? sql`EXISTS (SELECT 1 FROM saved_jobs sj WHERE sj.job_id = j.id AND sj.user_id = ${currentUserId})`
            : sql`false`
        } as is_saved,
        ${
          currentUserId
            ? sql`(SELECT ja.status FROM job_applications ja WHERE ja.job_id = j.id AND ja.applicant_id = ${currentUserId} LIMIT 1)`
            : sql`NULL`
        } as user_application_status
      FROM jobs j
      JOIN organizations o ON j.organization_id = o.id
      LEFT JOIN "user" u ON j.recruiter_id = u.id
      WHERE j.id = ${jobId} OR j.slug = ${jobId}
      LIMIT 1
    `.execute(database);

    if (!jobResult.rows?.[0]) {
      return NextResponse.json({ error: "Job opportunity not found" }, { status: 404 });
    }

    const job = jobResult.rows[0];

    // Fetch similar / related jobs
    const similarJobsResult: any = await sql`
      SELECT 
        j.id, j.title, j.slug, j.opportunity_type, j.employment_type, j.work_mode,
        j.city, j.salary_min, j.salary_max, j.salary_currency, j.salary_period,
        j.experience_min, j.published_at,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug,
          'logo_url', o.logo_url,
          'verification_status', o.verification_status
        ) as organization
      FROM jobs j
      JOIN organizations o ON j.organization_id = o.id
      WHERE j.id != ${job.id} 
        AND j.status = 'published'
        AND (j.profession = ${job.profession} OR j.specialization = ${job.specialization} OR j.city = ${job.city})
      ORDER BY j.published_at DESC
      LIMIT 4
    `.execute(database);

    return NextResponse.json({
      job,
      similarJobs: similarJobsResult.rows || [],
    });
  } catch (error: any) {
    console.error("Failed to fetch job detail:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch job detail" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;
    const body = await req.json();

    // Verify ownership/recruiter role
    const jobCheck: any = await sql`
      SELECT j.id, j.organization_id, j.recruiter_id, om.role
      FROM jobs j
      LEFT JOIN organization_members om ON j.organization_id = om.organization_id AND om.user_id = ${currentUserId}
      WHERE j.id = ${jobId}
      LIMIT 1
    `.execute(database);

    if (!jobCheck.rows?.[0]) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const row = jobCheck.rows[0];
    if (row.recruiter_id !== currentUserId && !["owner", "admin", "recruiter"].includes(row.role)) {
      return NextResponse.json({ error: "Forbidden: Not authorized to edit this job" }, { status: 403 });
    }

    const {
      title,
      status,
      opportunity_type,
      employment_type,
      work_mode,
      salary_min,
      salary_max,
      description,
      responsibilities,
      requirements,
      benefits,
      skills,
      qualifications,
      application_deadline,
    } = body;

    await sql`
      UPDATE jobs SET
        title = COALESCE(${title || null}, title),
        status = COALESCE(${status || null}, status),
        opportunity_type = COALESCE(${opportunity_type || null}, opportunity_type),
        employment_type = COALESCE(${employment_type || null}, employment_type),
        work_mode = COALESCE(${work_mode || null}, work_mode),
        salary_min = COALESCE(${salary_min ?? null}, salary_min),
        salary_max = COALESCE(${salary_max ?? null}, salary_max),
        description = COALESCE(${description || null}, description),
        responsibilities = COALESCE(${responsibilities || null}, responsibilities),
        requirements = COALESCE(${requirements || null}, requirements),
        benefits = COALESCE(${benefits || null}, benefits),
        skills = COALESCE(${skills || null}, skills),
        qualifications = COALESCE(${qualifications || null}, qualifications),
        application_deadline = COALESCE(${application_deadline ? new Date(application_deadline) : null}, application_deadline),
        updated_at = now()
      WHERE id = ${jobId}
    `.execute(database);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update job:", error);
    return NextResponse.json({ error: error.message || "Failed to update job" }, { status: 500 });
  }
}
