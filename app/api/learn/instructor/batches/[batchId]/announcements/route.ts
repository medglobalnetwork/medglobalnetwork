// app/api/learn/instructor/batches/[batchId]/announcements/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { createBatchAnnouncement, deleteBatchAnnouncement } from "@/modules/learn/lib/instructor-db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { batchId } = await params;
  try {
    const { title, content, priority } = await request.json();
    if (!title?.trim() || !content?.trim()) {
      return Response.json({ error: "Announcement title and content are required" }, { status: 400 });
    }

    const announcementId = await createBatchAnnouncement(batchId, session.user.id, {
      title,
      content,
      priority,
    });
    return Response.json({ success: true, announcementId });
  } catch (err: any) {
    console.error("POST /api/learn/instructor/batches/[batchId]/announcements error:", err);
    return Response.json({ error: err.message || "Failed to create announcement" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params: _params }: { params: Promise<{ batchId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const announcementId = searchParams.get("announcementId");
  if (!announcementId) {
    return Response.json({ error: "announcementId parameter is required" }, { status: 400 });
  }

  try {
    await deleteBatchAnnouncement(announcementId, session.user.id);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/learn/instructor/batches/[batchId]/announcements error:", err);
    return Response.json({ error: err.message || "Failed to delete announcement" }, { status: 500 });
  }
}
