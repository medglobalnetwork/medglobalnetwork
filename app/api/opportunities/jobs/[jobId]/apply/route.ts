import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized: Please sign in to apply" }, { status: 401 });
    }
    const currentUserId = session.user.id;
    const body = await req.json();

    const {
      resume_url,
      resume_type = "profile_generated",
      cover_letter,
      answers = {},
    } = body;

    // 1. Verify job exists and is published
    const jobCheck: any = await sql`
      SELECT id, title, organization_id, recruiter_id, status 
      FROM jobs 
      WHERE id = ${jobId} OR slug = ${jobId}
      LIMIT 1
    `.execute(database);

    if (!jobCheck.rows?.[0]) {
      return NextResponse.json({ error: "Job opportunity not found" }, { status: 404 });
    }

    const job = jobCheck.rows[0];
    if (job.status !== "published") {
      return NextResponse.json({ error: "This job opportunity is no longer accepting applications" }, { status: 400 });
    }

    // 2. Prevent duplicate application
    const existingApp: any = await sql`
      SELECT id, status FROM job_applications 
      WHERE job_id = ${job.id} AND applicant_id = ${currentUserId}
      LIMIT 1
    `.execute(database);

    if (existingApp.rows?.[0]) {
      return NextResponse.json({
        error: "You have already applied for this position",
        applicationId: existingApp.rows[0].id,
        currentStatus: existingApp.rows[0].status,
      }, { status: 409 });
    }

    // 3. Create job application
    const appResult: any = await sql`
      INSERT INTO job_applications (
        job_id, applicant_id, resume_url, resume_type, cover_letter, answers, status
      ) VALUES (
        ${job.id}, ${currentUserId}, ${resume_url || null}, ${resume_type},
        ${cover_letter || null}, ${JSON.stringify(answers)}::JSONB, 'applied'
      )
      RETURNING id
    `.execute(database);

    const applicationId = appResult.rows[0].id;

    // 4. Record initial status history
    await sql`
      INSERT INTO job_application_status_history (
        application_id, from_status, to_status, changed_by, note
      ) VALUES (
        ${applicationId}, NULL, 'applied', ${currentUserId}, 'Application submitted by candidate'
      )
    `.execute(database);

    // 5. Increment applicant count
    await sql`UPDATE jobs SET applicant_count = applicant_count + 1 WHERE id = ${job.id}`.execute(database);

    // 6. Dispatch central notification to candidate
    await sql`
      INSERT INTO network_notifications (
        user_id, actor_id, type, entity_type, entity_id, message
      ) VALUES (
        ${currentUserId}, ${job.recruiter_id || null}, 'job_application_submitted', 'job', ${job.id},
        ${`Your application for ${job.title} was successfully submitted.`}
      )
    `.execute(database).catch(() => {});

    // 7. Dispatch notification to recruiter/organization owner if present
    if (job.recruiter_id && job.recruiter_id !== currentUserId) {
      await sql`
        INSERT INTO network_notifications (
          user_id, actor_id, type, entity_type, entity_id, message
        ) VALUES (
          ${job.recruiter_id}, ${currentUserId}, 'new_job_application', 'job', ${job.id},
          ${`${session.user.name || "A candidate"} applied for ${job.title}.`}
        )
      `.execute(database).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      applicationId,
      message: "Application submitted successfully",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to submit application:", error);
    return NextResponse.json({ error: error.message || "Failed to submit application" }, { status: 500 });
  }
}
