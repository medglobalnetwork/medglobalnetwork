// ============================================================
// MGN Organisation Feature Entitlement & Limit Engine
// modules/organizations/lib/org-entitlements.ts
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import { ensureOrgTables } from "./org-db";
import { PLAN_LIMITS, SubscriptionPlan, SubscriptionStatus } from "../types";

const db = database as any;

export interface EntitlementCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage: number;
  limit: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
}

export class OrgEntitlementService {
  /**
   * Retrieves active subscription for an organization or initializes default Basic plan
   */
  static async getSubscription(organizationId: string): Promise<{
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    current_period_end: Date;
    grace_period_end: Date | null;
  }> {
    await ensureOrgTables();

    const sub = await db
      .selectFrom("organization_subscriptions")
      .select(["plan", "status", "current_period_end", "grace_period_end"])
      .where("organization_id", "=", organizationId)
      .executeTakeFirst();

    if (!sub) {
      // Auto-provision basic plan
      try {
        await sql`
          INSERT INTO organization_subscriptions (id, organization_id, plan, status, billing_cycle, current_period_start, current_period_end, price_amount)
          VALUES (gen_random_uuid()::TEXT, ${organizationId}, 'Basic', 'ACTIVE', 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '365 days', 0)
          ON CONFLICT (organization_id) DO NOTHING
        `.execute(db);
      } catch {
        // ignore conflict
      }
      return {
        plan: "Basic",
        status: "ACTIVE",
        current_period_end: new Date(Date.now() + 365 * 86400000),
        grace_period_end: null,
      };
    }

    // Check expiration and grace period
    const now = new Date();
    const periodEnd = new Date(sub.current_period_end);
    let status: SubscriptionStatus = sub.status as SubscriptionStatus;

    if (now > periodEnd && status === "ACTIVE") {
      const graceEnd = sub.grace_period_end ? new Date(sub.grace_period_end) : new Date(periodEnd.getTime() + 7 * 86400000);
      if (now < graceEnd) {
        status = "GRACE_PERIOD";
      } else {
        status = "EXPIRED";
      }
      // Update in DB asynchronously
      sql`UPDATE organization_subscriptions SET status = ${status} WHERE organization_id = ${organizationId}`.execute(db).catch(() => {});
    }

    return {
      plan: (sub.plan as SubscriptionPlan) || "Basic",
      status,
      current_period_end: periodEnd,
      grace_period_end: sub.grace_period_end ? new Date(sub.grace_period_end) : null,
    };
  }

  static async canCreateJob(organizationId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(organizationId);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.Basic;

    if (sub.status === "EXPIRED") {
      return {
        allowed: false,
        reason: "Organisation subscription has expired. Please upgrade or renew your plan to post new jobs.",
        currentUsage: 0,
        limit: limits.maxActiveJobs,
        plan: sub.plan,
        status: sub.status,
      };
    }

    const countRes = await sql<{ count: string }>`
      SELECT COUNT(*) as count FROM jobs WHERE organization_id = ${organizationId} AND status IN ('published', 'draft', 'review')
    `.execute(db);
    const currentUsage = parseInt(countRes.rows[0]?.count || "0", 10);

    const allowed = currentUsage < limits.maxActiveJobs;
    return {
      allowed,
      reason: allowed ? undefined : `Active job limit reached (${currentUsage}/${limits.maxActiveJobs}) on ${sub.plan} plan. Upgrade plan to create more jobs.`,
      currentUsage,
      limit: limits.maxActiveJobs,
      plan: sub.plan,
      status: sub.status,
    };
  }

  static async canCreateEvent(organizationId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(organizationId);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.Basic;

    if (sub.status === "EXPIRED") {
      return {
        allowed: false,
        reason: "Subscription expired. Please renew to host new events.",
        currentUsage: 0,
        limit: limits.maxEventsPerMonth,
        plan: sub.plan,
        status: sub.status,
      };
    }

    const countRes = await sql<{ count: string }>`
      SELECT COUNT(*) as count FROM events
      WHERE organization_id = ${organizationId}
      AND created_at >= date_trunc('month', CURRENT_DATE)
    `.execute(db);
    const currentUsage = parseInt(countRes.rows[0]?.count || "0", 10);

    const allowed = currentUsage < limits.maxEventsPerMonth;
    return {
      allowed,
      reason: allowed ? undefined : `Monthly event limit reached (${currentUsage}/${limits.maxEventsPerMonth}) on ${sub.plan} plan. Upgrade to host more events.`,
      currentUsage,
      limit: limits.maxEventsPerMonth,
      plan: sub.plan,
      status: sub.status,
    };
  }

  static async canCreateConference(organizationId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(organizationId);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.Basic;

    if (limits.maxConferencesPerYear === 0) {
      return {
        allowed: false,
        reason: `Conferences are not included in the ${sub.plan} plan. Upgrade to Professional, Business, or Enterprise to create multi-track conferences.`,
        currentUsage: 0,
        limit: 0,
        plan: sub.plan,
        status: sub.status,
      };
    }

    if (sub.status === "EXPIRED") {
      return {
        allowed: false,
        reason: "Subscription expired. Please renew.",
        currentUsage: 0,
        limit: limits.maxConferencesPerYear,
        plan: sub.plan,
        status: sub.status,
      };
    }

    const countRes = await sql<{ count: string }>`
      SELECT COUNT(*) as count FROM organization_conferences
      WHERE organization_id = ${organizationId}
      AND created_at >= date_trunc('year', CURRENT_DATE)
    `.execute(db);
    const currentUsage = parseInt(countRes.rows[0]?.count || "0", 10);

    const allowed = currentUsage < limits.maxConferencesPerYear;
    return {
      allowed,
      reason: allowed ? undefined : `Yearly conference limit reached (${currentUsage}/${limits.maxConferencesPerYear}). Upgrade your plan.`,
      currentUsage,
      limit: limits.maxConferencesPerYear,
      plan: sub.plan,
      status: sub.status,
    };
  }

  static async canCreateCamp(organizationId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(organizationId);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.Basic;

    if (sub.status === "EXPIRED") {
      return {
        allowed: false,
        reason: "Subscription expired. Please renew.",
        currentUsage: 0,
        limit: limits.maxCampsPerMonth,
        plan: sub.plan,
        status: sub.status,
      };
    }

    const countRes = await sql<{ count: string }>`
      SELECT COUNT(*) as count FROM camps
      WHERE organization_id = ${organizationId}
      AND created_at >= date_trunc('month', CURRENT_DATE)
    `.execute(db);
    const currentUsage = parseInt(countRes.rows[0]?.count || "0", 10);

    const allowed = currentUsage < limits.maxCampsPerMonth;
    return {
      allowed,
      reason: allowed ? undefined : `Monthly health camp limit reached (${currentUsage}/${limits.maxCampsPerMonth}) on ${sub.plan} plan.`,
      currentUsage,
      limit: limits.maxCampsPerMonth,
      plan: sub.plan,
      status: sub.status,
    };
  }

  static async canInviteMember(organizationId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(organizationId);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.Basic;

    const countRes = await sql<{ count: string }>`
      SELECT COUNT(*) as count FROM organization_members WHERE organization_id = ${organizationId}
    `.execute(db);
    const currentUsage = parseInt(countRes.rows[0]?.count || "0", 10);

    const allowed = currentUsage < limits.maxMembers;
    return {
      allowed,
      reason: allowed ? undefined : `Member limit reached (${currentUsage}/${limits.maxMembers}) on ${sub.plan} plan. Upgrade to invite more team members.`,
      currentUsage,
      limit: limits.maxMembers,
      plan: sub.plan,
      status: sub.status,
    };
  }

  static async canCreateCourse(organizationId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(organizationId);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.Basic;

    if (sub.status === "EXPIRED") {
      return {
        allowed: false,
        reason: "Subscription expired. Please renew.",
        currentUsage: 0,
        limit: limits.maxCourses,
        plan: sub.plan,
        status: sub.status,
      };
    }

    const countRes = await sql<{ count: string }>`
      SELECT COUNT(*) as count FROM learn_courses WHERE organization_id = ${organizationId}
    `.execute(db).catch(() => ({ rows: [{ count: "0" }] }));
    const currentUsage = parseInt(countRes.rows[0]?.count || "0", 10);

    const allowed = currentUsage < limits.maxCourses;
    return {
      allowed,
      reason: allowed ? undefined : `Course limit reached (${currentUsage}/${limits.maxCourses}) on ${sub.plan} plan.`,
      currentUsage,
      limit: limits.maxCourses,
      plan: sub.plan,
      status: sub.status,
    };
  }

  static async canCreateGroup(organizationId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(organizationId);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.Basic;

    if (sub.status === "EXPIRED") {
      return {
        allowed: false,
        reason: "Subscription expired. Please renew.",
        currentUsage: 0,
        limit: limits.maxGroups,
        plan: sub.plan,
        status: sub.status,
      };
    }

    const countRes = await sql<{ count: string }>`
      SELECT COUNT(*) as count FROM organization_groups WHERE organization_id = ${organizationId}
    `.execute(db);
    const currentUsage = parseInt(countRes.rows[0]?.count || "0", 10);

    const allowed = currentUsage < limits.maxGroups;
    return {
      allowed,
      reason: allowed ? undefined : `Group limit reached (${currentUsage}/${limits.maxGroups}) on ${sub.plan} plan.`,
      currentUsage,
      limit: limits.maxGroups,
      plan: sub.plan,
      status: sub.status,
    };
  }

  static async canUseAdvancedAnalytics(organizationId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(organizationId);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.Basic;

    const allowed = limits.advancedAnalytics && sub.status !== "EXPIRED";
    return {
      allowed,
      reason: allowed ? undefined : `Advanced analytics requires Professional, Business, or Enterprise plan.`,
      currentUsage: 0,
      limit: limits.advancedAnalytics ? 1 : 0,
      plan: sub.plan,
      status: sub.status,
    };
  }
}
