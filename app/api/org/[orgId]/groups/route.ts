// app/api/org/[orgId]/groups/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { OrgEntitlementService } from "@/modules/organizations/lib/org-entitlements";
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
    const groupsRes = await sql<any>`
      SELECT * FROM organization_groups
      WHERE organization_id = ${orgId}
      ORDER BY created_at DESC
    `.execute(db);

    return Response.json({ groups: groupsRes.rows });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/groups error:`, err);
    return Response.json({ error: err.message || "Failed to fetch groups" }, { status: 500 });
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
    if (!member || !hasOrgPermission(member.role, undefined, "GROUPS_CREATE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const entitlement = await OrgEntitlementService.canCreateGroup(orgId);
    if (!entitlement.allowed) {
      return Response.json({ error: entitlement.reason }, { status: 403 });
    }

    const body = await request.json();
    const id = generateOrgId();
    const slug = (body.name || "group")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);

    await sql`
      INSERT INTO organization_groups (
        id, organization_id, name, slug, description, category,
        group_type, created_by, created_at, updated_at
      ) VALUES (
        ${id}, ${orgId}, ${body.name}, ${slug}, ${body.description || null},
        ${body.category || "Department"}, ${body.group_type || "org_only"},
        ${session.user.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "User",
      user_email: session.user.email || "",
      action: "GROUP_CREATED",
      entity_type: "GROUP",
      entity_id: id,
      details: { name: body.name },
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/groups error:`, err);
    return Response.json({ error: err.message || "Failed to create group" }, { status: 500 });
  }
}
