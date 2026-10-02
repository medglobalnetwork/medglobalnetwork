// app/api/org/[orgId]/camps/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { OrgEntitlementService } from "@/modules/organizations/lib/org-entitlements";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { generateOrgId, ensureOrgTables } from "@/modules/organizations/lib/org-db";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  await ensureOrgTables();

  try {
    const campsRes = await sql<any>`
      SELECT * FROM camps
      WHERE organization_id = ${orgId}
      ORDER BY start_date DESC
    `.execute(db);

    const volRes = await sql<any>`
      SELECT 
        v.*,
        u.name as user_name,
        u.email as user_email
      FROM organization_camp_volunteers v
      JOIN "user" u ON v.user_id = u.id
      WHERE v.organization_id = ${orgId}
      ORDER BY v.created_at DESC
    `.execute(db);

    return Response.json({
      camps: campsRes.rows,
      volunteers: volRes.rows,
    });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/camps error:`, err);
    return Response.json({ error: err.message || "Failed to fetch camps" }, { status: 500 });
  }
}

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
    if (!member || !hasOrgPermission(member.role, undefined, "CAMPS_CREATE")) {
      return Response.json({ error: "Permission denied to create camps" }, { status: 403 });
    }

    // Check Plan Limits
    const entitlement = await OrgEntitlementService.canCreateCamp(orgId);
    if (!entitlement.allowed) {
      return Response.json({ error: entitlement.reason }, { status: 403 });
    }

    const body = await request.json();
    const id = generateOrgId();
    const slug = (body.title || "camp")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);

    await sql`
      INSERT INTO camps (
        id, slug, title, camp_type, description, organizer_type, organizer_id,
        organization_id, start_date, end_date, address, city, target_population,
        capacity, status, created_at, updated_at
      ) VALUES (
        ${id}, ${slug}, ${body.title}, ${body.camp_type || "Health Screening Camp"},
        ${body.description}, 'organization', ${session.user.id}, ${orgId},
        ${new Date(body.start_date)}, ${new Date(body.end_date)},
        ${body.address || null}, ${body.city || null}, ${body.target_population || null},
        ${body.capacity || 200}, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Camp Manager",
      user_email: session.user.email || "",
      action: "CAMP_CREATED",
      entity_type: "CAMP",
      entity_id: id,
      details: { title: body.title, type: body.camp_type },
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/camps error:`, err);
    return Response.json({ error: err.message || "Failed to create camp" }, { status: 500 });
  }
}

export async function PATCH(
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
    if (!member || !hasOrgPermission(member.role, undefined, "VOLUNTEERS_MANAGE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { volunteerId, status } = body;

    await sql`
      UPDATE organization_camp_volunteers SET
        status = ${status}
      WHERE id = ${volunteerId} AND organization_id = ${orgId}
    `.execute(db);

    return Response.json({ success: true });
  } catch (err: any) {
    console.error(`PATCH /api/org/${orgId}/camps error:`, err);
    return Response.json({ error: err.message || "Failed to update volunteer" }, { status: 500 });
  }
}
