import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function PATCH(
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
    const { status, note, recruiter_notes } = body;

    const validStatuses = [
      "applied", "under_review", "shortlisted", "interview", "offer", "hired", "rejected"
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
    }

    // Verify recruiter authorization
    const appCheck: any = await sql`
      SELECT 
        ja.id, ja.status as current_status, ja.applicant_id, ja.job_id,
        j.title as job_title, j.organization_id, o.name as org_name, om.role
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
      return NextResponse.json({ error: "Forbidden: Not authorized to manage this application" }, { status: 403 });
    }

    const previousStatus = application.current_status;

    // Update application status
    await sql`
      UPDATE job_applications
      SET 
        status = ${status},
        recruiter_notes = COALESCE(${recruiter_notes || null}, recruiter_notes),
        updated_at = now()
      WHERE id = ${appId}
    `.execute(database);

    // Record audit history
    await sql`
      INSERT INTO job_application_status_history (
        application_id, from_status, to_status, changed_by, note
      ) VALUES (
        ${appId}, ${previousStatus}, ${status}, ${currentUserId}, ${note || `Stage moved to ${status}`}
      )
    `.execute(database);

    // Status message for notification
    let statusMsg = "";
    switch (status) {
      case "shortlisted":
        statusMsg = `Congratulations! You have been shortlisted for ${application.job_title} at ${application.org_name}.`;
        break;
      case "interview":
        statusMsg = `Interview round scheduled for ${application.job_title} at ${application.org_name}.`;
        break;
      case "offer":
        statusMsg = `Great news! You have received a job offer for ${application.job_title} at ${application.org_name}.`;
        break;
      case "hired":
        statusMsg = `Welcome aboard! You are marked as Hired for ${application.job_title} at ${application.org_name}.`;
        break;
      case "rejected":
        statusMsg = `Update on your application for ${application.job_title} at ${application.org_name}.`;
        break;
      default:
        statusMsg = `Your application for ${application.job_title} is now ${status.replace("_", " ")}.`;
    }

    // Dispatch notification to candidate
    await sql`
      INSERT INTO network_notifications (
        user_id, actor_id, type, entity_type, entity_id, message
      ) VALUES (
        ${application.applicant_id}, ${currentUserId}, 'job_status_update', 'job_application', ${appId}, ${statusMsg}
      )
    `.execute(database).catch(() => {});

    return NextResponse.json({
      success: true,
      newStatus: status,
      message: "Candidate status updated successfully",
    });
  } catch (error: any) {
    console.error("Failed to update application status:", error);
    return NextResponse.json({ error: error.message || "Failed to update candidate status" }, { status: 500 });
  }
}
