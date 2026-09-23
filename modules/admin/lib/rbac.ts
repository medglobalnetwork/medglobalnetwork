// ============================================================
// MGN Admin RBAC (Role-Based Access Control) Engine
// modules/admin/lib/rbac.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { ensureAdminTables } from "./admin-db";

export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "VERIFICATION_ADMIN"
  | "CONTENT_ADMIN"
  | "RECRUITMENT_ADMIN"
  | "LEARN_ADMIN"
  | "SUPPORT_ADMIN"
  | "ANALYTICS_VIEWER";

export type AdminPermission =
  // Wildcard
  | "*"
  // Users & Profiles
  | "users.read"
  | "users.write"
  | "users.suspend"
  | "users.delete"
  // Verification
  | "verification.read"
  | "verification.approve"
  | "verification.reject"
  // Content & Moderation
  | "moderation.read"
  | "moderation.action"
  | "posts.delete"
  | "stories.delete"
  | "comments.delete"
  | "communities.manage"
  // Learn & LMS
  | "courses.read"
  | "courses.write"
  | "courses.publish"
  | "certificates.issue"
  | "certificates.revoke"
  // Opportunities & Recruitment
  | "jobs.read"
  | "jobs.write"
  | "jobs.approve"
  | "organizations.verify"
  // Events, Camps & Research
  | "events.read"
  | "events.approve"
  | "camps.read"
  | "camps.approve"
  | "research.read"
  | "research.approve"
  // Analytics
  | "analytics.read"
  | "analytics.export"
  // Audit Logs
  | "audit.read"
  // System Settings & RBAC
  | "settings.read"
  | "settings.write"
  | "rbac.manage";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "users.read",
    "users.write",
    "users.suspend",
    "verification.read",
    "verification.approve",
    "verification.reject",
    "moderation.read",
    "moderation.action",
    "posts.delete",
    "stories.delete",
    "comments.delete",
    "communities.manage",
    "courses.read",
    "courses.write",
    "courses.publish",
    "certificates.issue",
    "certificates.revoke",
    "jobs.read",
    "jobs.write",
    "jobs.approve",
    "organizations.verify",
    "events.read",
    "events.approve",
    "camps.read",
    "camps.approve",
    "research.read",
    "research.approve",
    "analytics.read",
    "analytics.export",
    "audit.read",
    "settings.read",
    "settings.write",
  ],
  VERIFICATION_ADMIN: [
    "users.read",
    "verification.read",
    "verification.approve",
    "verification.reject",
    "audit.read",
  ],
  CONTENT_ADMIN: [
    "users.read",
    "moderation.read",
    "moderation.action",
    "posts.delete",
    "stories.delete",
    "comments.delete",
    "communities.manage",
    "audit.read",
  ],
  RECRUITMENT_ADMIN: [
    "users.read",
    "jobs.read",
    "jobs.write",
    "jobs.approve",
    "organizations.verify",
    "analytics.read",
    "audit.read",
  ],
  LEARN_ADMIN: [
    "users.read",
    "courses.read",
    "courses.write",
    "courses.publish",
    "certificates.issue",
    "certificates.revoke",
    "analytics.read",
    "audit.read",
  ],
  SUPPORT_ADMIN: [
    "users.read",
    "verification.read",
    "moderation.read",
    "audit.read",
  ],
  ANALYTICS_VIEWER: [
    "analytics.read",
    "courses.read",
    "jobs.read",
  ],
};

const superAdminEmails = new Set(
  (process.env.ADMIN_EMAILS || "patreshubham141@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export interface AdminSessionContext {
  userId: string;
  email: string;
  name: string;
  roles: AdminRole[];
  permissions: AdminPermission[];
  isSuperAdmin: boolean;
}

export async function getAdminSession(reqHeaders?: Headers): Promise<AdminSessionContext | null> {
  try {
    await ensureAdminTables();
    const h = reqHeaders || (await headers());
    const session = await auth.api.getSession({ headers: h });

    if (!session?.user?.email) {
      return null;
    }

    const email = session.user.email.toLowerCase();
    const userId = session.user.id;
    const isSuperAdminFallback = superAdminEmails.has(email);

    // Fetch roles from database
    let dbRoles: AdminRole[] = [];
    try {
      const rolesRes: any = await sql`
        SELECT role FROM admin_user_roles WHERE user_id = ${userId} OR LOWER(user_email) = ${email}
      `.execute(database);

      if (rolesRes?.rows) {
        dbRoles = rolesRes.rows.map((r: any) => r.role as AdminRole);
      }
    } catch (err) {
      // table might not be queryable yet or network error
    }

    if (isSuperAdminFallback && !dbRoles.includes("SUPER_ADMIN")) {
      dbRoles.push("SUPER_ADMIN");
    }

    if (dbRoles.length === 0) {
      return null;
    }

    const isSuperAdmin = dbRoles.includes("SUPER_ADMIN") || isSuperAdminFallback;

    // Aggregate permissions
    const permissionsSet = new Set<AdminPermission>();
    if (isSuperAdmin) {
      permissionsSet.add("*");
    } else {
      for (const r of dbRoles) {
        const perms = ROLE_PERMISSIONS[r] || [];
        perms.forEach((p) => permissionsSet.add(p));
      }
    }

    return {
      userId,
      email,
      name: session.user.name || "Administrator",
      roles: dbRoles,
      permissions: Array.from(permissionsSet),
      isSuperAdmin,
    };
  } catch (error) {
    console.error("Error evaluating admin session:", error);
    return null;
  }
}

export function hasPermission(
  adminSession: AdminSessionContext | null,
  requiredPermission: AdminPermission,
): boolean {
  if (!adminSession) return false;
  if (adminSession.isSuperAdmin || adminSession.permissions.includes("*")) return true;
  return adminSession.permissions.includes(requiredPermission);
}

export async function requireAdminPermission(
  requiredPermission: AdminPermission,
  reqHeaders?: Headers,
): Promise<AdminSessionContext> {
  const admin = await getAdminSession(reqHeaders);
  if (!admin) {
    throw new Error("UNAUTHORIZED_NOT_ADMIN");
  }
  if (!hasPermission(admin, requiredPermission)) {
    throw new Error(`FORBIDDEN_PERMISSION_REQUIRED: ${requiredPermission}`);
  }
  return admin;
}
