import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import {
  banUserAccount,
  suspendUserAccount,
  holdUserAccount,
  activateUserAccount,
  deleteUserAccountPermanently,
} from "@/modules/admin/lib/user-management";

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
        COALESCE(u.status, 'active') as user_status,
        u.status_reason,
        COALESCE(u.banned, FALSE) as is_banned,
        mi.verification_status,
        mi.rejection_reason,
        pp.*
      FROM "user" u
      LEFT JOIN professional_profiles pp ON pp.user_id = u.id
      LEFT JOIN mgn_identities mi ON mi.user_id = u.id
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
      ORDER BY created_at DESC LIMIT 25
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
    if (!admin || (!hasPermission(admin, "users.write") && !hasPermission(admin, "users.suspend"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, reason, updates } = body;

    // 1. Account Moderation Actions
    if (action === "ban_user" || action === "ban") {
      const result = await banUserAccount(admin, id, reason || "Banned by administrator");
      return NextResponse.json(result);
    }

    if (action === "suspend_user" || action === "restrict_user" || action === "suspend") {
      const result = await suspendUserAccount(admin, id, reason || "Suspended by administrator");
      return NextResponse.json(result);
    }

    if (action === "hold_user" || action === "hold") {
      const result = await holdUserAccount(admin, id, reason || "Placed on administrative hold");
      return NextResponse.json(result);
    }

    if (action === "activate_user" || action === "unban_user" || action === "activate") {
      const result = await activateUserAccount(admin, id, reason || "Re-activated by administrator");
      return NextResponse.json(result);
    }

    if (action === "delete_user") {
      if (!admin.isSuperAdmin && !hasPermission(admin, "users.delete")) {
        return NextResponse.json({ error: "Forbidden. users.delete permission required." }, { status: 403 });
      }
      const result = await deleteUserAccountPermanently(admin, id, reason || "Deleted by administrator");
      return NextResponse.json(result);
    }

    // 2. Profile & Verification Actions
    if (action === "toggle_verification" || action === "update_verification") {
      const { type, value } = updates || body; // type: 'identity' | 'registration' | 'education'
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

      if (value) {
        // Synchronize canonical mgn_identities and user status to APPROVED
        await sql`
          INSERT INTO mgn_identities (id, user_id, account_type, category, profession_or_type, verification_status, onboarding_step, created_at, updated_at)
          VALUES (gen_random_uuid()::text, ${id}, 'INDIVIDUAL', 'clinical_practitioner', 'general_physician', 'APPROVED', 6, NOW(), NOW())
          ON CONFLICT (user_id) DO UPDATE
          SET verification_status = 'APPROVED', onboarding_step = 6, rejection_reason = NULL, correction_reason = NULL, updated_at = NOW()
        `.execute(database);

        await sql`
          UPDATE "user"
          SET status = 'active', banned = FALSE, "updatedAt" = NOW()
          WHERE id = ${id}
        `.execute(database);
      } else {
        const checkRes: any = await sql`
          SELECT registration_verified, identity_verified FROM professional_profiles WHERE user_id = ${id}
        `.execute(database);
        const hasOtherVerif = Boolean(checkRes?.rows?.[0]?.registration_verified || checkRes?.rows?.[0]?.identity_verified);
        if (!hasOtherVerif) {
          await sql`
            UPDATE mgn_identities
            SET verification_status = 'ENROLLED', updated_at = NOW()
            WHERE user_id = ${id}
          `.execute(database);
        }
      }

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

    if (action === "update_member_id") {
      const cleanMemberId = String(updates?.memberId || updates?.member_id || body.memberId || "").trim().toUpperCase();
      if (!cleanMemberId) {
        return NextResponse.json({ error: "Member ID cannot be empty" }, { status: 400 });
      }

      await sql`
        INSERT INTO professional_profiles (id, user_id, member_id, created_at, updated_at)
        VALUES (gen_random_uuid()::text, ${id}, ${cleanMemberId}, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET member_id = ${cleanMemberId}, updated_at = NOW()
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "user.member_id_updated",
        entityType: "professional_profile",
        entityId: id,
        newState: { member_id: cleanMemberId },
        reason: reason || "Admin manual update",
      });

      return NextResponse.json({ success: true, message: `Member ID updated to ${cleanMemberId}` });
    }

    if (action === "toggle_founding_member" || action === "update_founding_status") {
      const isFounder = Boolean(updates?.isFoundingMember ?? updates?.is_founding_member ?? body.isFounding ?? body.isFoundingMember);
      const tier = isFounder ? "FOUNDING_MEMBER" : "MEMBER";

      await sql`
        INSERT INTO professional_profiles (id, user_id, is_founding_member, membership_tier, created_at, updated_at)
        VALUES (gen_random_uuid()::text, ${id}, ${isFounder}, ${tier}, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET is_founding_member = ${isFounder},
            membership_tier = ${tier},
            updated_at = NOW()
      `.execute(database);

      await recordAuditLog({
        admin,
        action: "user.founding_status_updated",
        entityType: "professional_profile",
        entityId: id,
        newState: { is_founding_member: isFounder, membership_tier: tier },
        reason: reason || "Admin toggle founding status",
      });

      return NextResponse.json({ success: true, message: `Founding status updated to ${isFounder}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || (!admin.isSuperAdmin && !hasPermission(admin, "users.delete"))) {
      return NextResponse.json({ error: "Forbidden. users.delete permission required." }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    let reason = searchParams.get("reason") || "Deleted by Platform Administrator";

    try {
      const body = await req.json();
      if (body?.reason) reason = body.reason;
    } catch {}

    const result = await deleteUserAccountPermanently(admin, id, reason);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
