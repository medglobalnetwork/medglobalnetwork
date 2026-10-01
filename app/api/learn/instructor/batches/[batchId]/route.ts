// app/api/learn/instructor/batches/[batchId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { getBatchDetails, updateBatch, deleteBatch } from "@/modules/learn/lib/instructor-db";

export async function GET(
  _request: Request,
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
    const batch = await getBatchDetails(batchId, session.user.id);
    if (!batch) {
      return Response.json({ error: "Batch not found" }, { status: 404 });
    }
    return Response.json({ batch });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/batches/[batchId] error:", err);
    return Response.json({ error: err.message || "Failed to fetch batch" }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = await request.json();
    await updateBatch(batchId, session.user.id, body);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("PATCH /api/learn/instructor/batches/[batchId] error:", err);
    return Response.json({ error: err.message || "Failed to update batch" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
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
    await deleteBatch(batchId, session.user.id);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/learn/instructor/batches/[batchId] error:", err);
    return Response.json({ error: err.message || "Failed to delete batch" }, { status: 500 });
  }
}
