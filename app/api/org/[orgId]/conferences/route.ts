// app/api/org/[orgId]/conferences/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { OrgEntitlementService } from "@/modules/organizations/lib/org-entitlements";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { generateOrgId, ensureOrgTables } from "@/modules/organizations/lib/org-db";
import { sql } from "kysely";

const db = database as any;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const { member } = await OrganizationService.getOrganizationById(orgId, session.user.id);
    if (!member || !hasOrgPermission(member.role, undefined, "CONFERENCES_MANAGE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    // Check Plan Entitlement Limits
    const entitlement = await OrgEntitlementService.canCreateConference(orgId);
    if (!entitlement.allowed) {
      return Response.json({ error: entitlement.reason }, { status: 403 });
    }

    const body = await request.json();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_conferences (
        id, organization_id, title, theme, start_date, end_date, venue_type,
        venue_name, address, tracks, sessions, speakers, sponsors,
        abstract_submission_open, created_at
      ) VALUES (
        ${id}, ${orgId}, ${body.title}, ${body.theme || null},
        ${new Date(body.start_date)}, ${new Date(body.end_date)},
        ${body.venue_type || "hybrid"}, ${body.venue_name || null},
        ${body.address || null}, ${JSON.stringify(body.tracks || [])},
        ${JSON.stringify(body.sessions || [])}, ${JSON.stringify(body.speakers || [])},
        ${JSON.stringify(body.sponsors || [])}, ${body.abstract_submission_open ?? true},
        CURRENT_TIMESTAMP
      )
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Event Manager",
      user_email: session.user.email || "",
      action: "CONFERENCE_CREATED",
      entity_type: "CONFERENCE",
      entity_id: id,
      details: { title: body.title },
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/conferences error:`, err);
    return Response.json({ error: err.message || "Failed to create conference" }, { status: 500 });
  }
}
