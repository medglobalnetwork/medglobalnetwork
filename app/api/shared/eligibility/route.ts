// app/api/shared/eligibility/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({
      eligible: false,
      reason: "Authentication required",
      isIndividualVerified: false,
      isOrganizationVerified: false,
      canPublishImmediately: false,
    });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("org_id") || undefined;
  const type = searchParams.get("type") || "event";

  try {
    let result;
    if (type === "camp") {
      result = await OrganizerEligibilityService.canCreateCamp(session.user.id, orgId);
    } else if (type === "research") {
      result = await OrganizerEligibilityService.canCreateResearchProject(session.user.id, orgId);
    } else {
      result = await OrganizerEligibilityService.canCreateEvent(session.user.id, orgId);
    }

    return Response.json(result);
  } catch (err: any) {
    console.error("GET /api/shared/eligibility error:", err);
    return Response.json({ error: err.message || "Failed to check eligibility" }, { status: 500 });
  }
}
