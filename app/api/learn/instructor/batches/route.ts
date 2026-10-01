// app/api/learn/instructor/batches/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { getInstructorBatches, createBatch } from "@/modules/learn/lib/instructor-db";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json(
      { error: "Forbidden: Instructor authorization required", reason: eligibility.reason },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId") || undefined;

  try {
    const batches = await getInstructorBatches(session.user.id, courseId);
    return Response.json({ batches });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/batches error:", err);
    return Response.json(
      { error: err.message || "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json(
      { error: "Forbidden: Instructor authorization required", reason: eligibility.reason },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    if (!body.courseId || !body.name?.trim() || !body.code?.trim()) {
      return Response.json(
        { error: "Course ID, Batch Name, and Batch Code are required." },
        { status: 400 }
      );
    }

    const batchId = await createBatch(session.user.id, body);
    return Response.json({ success: true, batchId });
  } catch (err: any) {
    console.error("POST /api/learn/instructor/batches error:", err);
    return Response.json(
      { error: err.message || "Failed to create batch" },
      { status: 500 }
    );
  }
}
