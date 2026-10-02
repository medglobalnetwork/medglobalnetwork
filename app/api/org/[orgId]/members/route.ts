// app/api/org/[orgId]/members/route.ts
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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    await ensureOrgTables();

    const membersRes = await sql<any>`
      SELECT 
        om.*,
        u.name,
        u.email,
        u.image,
        cr.name as custom_role_name
      FROM organization_members om
      JOIN "user" u ON om.user_id = u.id
      LEFT JOIN organization_roles cr ON om.custom_role_id = cr.id
      WHERE om.organization_id = ${orgId}
      ORDER BY om.created_at ASC
    `.execute(db);

    const rolesRes = await db
      .selectFrom("organization_roles")
      .selectAll()
      .where("organization_id", "=", orgId)
      .execute();

    const deptsRes = await sql<any>`
      SELECT 
        od.*,
        (SELECT COUNT(*) FROM organization_members WHERE organization_id = ${orgId} AND department = od.name) as member_count
      FROM organization_departments od
      WHERE od.organization_id = ${orgId}
      ORDER BY od.name ASC
    `.execute(db);

    return Response.json({
      members: membersRes.rows,
      customRoles: rolesRes,
      departments: deptsRes.rows,
    });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/members error:`, err);
    return Response.json({ error: err.message || "Failed to fetch members" }, { status: 500 });
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
    if (!member || !hasOrgPermission(member.role, undefined, "MEMBERS_INVITE")) {
      return Response.json({ error: "Permission denied to invite members" }, { status: 403 });
    }

    // Check Plan Limits
    const entitlement = await OrgEntitlementService.canInviteMember(orgId);
    if (!entitlement.allowed) {
      return Response.json({ error: entitlement.reason }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = "HR_RECRUITER", custom_role_id, department, designation } = body;

    if (!email) {
      return Response.json({ error: "Email or identifier is required" }, { status: 400 });
    }

    // Find if user already registered on MGN
    const targetUser = await db
      .selectFrom("user")
      .selectAll()
      .where("email", "=", email.trim().toLowerCase())
      .executeTakeFirst();

    if (targetUser) {
      // Check if already in org
      const existing = await db
        .selectFrom("organization_members")
        .select("id")
        .where("organization_id", "=", orgId)
        .where("user_id", "=", targetUser.id)
        .executeTakeFirst();

      if (existing) {
        return Response.json({ error: "User is already a member of this organisation" }, { status: 400 });
      }

      await sql`
        INSERT INTO organization_members (
          id, organization_id, user_id, role, custom_role_id, department, designation, status, invited_by, created_at, updated_at
        ) VALUES (
          ${generateOrgId()}, ${orgId}, ${targetUser.id}, ${role}, ${custom_role_id || null},
          ${department || null}, ${designation || null}, 'active', ${session.user.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `.execute(db);
    } else {
      // Record in invitations table
      await sql`
        INSERT INTO organization_invitations (
          id, organization_id, email, role, custom_role_id, department, invited_by, status, token, expires_at, created_at
        ) VALUES (
          ${generateOrgId()}, ${orgId}, ${email.trim().toLowerCase()}, ${role}, ${custom_role_id || null},
          ${department || null}, ${session.user.id}, 'pending', ${generateOrgId()}, CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP
        )
      `.execute(db);
    }

    // Audit log
    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Admin",
      user_email: session.user.email || "",
      action: "MEMBER_INVITED",
      entity_type: "MEMBER",
      entity_id: targetUser?.id || email,
      details: { email, role, department },
    });

    return Response.json({ success: true, message: "Invitation sent successfully" }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/members error:`, err);
    return Response.json({ error: err.message || "Failed to invite member" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  try {
    const { member } = await OrganizationService.getOrganizationById(orgId, session.user.id);
    if (!member || !hasOrgPermission(member.role, undefined, "MEMBERS_MANAGE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    await sql`
      DELETE FROM organization_members
      WHERE organization_id = ${orgId} AND id = ${memberId} AND role != 'OWNER'
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Admin",
      user_email: session.user.email || "",
      action: "MEMBER_REMOVED",
      entity_type: "MEMBER",
      entity_id: memberId || "",
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error(`DELETE /api/org/${orgId}/members error:`, err);
    return Response.json({ error: err.message || "Failed to remove member" }, { status: 500 });
  }
}
