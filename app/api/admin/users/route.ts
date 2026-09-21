import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import { generateAdminId } from "@/modules/admin/lib/admin-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "users.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission users.read required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const profession = searchParams.get("profession") || "";
    const verificationStatus = searchParams.get("verificationStatus") || "";
    const role = searchParams.get("role") || "";

    // Fetch users joined with professional profiles and admin roles
    const usersRes: any = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u."emailVerified",
        u.image,
        u."createdAt",
        pp.profession,
        pp.specialization,
        pp.designation,
        pp.organization,
        pp.city,
        pp.state,
        pp.medical_council,
        pp.registration_number,
        pp.identity_verified,
        pp.registration_verified,
        pp.education_verified,
        pp.experience_verified,
        COALESCE(
          (SELECT json_agg(ar.role) FROM admin_user_roles ar WHERE ar.user_id = u.id),
          '[]'::json
        ) as admin_roles
      FROM "user" u
      LEFT JOIN professional_profiles pp ON pp.user_id = u.id
      ORDER BY u."createdAt" DESC
      LIMIT 200
    `.execute(database);

    const users = (usersRes?.rows || []).map((row: any) => ({
      id: row.id,
      name: row.name || "Unnamed User",
      email: row.email,
      emailVerified: Boolean(row.emailVerified),
      image: row.image,
      createdAt: row.createdAt,
      profession: row.profession || "General Member",
      specialization: row.specialization || "General Medicine",
      designation: row.designation || null,
      organization: row.organization || null,
      city: row.city || null,
      state: row.state || null,
      medicalCouncil: row.medical_council || null,
      registrationNumber: row.registration_number || null,
      identityVerified: Boolean(row.identity_verified),
      registrationVerified: Boolean(row.registration_verified),
      educationVerified: Boolean(row.education_verified),
      adminRoles: Array.isArray(row.admin_roles) ? row.admin_roles : [],
      status: "active",
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error in admin users API:", error);
    return NextResponse.json({ error: error.message || "Failed to load users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "users.write")) {
      return NextResponse.json({ error: "Unauthorized. Permission users.write required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, userId, role, reason } = body;

    if (action === "assign_role") {
      if (!admin.isSuperAdmin && !hasPermission(admin, "rbac.manage")) {
        return NextResponse.json({ error: "Forbidden. rbac.manage permission required." }, { status: 403 });
      }

      const id = generateAdminId();
      await sql`
        INSERT INTO admin_user_roles (id, user_id, user_email, role, granted_by, granted_by_email, notes, created_at, updated_at)
        SELECT ${id}, u.id, u.email, ${role}, ${admin.userId}, ${admin.email}, ${reason || null}, NOW(), NOW()
        FROM "user" u WHERE u.id = ${userId}
        ON CONFLICT (user_id, role) DO UPDATE SET updated_at = NOW(), notes = ${reason || null}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "rbac.role_assigned",
        entityType: "user",
        entityId: userId,
        newState: { role, reason },
        reason,
      });

      return NextResponse.json({ success: true, message: `Role ${role} assigned successfully` });
    }

    if (action === "remove_role") {
      if (!admin.isSuperAdmin && !hasPermission(admin, "rbac.manage")) {
        return NextResponse.json({ error: "Forbidden. rbac.manage permission required." }, { status: 403 });
      }

      await sql`
        DELETE FROM admin_user_roles WHERE user_id = ${userId} AND role = ${role}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "rbac.role_removed",
        entityType: "user",
        entityId: userId,
        previousState: { role },
        reason,
      });

      return NextResponse.json({ success: true, message: `Role ${role} removed` });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error modifying user:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
