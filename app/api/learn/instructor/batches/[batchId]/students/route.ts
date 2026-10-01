// app/api/learn/instructor/batches/[batchId]/students/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { addStudentToBatch, removeStudentFromBatch } from "@/modules/learn/lib/instructor-db";

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
    const { studentIdentifier, notes } = await request.json();
    if (!studentIdentifier?.trim()) {
      return Response.json({ error: "Student email or User ID is required" }, { status: 400 });
    }

    const result = await addStudentToBatch(batchId, session.user.id, studentIdentifier.trim(), notes);
    return Response.json(result);
  } catch (err: any) {
    console.error("POST /api/learn/instructor/batches/[batchId]/students error:", err);
    return Response.json({ error: err.message || "Failed to add student to batch" }, { status: 400 });
  }
}

export async function DELETE(
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
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId parameter is required" }, { status: 400 });
  }

  try {
    await removeStudentFromBatch(batchId, session.user.id, userId);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/learn/instructor/batches/[batchId]/students error:", err);
    return Response.json({ error: err.message || "Failed to remove student" }, { status: 500 });
  }
}
