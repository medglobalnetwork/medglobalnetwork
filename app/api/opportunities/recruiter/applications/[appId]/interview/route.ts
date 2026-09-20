import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const { appId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;
    const body = await req.json();

    const {
      scheduled_at,
      meeting_link,
      mode = "video",
      location,
      notes,
    } = body;

    if (!scheduled_at) {
      return NextResponse.json({ error: "Interview schedule date and time are required" }, { status: 400 });
    }

    // Verify recruiter
    const appCheck: any = await sql`
      SELECT 
        ja.id, ja.status as current_status, ja.applicant_id,
        j.title as job_title, o.name as org_name, om.role
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN organizations o ON j.organization_id = o.id
      LEFT JOIN organization_members om ON j.organization_id = om.organization_id AND om.user_id = ${currentUserId}
      WHERE ja.id = ${appId}
      LIMIT 1
    `.execute(database);

    if (!appCheck.rows?.[0]) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const application = appCheck.rows[0];
    if (!["owner", "admin", "recruiter", "hiring_manager"].includes(application.role)) {
      return NextResponse.json({ error: "Forbidden: Not authorized to schedule interviews" }, { status: 403 });
    }

    const interviewDetails = {
      scheduled_at,
      meeting_link: meeting_link || null,
      mode,
      location: location || null,
      notes: notes || null,
    };

    // Update application with interview details & status
    await sql`
      UPDATE job_applications
      SET 
        status = 'interview',
        interview_details = ${JSON.stringify(interviewDetails)}::JSONB,
        updated_at = now()
      WHERE id = ${appId}
    `.execute(database);

    // Record status history
    await sql`
      INSERT INTO job_application_status_history (
        application_id, from_status, to_status, changed_by, note
      ) VALUES (
        ${appId}, ${application.current_status}, 'interview', ${currentUserId},
        ${`Interview scheduled for ${new Date(scheduled_at).toLocaleString()}`}
      )
    `.execute(database);

    const formattedTime = new Date(scheduled_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Notify candidate
    await sql`
      INSERT INTO network_notifications (
        user_id, actor_id, type, entity_type, entity_id, message
      ) VALUES (
        ${application.applicant_id}, ${currentUserId}, 'interview_scheduled', 'job_application', ${appId},
        ${`Interview scheduled for ${application.job_title} on ${formattedTime}.`}
      )
    `.execute(database).catch(() => {});

    return NextResponse.json({
      success: true,
      interviewDetails,
      message: "Interview scheduled and candidate notified",
    });
  } catch (error: any) {
    console.error("Failed to schedule interview:", error);
    return NextResponse.json({ error: error.message || "Failed to schedule interview" }, { status: 500 });
  }
}
