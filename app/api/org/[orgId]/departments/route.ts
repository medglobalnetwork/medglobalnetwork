// app/api/org/[orgId]/departments/route.ts
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
  const { orgId } = await params;
  await ensureOrgTables();

  const depts = await sql<any>`
    SELECT 
      od.*,
      (SELECT COUNT(*) FROM organization_members WHERE organization_id = ${orgId} AND department = od.name) as member_count
    FROM organization_departments od
    WHERE od.organization_id = ${orgId}
    ORDER BY od.name ASC
  `.execute(db);

  return Response.json({ departments: depts.rows });
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
    if (!member || !hasOrgPermission(member.role, undefined, "DEPARTMENTS_MANAGE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_departments (
        id, organization_id, name, code, description, created_at
      ) VALUES (
        ${id}, ${orgId}, ${body.name}, ${body.code || null}, ${body.description || null}, CURRENT_TIMESTAMP
      )
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Admin",
      user_email: session.user.email || "",
      action: "DEPARTMENT_CREATED",
      entity_type: "DEPARTMENT",
      entity_id: id,
      details: body,
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/departments error:`, err);
    return Response.json({ error: err.message || "Failed to create department" }, { status: 500 });
  }
}
