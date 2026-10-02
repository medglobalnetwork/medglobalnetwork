// app/api/org/[orgId]/roles/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { generateOrgId, ensureOrgTables } from "@/modules/organizations/lib/org-db";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { orgId } = await params;
  await ensureOrgTables();

  const roles = await db
    .selectFrom("organization_roles")
    .selectAll()
    .where("organization_id", "=", orgId)
    .execute();

  return Response.json({ roles });
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
    if (!member || !hasOrgPermission(member.role, undefined, "ROLES_MANAGE")) {
      return Response.json({ error: "Permission denied to manage roles" }, { status: 403 });
    }

    const body = await request.json();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_roles (
        id, organization_id, name, description, permissions, created_by, created_at, updated_at
      ) VALUES (
        ${id}, ${orgId}, ${body.name}, ${body.description || null},
        ${body.permissions || []}, ${session.user.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Admin",
      user_email: session.user.email || "",
      action: "CUSTOM_ROLE_CREATED",
      entity_type: "ROLE",
      entity_id: id,
      details: body,
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/roles error:`, err);
    return Response.json({ error: err.message || "Failed to create custom role" }, { status: 500 });
  }
}
