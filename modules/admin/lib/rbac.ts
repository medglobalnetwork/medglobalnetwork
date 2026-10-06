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

import { serverConfig } from "@/lib/env";

const superAdminEmails = new Set(serverConfig.adminEmails);
const superAdminPhones = new Set(serverConfig.adminPhones);

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

    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;
    const email = (session.user.email || "").toLowerCase().trim();
    const sessionPhone = ((session.user as any)?.phone || "").toString().trim();
    let isSuperAdminFallback =
      superAdminEmails.has(email) ||
      email === "patreshubham141@gmail.com" ||
      email === "patresweeti@gmail.com";

    // Helper to test if a phone number string matches any super admin phone
    const matchesAdminPhone = (raw: string | null | undefined): boolean => {
      if (!raw) return false;
      const digits = raw.replace(/\D/g, "");
      if (!digits) return false;
      if (digits === "6263585180" || digits === "7987522275") return true;
      if (digits.endsWith("6263585180") || digits.endsWith("7987522275")) return true;
      if (superAdminPhones.has(digits) || superAdminPhones.has(digits.slice(-10))) return true;
      for (const p of superAdminPhones) {
        if (p.slice(-10) === digits.slice(-10) || digits.endsWith(p)) return true;
      }
      return false;
    };

    if (matchesAdminPhone(sessionPhone)) {
      isSuperAdminFallback = true;
    }

    // Also check phone numbers or phone emails (phone_9876543210@mgn.life)
    if (email.startsWith("phone_") || email.includes("@mgn.life")) {
      if (matchesAdminPhone(email)) {
        isSuperAdminFallback = true;
      }
    }

    // Check user table and identities for phone and admin role safely
    try {
      const uRes: any = await sql`
        SELECT u.id, u.email, u.phone as u_phone, mi.phone as mi_phone
        FROM "user" u
        LEFT JOIN mgn_identities mi ON mi.user_id = u.id
        WHERE u.id = ${userId} LIMIT 1
      `.execute(database);

      if (uRes?.rows?.[0]) {
        const row = uRes.rows[0];
        if (matchesAdminPhone(row.u_phone) || matchesAdminPhone(row.mi_phone)) {
          isSuperAdminFallback = true;
        }
        if (
          row.email &&
          (row.email.toLowerCase() === "patreshubham141@gmail.com" ||
            row.email.toLowerCase() === "patresweeti@gmail.com" ||
            superAdminEmails.has(row.email.toLowerCase()))
        ) {
          isSuperAdminFallback = true;
        }
      }
    } catch {}

    // Check role column separately if present
    try {
      const roleColRes: any = await sql`
        SELECT role FROM "user" WHERE id = ${userId} LIMIT 1
      `.execute(database);
      if (roleColRes?.rows?.[0]?.role) {
        const r = String(roleColRes.rows[0].role).toLowerCase();
        if (r === "admin" || r === "superadmin" || r === "super_admin") {
          isSuperAdminFallback = true;
        }
      }
    } catch {}

    // Fetch roles from admin_user_roles table
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
      // Auto persist in admin_user_roles table for consistent RBAC queries
      try {
        await sql`
          INSERT INTO admin_user_roles (id, user_id, user_email, role, granted_by, notes)
          VALUES (gen_random_uuid()::text, ${userId}, ${email || `${userId}@mgn.life`}, 'SUPER_ADMIN', 'SYSTEM_SUPERADMIN', 'System designated Super Admin')
          ON CONFLICT (user_id, role) DO NOTHING
        `.execute(database);
      } catch {}
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
