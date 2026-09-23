// ============================================================
// MGN Shared Organizer Eligibility Service
// modules/shared/permissions/organizer-eligibility-service.ts
//
// Centralized server-side enforcement for event, camp, and
// research creation & publishing permissions.
// ============================================================

import { database } from "@/lib/auth";
import { VerificationService } from "@/modules/onboarding/lib/verification-service";

const db = database as any;

export interface OrganizerEligibilityResult {
  eligible: boolean;
  reason?: string;
  isIndividualVerified: boolean;
  organizationId?: string | null;
  organizationRole?: string | null;
  isOrganizationVerified: boolean;
  canPublishImmediately: boolean;
}

export class OrganizerEligibilityService {
  private static SUPER_ADMINS = [
    "patreshubham141@gmail.com",
  ];

  /**
   * Evaluates whether a user is eligible to create an event.
   */
  static async canCreateEvent(userId: string, organizationId?: string | null): Promise<OrganizerEligibilityResult> {
    return this.evaluateEligibility(userId, organizationId, "event");
  }

  /**
   * Evaluates whether a user is eligible to publish an event.
   */
  static async canPublishEvent(userId: string, organizationId?: string | null): Promise<OrganizerEligibilityResult> {
    const res = await this.evaluateEligibility(userId, organizationId, "event");
    return {
      ...res,
      eligible: res.eligible && res.canPublishImmediately,
    };
  }

  /**
   * Evaluates whether a user is eligible to create a medical camp.
   */
  static async canCreateCamp(userId: string, organizationId?: string | null): Promise<OrganizerEligibilityResult> {
    return this.evaluateEligibility(userId, organizationId, "camp");
  }

  /**
   * Evaluates whether a user is eligible to publish a medical camp.
   */
  static async canPublishCamp(userId: string, organizationId?: string | null): Promise<OrganizerEligibilityResult> {
    const res = await this.evaluateEligibility(userId, organizationId, "camp");
    return {
      ...res,
      eligible: res.eligible && res.canPublishImmediately,
    };
  }

  /**
   * Evaluates whether a user is eligible to create a research project.
   */
  static async canCreateResearchProject(userId: string, organizationId?: string | null): Promise<OrganizerEligibilityResult> {
    return this.evaluateEligibility(userId, organizationId, "research_project");
  }

  /**
   * Evaluates whether a user is eligible to publish a research opportunity.
   */
  static async canPublishResearchOpportunity(userId: string, organizationId?: string | null): Promise<OrganizerEligibilityResult> {
    return this.evaluateEligibility(userId, organizationId, "research_opportunity");
  }

  /**
   * Core logic for organizer eligibility check.
   */
  private static async evaluateEligibility(
    userId: string,
    organizationId?: string | null,
    moduleContext?: string
  ): Promise<OrganizerEligibilityResult> {
    if (!userId) {
      return {
        eligible: false,
        reason: "Authentication required.",
        isIndividualVerified: false,
        isOrganizationVerified: false,
        canPublishImmediately: false,
      };
    }

    // 1. Check Superadmin bypass
    const user = await db
      .selectFrom("user")
      .select(["id", "email"])
      .where("id", "=", userId)
      .executeTakeFirst() as { id: string; email: string } | undefined;

    if (user && this.SUPER_ADMINS.includes(user.email.toLowerCase())) {
      return {
        eligible: true,
        isIndividualVerified: true,
        isOrganizationVerified: true,
        canPublishImmediately: true,
        organizationId: organizationId || null,
      };
    }

    // 2. Fetch User's Identity & Verification status
    const identity = await VerificationService.getIdentity(userId);
    const isIndividualVerified = identity?.verification_status === "APPROVED";

    // 3. Organization Check if organizationId is specified
    let isOrganizationVerified = false;
    let organizationRole: string | null = null;

    if (organizationId) {
      const orgRow = await db
        .selectFrom("organizations")
        .select(["id", "name", "verification_status"])
        .where("id", "=", organizationId)
        .executeTakeFirst() as { id: string; name: string; verification_status: string } | undefined;

      if (orgRow && orgRow.verification_status === "verified") {
        isOrganizationVerified = true;
      }

      const memberRow = await db
        .selectFrom("organization_members")
        .select(["role"])
        .where("organization_id", "=", organizationId)
        .where("user_id", "=", userId)
        .executeTakeFirst() as { role: string } | undefined;

      organizationRole = memberRow?.role || null;

      // Roles allowed: owner, admin, event_manager, organizer, recruiter, hiring_manager
      const authorizedRoles = ["owner", "admin", "event_manager", "organizer", "recruiter", "hiring_manager"];
      const isAuthorizedOrgMember = organizationRole && authorizedRoles.includes(organizationRole.toLowerCase());

      if (!isAuthorizedOrgMember) {
        return {
          eligible: false,
          reason: "You do not have administrative or organizer permissions in this organization.",
          isIndividualVerified,
          isOrganizationVerified,
          organizationId,
          organizationRole,
          canPublishImmediately: false,
        };
      }

      if (!isOrganizationVerified) {
        return {
          eligible: false,
          reason: "The organization is not yet verified by MGN administration.",
          isIndividualVerified,
          isOrganizationVerified: false,
          organizationId,
          organizationRole,
          canPublishImmediately: false,
        };
      }

      return {
        eligible: true,
        isIndividualVerified,
        isOrganizationVerified: true,
        organizationId,
        organizationRole,
        canPublishImmediately: true,
      };
    }

    // 4. Individual check (when no organization specified)
    if (!identity) {
      return {
        eligible: false,
        reason: "Professional profile identity not initiated. Complete verification onboarding.",
        isIndividualVerified: false,
        isOrganizationVerified: false,
        canPublishImmediately: false,
      };
    }

    if (identity.verification_status === "SUSPENDED" || identity.verification_status === "REJECTED") {
      return {
        eligible: false,
        reason: "Your account verification status is suspended or rejected.",
        isIndividualVerified: false,
        isOrganizationVerified: false,
        canPublishImmediately: false,
      };
    }

    if (!isIndividualVerified) {
      return {
        eligible: false,
        reason: "Only verified healthcare professionals with an approved MGN identity can organize events, camps, or research.",
        isIndividualVerified: false,
        isOrganizationVerified: false,
        canPublishImmediately: false,
      };
    }

    return {
      eligible: true,
      isIndividualVerified: true,
      isOrganizationVerified: false,
      canPublishImmediately: true,
    };
  }
}
