import { database } from "@/lib/auth";
import { sql } from "kysely";
import { AdminSessionContext } from "./rbac";
import { recordAuditLog } from "./audit";
import { ensureVerificationTables } from "@/modules/onboarding/lib/verification-db";
import { ensureAdminTables } from "./admin-db";

export type UserAccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | "ON_HOLD" | "RESTRICTED";

export async function ensureUserManagementSchema() {
  await ensureAdminTables();
  await ensureVerificationTables();
  try {
    await sql`
      ALTER TABLE "user" ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active';
      ALTER TABLE "user" ADD COLUMN IF NOT EXISTS status_reason TEXT;
      ALTER TABLE "user" ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;
    `.execute(database);
  } catch {}
}

/**
 * Bans a user account permanently or with a specified reason.
 * Kicks all active sessions immediately.
 */
export async function banUserAccount(
  admin: AdminSessionContext,
  userId: string,
  reason = "Account banned by Platform Administrator"
) {
  await ensureUserManagementSchema();

  // Protect superadmins from being banned
  const targetUserRes: any = await sql`
    SELECT id, email, role FROM "user" WHERE id = ${userId} LIMIT 1
  `.execute(database);

  const target = targetUserRes?.rows?.[0];
  if (!target) throw new Error("Target user not found");

  if (
    target.email?.toLowerCase() === "patreshubham141@gmail.com" ||
    target.email?.toLowerCase() === "patresweeti@gmail.com"
  ) {
    throw new Error("Cannot ban a Root Super Administrator");
  }

  const now = new Date();

  // 1. Update user table
  await sql`
    UPDATE "user"
    SET status = 'banned', status_reason = ${reason}, banned = TRUE, "updatedAt" = NOW()
    WHERE id = ${userId}
  `.execute(database);

  // 2. Update mgn_identities table
  await sql`
    UPDATE mgn_identities
    SET verification_status = 'BANNED', rejection_reason = ${reason}, updated_at = NOW()
    WHERE user_id = ${userId}
  `.execute(database);

  // 3. Invalidate all active sessions to immediately kick the user off
  await sql`
    DELETE FROM session WHERE "userId" = ${userId}
  `.execute(database);

  // 4. Record audit log
  await recordAuditLog({
    admin,
    action: "user.banned",
    entityType: "user",
    entityId: userId,
    previousState: { status: target.status || "active" },
    newState: { status: "banned", reason },
    reason,
  });

  return { success: true, message: "User account banned and sessions terminated." };
}

/**
 * Suspends or restricts a user account temporarily.
 * Kicks active sessions and locks them out of platform feed.
 */
export async function suspendUserAccount(
  admin: AdminSessionContext,
  userId: string,
  reason = "Account suspended by Platform Administrator"
) {
  await ensureUserManagementSchema();

  const targetUserRes: any = await sql`
    SELECT id, email, role FROM "user" WHERE id = ${userId} LIMIT 1
  `.execute(database);

  const target = targetUserRes?.rows?.[0];
  if (!target) throw new Error("Target user not found");

  if (
    target.email?.toLowerCase() === "patreshubham141@gmail.com" ||
    target.email?.toLowerCase() === "patresweeti@gmail.com"
  ) {
    throw new Error("Cannot suspend a Root Super Administrator");
  }

  // 1. Update user table
  await sql`
    UPDATE "user"
    SET status = 'suspended', status_reason = ${reason}, "updatedAt" = NOW()
    WHERE id = ${userId}
  `.execute(database);

  // 2. Update mgn_identities table
  await sql`
    UPDATE mgn_identities
    SET verification_status = 'SUSPENDED', rejection_reason = ${reason}, updated_at = NOW()
    WHERE user_id = ${userId}
  `.execute(database);

  // 3. Invalidate active sessions
  await sql`
    DELETE FROM session WHERE "userId" = ${userId}
  `.execute(database);

  // 4. Record audit log
  await recordAuditLog({
    admin,
    action: "user.suspended",
    entityType: "user",
    entityId: userId,
    previousState: { status: target.status || "active" },
    newState: { status: "suspended", reason },
    reason,
  });

  return { success: true, message: "User account suspended successfully." };
}

/**
 * Puts an account on Administrative Hold (under review / audit).
 */
export async function holdUserAccount(
  admin: AdminSessionContext,
  userId: string,
  reason = "Account placed on administrative hold"
) {
  await ensureUserManagementSchema();

  const targetUserRes: any = await sql`
    SELECT id, email, role FROM "user" WHERE id = ${userId} LIMIT 1
  `.execute(database);

  const target = targetUserRes?.rows?.[0];
  if (!target) throw new Error("Target user not found");

  // 1. Update user table
  await sql`
    UPDATE "user"
    SET status = 'on_hold', status_reason = ${reason}, "updatedAt" = NOW()
    WHERE id = ${userId}
  `.execute(database);

  // 2. Update mgn_identities table
  await sql`
    UPDATE mgn_identities
    SET verification_status = 'ON_HOLD', rejection_reason = ${reason}, updated_at = NOW()
    WHERE user_id = ${userId}
  `.execute(database);

  // 3. Invalidate active sessions
  await sql`
    DELETE FROM session WHERE "userId" = ${userId}
  `.execute(database);

  // 4. Record audit log
  await recordAuditLog({
    admin,
    action: "user.placed_on_hold",
    entityType: "user",
    entityId: userId,
    previousState: { status: target.status || "active" },
    newState: { status: "on_hold", reason },
    reason,
  });

  return { success: true, message: "User account placed on administrative hold." };
}

/**
 * Re-activates / Unbans / Restores a user account to active status.
 */
export async function activateUserAccount(
  admin: AdminSessionContext,
  userId: string,
  reason = "Account restored and re-activated by Platform Administrator"
) {
  await ensureUserManagementSchema();

  const targetUserRes: any = await sql`
    SELECT id, email, role FROM "user" WHERE id = ${userId} LIMIT 1
  `.execute(database);

  const target = targetUserRes?.rows?.[0];
  if (!target) throw new Error("Target user not found");

  // Check existing identity to see if they were approved before
  const idRes: any = await sql`
    SELECT registration_verified, identity_verified FROM professional_profiles WHERE user_id = ${userId} LIMIT 1
  `.execute(database);

  const isVerified = Boolean(idRes?.rows?.[0]?.registration_verified || idRes?.rows?.[0]?.identity_verified);
  const targetStatus = isVerified ? "APPROVED" : "ENROLLED";

  // 1. Update user table
  await sql`
    UPDATE "user"
    SET status = 'active', status_reason = NULL, banned = FALSE, "updatedAt" = NOW()
    WHERE id = ${userId}
  `.execute(database);

  // 2. Update mgn_identities table
  await sql`
    UPDATE mgn_identities
    SET verification_status = ${targetStatus}, rejection_reason = NULL, updated_at = NOW()
    WHERE user_id = ${userId}
  `.execute(database);

  // 3. Record audit log
  await recordAuditLog({
    admin,
    action: "user.activated",
    entityType: "user",
    entityId: userId,
    previousState: { status: target.status || "inactive" },
    newState: { status: "active", verification_status: targetStatus },
    reason,
  });

  return { success: true, message: "User account activated and restored successfully." };
}

/**
 * Permanently deletes a user account and all associated relational dossiers.
 */
export async function deleteUserAccountPermanently(
  admin: AdminSessionContext,
  userId: string,
  reason = "Account permanently deleted by Platform Administrator"
) {
  await ensureUserManagementSchema();

  const targetUserRes: any = await sql`
    SELECT id, name, email, role FROM "user" WHERE id = ${userId} LIMIT 1
  `.execute(database);

  const target = targetUserRes?.rows?.[0];
  if (!target) throw new Error("Target user not found");

  if (target.id === admin.userId) {
    throw new Error("You cannot delete your own Administrator account while logged in.");
  }

  if (
    target.email?.toLowerCase() === "patreshubham141@gmail.com" ||
    target.email?.toLowerCase() === "patresweeti@gmail.com"
  ) {
    throw new Error("Root Super Administrator accounts cannot be deleted.");
  }

  // 1. Delete user sessions & auth tokens
  try {
    await sql`DELETE FROM session WHERE "userId" = ${userId}`.execute(database);
  } catch {}

  try {
    await sql`DELETE FROM account WHERE "userId" = ${userId}`.execute(database);
  } catch {}

  // 2. Delete admin roles
  try {
    await sql`DELETE FROM admin_user_roles WHERE user_id = ${userId}`.execute(database);
  } catch {}

  // 3. Delete verification documents & KYC dossiers
  try {
    await sql`DELETE FROM mgn_verification_documents WHERE user_id = ${userId}`.execute(database);
  } catch {}
  try {
    await sql`DELETE FROM mgn_professional_titles WHERE user_id = ${userId}`.execute(database);
  } catch {}
  try {
    await sql`DELETE FROM mgn_qualifications WHERE user_id = ${userId}`.execute(database);
  } catch {}
  try {
    await sql`DELETE FROM mgn_registrations WHERE user_id = ${userId}`.execute(database);
  } catch {}
  try {
    await sql`DELETE FROM mgn_organisation_identities WHERE user_id = ${userId}`.execute(database);
  } catch {}
  try {
    await sql`DELETE FROM mgn_identities WHERE user_id = ${userId}`.execute(database);
  } catch {}

  // 4. Delete profile and social metadata
  try {
    await sql`DELETE FROM professional_profiles WHERE user_id = ${userId}`.execute(database);
  } catch {}

  // 5. Delete from user table
  await sql`DELETE FROM "user" WHERE id = ${userId}`.execute(database);

  // 6. Record immutable audit log
  await recordAuditLog({
    admin,
    action: "user.deleted_permanently",
    entityType: "user",
    entityId: userId,
    previousState: { id: target.id, name: target.name, email: target.email },
    newState: { deleted: true },
    reason,
  });

  return { success: true, message: `Account for ${target.name || target.email} was permanently deleted.` };
}
