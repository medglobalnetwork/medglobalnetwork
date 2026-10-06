import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import { generateAdminId } from "@/modules/admin/lib/admin-db";
import {
  banUserAccount,
  suspendUserAccount,
  holdUserAccount,
  activateUserAccount,
  deleteUserAccountPermanently,
  ensureUserManagementSchema,
} from "@/modules/admin/lib/user-management";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "users.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission users.read required." }, { status: 403 });
    }

    await ensureUserManagementSchema();

    // Fetch users joined with professional profiles, identities and admin roles
    const usersRes: any = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u."emailVerified",
        u.image,
        u."createdAt",
        COALESCE(u.status, 'active') as account_status,
        u.status_reason,
        COALESCE(u.banned, FALSE) as is_banned,
        mi.verification_status,
        mi.rejection_reason,
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
      LEFT JOIN mgn_identities mi ON mi.user_id = u.id
      ORDER BY u."createdAt" DESC
      LIMIT 300
    `.execute(database);

    const users = (usersRes?.rows || []).map((row: any) => {
      // Determine overall user governance status
      let effectiveStatus = (row.account_status || "active").toUpperCase();
      if (row.is_banned || effectiveStatus === "BANNED" || row.verification_status === "BANNED") {
        effectiveStatus = "BANNED";
      } else if (effectiveStatus === "SUSPENDED" || row.verification_status === "SUSPENDED" || row.verification_status === "RESTRICTED") {
        effectiveStatus = "SUSPENDED";
      } else if (effectiveStatus === "ON_HOLD" || row.verification_status === "ON_HOLD") {
        effectiveStatus = "ON_HOLD";
      } else if (row.verification_status === "REJECTED") {
        effectiveStatus = "REJECTED";
      } else if (row.registration_verified) {
        effectiveStatus = "VERIFIED";
      } else if (row.verification_status === "ENROLLED") {
        effectiveStatus = "ENROLLED";
      } else {
        effectiveStatus = "ACTIVE";
      }

      return {
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
        accountStatus: effectiveStatus,
        verificationStatus: row.verification_status || "DRAFT",
        statusReason: row.status_reason || row.rejection_reason || null,
        status: effectiveStatus.toLowerCase(),
      };
    });

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
    const { action, userId, role, reason, memberId, isFoundingMember, type, value } = body;

    // 1. Account Moderation & Governance Actions
    if (action === "ban_user" || action === "ban") {
      const result = await banUserAccount(admin, userId, reason || "Banned by administrator");
      return NextResponse.json(result);
    }

    if (action === "suspend_user" || action === "restrict_user" || action === "suspend") {
      const result = await suspendUserAccount(admin, userId, reason || "Suspended by administrator");
      return NextResponse.json(result);
    }

    if (action === "hold_user" || action === "hold") {
      const result = await holdUserAccount(admin, userId, reason || "Placed on administrative hold");
      return NextResponse.json(result);
    }

    if (action === "activate_user" || action === "unban_user" || action === "activate") {
      const result = await activateUserAccount(admin, userId, reason || "Re-activated by administrator");
      return NextResponse.json(result);
    }

    if (action === "delete_user") {
      if (!admin.isSuperAdmin && !hasPermission(admin, "users.delete")) {
        return NextResponse.json({ error: "Forbidden. users.delete permission required." }, { status: 403 });
      }
      const result = await deleteUserAccountPermanently(admin, userId, reason || "Deleted by administrator");
      return NextResponse.json(result);
    }

    // 2. Role Assignment Actions
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

    // 3. Verification & Profile Updates
    if (action === "update_verification" || action === "toggle_verification") {
      const col =
        type === "identity"
          ? "identity_verified"
          : type === "registration"
          ? "registration_verified"
          : "education_verified";

      await sql`
        UPDATE professional_profiles
        SET ${sql.raw(col)} = ${Boolean(value)}, updated_at = NOW()
        WHERE user_id = ${userId}
      `.execute(database);

      if (value) {
        // Synchronize canonical mgn_identities and user status to APPROVED
        await sql`
          INSERT INTO mgn_identities (id, user_id, account_type, category, profession_or_type, verification_status, onboarding_step, created_at, updated_at)
          VALUES (gen_random_uuid()::text, ${userId}, 'INDIVIDUAL', 'clinical_practitioner', 'general_physician', 'APPROVED', 6, NOW(), NOW())
          ON CONFLICT (user_id) DO UPDATE
          SET verification_status = 'APPROVED', onboarding_step = 6, rejection_reason = NULL, correction_reason = NULL, updated_at = NOW()
        `.execute(database);

        await sql`
          UPDATE "user"
          SET status = 'active', banned = FALSE, "updatedAt" = NOW()
          WHERE id = ${userId}
        `.execute(database);
      } else {
        const checkRes: any = await sql`
          SELECT registration_verified, identity_verified FROM professional_profiles WHERE user_id = ${userId}
        `.execute(database);
        const hasOtherVerif = Boolean(checkRes?.rows?.[0]?.registration_verified || checkRes?.rows?.[0]?.identity_verified);
        if (!hasOtherVerif) {
          await sql`
            UPDATE mgn_identities
            SET verification_status = 'ENROLLED', updated_at = NOW()
            WHERE user_id = ${userId}
          `.execute(database);
        }
      }

      await recordAuditLog({
        admin,
        action: `verification.${type}_toggled`,
        entityType: "professional_profile",
        entityId: userId,
        newState: { [col]: value },
        reason,
      });

      return NextResponse.json({ success: true, message: `Updated ${type} verification to ${value}` });
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
        entityType: "professional_profile",
        entityId: userId,
        newState: { member_id: cleanMemberId },
        reason: reason || "Admin manual update",
      });

      return NextResponse.json({ success: true, message: `Member ID updated to ${cleanMemberId}` });
    }

    if (action === "toggle_founding_member" || action === "update_founding_status") {
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
        entityType: "professional_profile",
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
