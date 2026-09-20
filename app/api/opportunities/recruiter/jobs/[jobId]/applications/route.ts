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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;

    // Verify recruiter membership for this job's organization
    const jobCheck: any = await sql`
      SELECT j.id, j.title, j.organization_id, j.recruiter_id, j.status, o.name as org_name, om.role
      FROM jobs j
      JOIN organizations o ON j.organization_id = o.id
      LEFT JOIN organization_members om ON j.organization_id = om.organization_id AND om.user_id = ${currentUserId}
      WHERE j.id = ${jobId} OR j.slug = ${jobId}
      LIMIT 1
    `.execute(database);

    if (!jobCheck.rows?.[0]) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobCheck.rows[0];
    if (job.recruiter_id !== currentUserId && !["owner", "admin", "recruiter"].includes(job.role)) {
      return NextResponse.json({ error: "Forbidden: Not authorized to view candidate applications for this job" }, { status: 403 });
    }

    // Fetch applications with joined candidate profiles
    const appsResult: any = await sql`
      SELECT 
        ja.id,
        ja.job_id,
        ja.applicant_id,
        ja.resume_url,
        ja.resume_type,
        ja.cover_letter,
        ja.answers,
        ja.status,
        ja.interview_details,
        ja.recruiter_notes,
        ja.applied_at,
        ja.updated_at,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email,
          'image', u.image,
          'profession', pp.profession,
          'specialization', pp.specialization,
          'designation', pp.designation,
          'primary_degree', pp.primary_degree,
          'additional_degrees', pp.additional_degrees,
          'medical_council', pp.medical_council,
          'registration_number', pp.registration_number,
          'organization', pp.organization,
          'city', pp.city,
          'state', pp.state,
          'experience_years', pp.experience_years,
          'skills', pp.skills,
          'identity_verified', pp.identity_verified,
          'education_verified', pp.education_verified,
          'registration_verified', pp.registration_verified
        ) as applicant,
        (
          SELECT json_agg(
            json_build_object(
              'id', h.id,
              'from_status', h.from_status,
              'to_status', h.to_status,
              'note', h.note,
              'created_at', h.created_at,
              'changed_by_name', u2.name
            ) ORDER BY h.created_at DESC
          )
          FROM job_application_status_history h
          LEFT JOIN "user" u2 ON h.changed_by = u2.id
          WHERE h.application_id = ja.id
        ) as history
      FROM job_applications ja
      JOIN "user" u ON ja.applicant_id = u.id
      LEFT JOIN professional_profiles pp ON u.id = pp.user_id
      WHERE ja.job_id = ${job.id}
      ORDER BY ja.applied_at DESC
    `.execute(database);

    const applications = appsResult.rows || [];

    // Stage counts
    const pipelineCounts = {
      all: applications.length,
      applied: applications.filter((a: any) => a.status === "applied").length,
      under_review: applications.filter((a: any) => a.status === "under_review").length,
      shortlisted: applications.filter((a: any) => a.status === "shortlisted").length,
      interview: applications.filter((a: any) => a.status === "interview").length,
      offer: applications.filter((a: any) => a.status === "offer").length,
      hired: applications.filter((a: any) => a.status === "hired").length,
      rejected: applications.filter((a: any) => a.status === "rejected").length,
      withdrawn: applications.filter((a: any) => a.status === "withdrawn").length,
    };

    return NextResponse.json({
      job,
      applications,
      pipelineCounts,
    });
  } catch (error: any) {
    console.error("Failed to fetch job applications:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 });
  }
}
