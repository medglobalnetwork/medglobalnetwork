import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "users.read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const userRes: any = await sql`
      SELECT 
        u.id, u.name, u.email, u."emailVerified", u.image, u."createdAt",
        pp.*
      FROM "user" u
      LEFT JOIN professional_profiles pp ON pp.user_id = u.id
      WHERE u.id = ${id}
      LIMIT 1
    `.execute(database);

    if (!userRes?.rows?.[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRes.rows[0];

    // Fetch user audit history
    const auditRes: any = await sql`
      SELECT * FROM admin_audit_logs 
      WHERE entity_type = 'user' AND entity_id = ${id}
      ORDER BY created_at DESC LIMIT 20
    `.execute(database);

    return NextResponse.json({
      user,
      auditHistory: auditRes?.rows || [],
    });
  } catch (error: any) {
    console.error("Error fetching user detail:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "users.write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, reason, updates } = body;

    if (action === "toggle_verification") {
      const { type, value } = updates; // type: 'identity' | 'registration' | 'education'
      const col =
        type === "identity"
          ? "identity_verified"
          : type === "registration"
          ? "registration_verified"
          : "education_verified";

      await sql`
        UPDATE professional_profiles
        SET ${sql.raw(col)} = ${Boolean(value)}, updated_at = NOW()
        WHERE user_id = ${id}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: `verification.${type}_toggled`,
        entityType: "professional_profile",
        entityId: id,
        newState: { [col]: value },
        reason,
      });

      return NextResponse.json({ success: true, message: `Updated ${type} verification to ${value}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
