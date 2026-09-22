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
        pp.member_id,
        pp.is_founding_member,
        pp.membership_tier,
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
      memberId: row.member_id || (row.email?.toLowerCase() === "patreshubham141@gmail.com" ? "MGN-FOUNDER-001" : `MGN-${row.id.slice(0, 6).toUpperCase()}`),
      isFoundingMember: Boolean(row.is_founding_member || row.email?.toLowerCase() === "patreshubham141@gmail.com"),
      membershipTier: row.membership_tier || (row.email?.toLowerCase() === "patreshubham141@gmail.com" ? "FOUNDING_MEMBER" : "MEMBER"),
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
    const { action, userId, role, reason, memberId, isFoundingMember } = body;

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

    if (action === "update_member_id") {
      const cleanMemberId = String(memberId || "").trim().toUpperCase();
      if (!cleanMemberId) {
        return NextResponse.json({ error: "Member ID cannot be empty" }, { status: 400 });
      }

      await sql`
        INSERT INTO professional_profiles (id, user_id, member_id, created_at, updated_at)
        VALUES (gen_random_uuid()::text, ${userId}, ${cleanMemberId}, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET member_id = ${cleanMemberId}, updated_at = NOW()
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "user.member_id_updated",
        entityType: "user",
        entityId: userId,
        newState: { member_id: cleanMemberId },
        reason: reason || "Admin manual update",
      });

      return NextResponse.json({ success: true, message: `Member ID updated to ${cleanMemberId}` });
    }

    if (action === "toggle_founding_member") {
      const isFounder = Boolean(isFoundingMember);
      const tier = isFounder ? "FOUNDING_MEMBER" : "MEMBER";

      await sql`
        INSERT INTO professional_profiles (id, user_id, is_founding_member, membership_tier, created_at, updated_at)
        VALUES (gen_random_uuid()::text, ${userId}, ${isFounder}, ${tier}, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET is_founding_member = ${isFounder},
            membership_tier = ${tier},
            updated_at = NOW()
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "user.founding_status_updated",
        entityType: "user",
        entityId: userId,
        newState: { is_founding_member: isFounder, membership_tier: tier },
        reason: reason || "Admin toggle founding status",
      });

      return NextResponse.json({ success: true, message: `Founding member status updated to ${isFounder}` });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error modifying user:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
