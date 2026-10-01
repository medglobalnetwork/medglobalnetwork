// app/api/learn/instructor/profile/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { getInstructorProfileSettings, saveInstructorProfileSettings } from "@/modules/learn/lib/instructor-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  try {
    const profile = await getInstructorProfileSettings(session.user.id);
    return Response.json({ profile });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/profile error:", err);
    return Response.json({ error: err.message || "Failed to fetch instructor profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await saveInstructorProfileSettings(session.user.id, body);
    return Response.json({ success: true, profile: updated });
  } catch (err: any) {
    console.error("PUT /api/learn/instructor/profile error:", err);
    return Response.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
