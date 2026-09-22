// ============================================================
// MGN Verification & Identity Service
// modules/onboarding/lib/verification-service.ts
//
// Core business logic for state transitions, 72h deadline calculation,
// claim verification, document auditing, and canonical identity sync.
// ============================================================

import { verifDb, ensureVerificationTables } from "./verification-db";
import { getProfessionSchema, getOrganisationSchema } from "../config/schemas";
import { syncUserDossier } from "./user-storage";
import { nanoid } from "nanoid";

export class VerificationService {
  /**
   * Retrieves or automatically checks the verification status and deadline for a user.
   */
  static async getIdentity(userId: string) {
    try {
      await ensureVerificationTables();

      const identity = await verifDb
        .selectFrom("mgn_identities")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (!identity) return null;

      // Server-side check for 72-hour deadline expiration
      if (
        (identity.verification_status === "ENROLLED" ||
          identity.verification_status === "DRAFT" ||
          identity.verification_status === "CORRECTION_REQUIRED") &&
        identity.verification_deadline &&
        new Date(identity.verification_deadline) < new Date()
      ) {
        await verifDb
          .updateTable("mgn_identities")
          .set({ verification_status: "VERIFICATION_INCOMPLETE", updated_at: new Date() })
          .where("user_id", "=", userId)
          .execute();

        await verifDb
          .insertInto("mgn_verification_audit_logs" as any)
          .values({
            id: nanoid(),
            target_user_id: userId,
            actor_id: "SYSTEM_DEADLINE_DAEMON",
            action: "verification.deadline_expired",
            reason: "User failed to submit required KYC documents within 72 hours window",
            previous_state: identity.verification_status,
            new_state: "VERIFICATION_INCOMPLETE",
            metadata: JSON.stringify({ deadline: identity.verification_deadline }),
            created_at: new Date(),
          })
          .execute();

        return { ...identity, verification_status: "VERIFICATION_INCOMPLETE" };
      }

      return identity;
    } catch (err) {
      console.warn("VerificationService.getIdentity warning:", err);
      return null;
    }
  }

  /**
   * Initializes or updates the initial enrollment step.
   * Sets verification_deadline = NOW() + 72 hours.
   */
  static async startOrEnroll(userId: string, data: {
    account_type: "INDIVIDUAL" | "ORGANISATION";
    category: string;
    profession_or_type: string;
  }) {
    await ensureVerificationTables();

    const existing = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", userId)
      .executeTakeFirst();

    const now = new Date();
    const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 Hours Server-Side Deadline

    if (existing) {
      await verifDb
        .updateTable("mgn_identities")
        .set({
          account_type: data.account_type,
          category: data.category,
          profession_or_type: data.profession_or_type,
          verification_deadline: existing.verification_deadline || deadline,
          enrolled_at: existing.enrolled_at || now,
          updated_at: now,
        })
        .where("user_id", "=", userId)
        .execute();
    } else {
      await verifDb
        .insertInto("mgn_identities" as any)
        .values({
          id: nanoid(),
          user_id: userId,
          account_type: data.account_type,
          category: data.category,
          profession_or_type: data.profession_or_type,
          verification_status: "DRAFT",
          verification_deadline: deadline,
          enrolled_at: now,
          created_at: now,
          updated_at: now,
        })
        .execute();

      await verifDb
        .insertInto("mgn_verification_audit_logs" as any)
        .values({
          id: nanoid(),
          target_user_id: userId,
          actor_id: userId,
          action: "onboarding.started",
          reason: "User started MGN identity enrollment",
          previous_state: "NONE",
          new_state: "DRAFT",
          metadata: JSON.stringify(data),
          created_at: now,
        })
        .execute();
    }

    await syncUserDossier(userId);
    return this.getIdentity(userId);
  }

  /**
   * Saves dynamic basic & professional / organisation fields.
   */
  static async saveDraftDetails(userId: string, payload: any) {
    const identity = await this.getIdentity(userId);
    if (!identity) throw new Error("Identity not found. Start enrollment first.");

    if (
      identity.verification_status === "UNDER_REVIEW" ||
      identity.verification_status === "APPROVED"
    ) {
      throw new Error("Cannot edit details while under review or approved.");
    }

    const now = new Date();
    await verifDb
      .updateTable("mgn_identities")
      .set({
        legal_first_name: payload.legal_first_name ?? identity.legal_first_name,
        legal_middle_name: payload.legal_middle_name ?? identity.legal_middle_name,
        legal_last_name: payload.legal_last_name ?? identity.legal_last_name,
        display_name: payload.display_name ?? identity.display_name,
        dob: payload.dob ?? identity.dob,
        gender: payload.gender ?? identity.gender,
        country: payload.country ?? identity.country,
        state: payload.state ?? identity.state,
        city: payload.city ?? identity.city,
        address: payload.address ?? identity.address,
        phone: payload.phone ?? identity.phone,
        official_email: payload.official_email ?? identity.official_email,
        website: payload.website ?? identity.website,
        current_organization: payload.current_organization ?? identity.current_organization,
        specialization: payload.specialization ?? identity.specialization,
        sub_specialization: payload.sub_specialization ?? identity.sub_specialization,
        experience_years: payload.experience_years ? Number(payload.experience_years) : identity.experience_years,
        verification_status: identity.verification_status === "DRAFT" ? "ENROLLED" : identity.verification_status,
        updated_at: now,
      })
      .where("user_id", "=", userId)
      .execute();

    // If professional title was claimed (e.g. Dr., PT, RN)
    if (payload.claimed_title) {
      const existingTitle = await verifDb
        .selectFrom("mgn_professional_titles")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existingTitle) {
        await verifDb
          .updateTable("mgn_professional_titles")
          .set({
            claimed_title: payload.claimed_title,
            title_type: payload.title_type || "PREFIX",
            status: "CLAIMED",
            updated_at: now,
          })
          .where("user_id", "=", userId)
          .execute();
      } else {
        await verifDb
          .insertInto("mgn_professional_titles" as any)
          .values({
            id: nanoid(),
            user_id: userId,
            title_type: payload.title_type || "PREFIX",
            claimed_title: payload.claimed_title,
            status: "CLAIMED",
            created_at: now,
            updated_at: now,
          })
          .execute();
      }
    }

    // If primary qualification details were submitted
    if (payload.primary_degree && payload.institution) {
      const existingQual = await verifDb
        .selectFrom("mgn_qualifications")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existingQual) {
        await verifDb
          .updateTable("mgn_qualifications")
          .set({
            degree: payload.primary_degree,
            institution: payload.institution,
            specialization: payload.specialization || null,
            graduation_year: payload.graduation_year ? Number(payload.graduation_year) : null,
            status: "CLAIMED",
          })
          .where("id", "=", existingQual.id)
          .execute();
      } else {
        await verifDb
          .insertInto("mgn_qualifications" as any)
          .values({
            id: nanoid(),
            user_id: userId,
            degree: payload.primary_degree,
            institution: payload.institution,
            specialization: payload.specialization || null,
            graduation_year: payload.graduation_year ? Number(payload.graduation_year) : null,
            status: "CLAIMED",
            created_at: now,
          })
          .execute();
      }
    }

    // If medical/professional council registration was submitted
    if (payload.registration_number && payload.medical_council) {
      const existingReg = await verifDb
        .selectFrom("mgn_registrations")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existingReg) {
        await verifDb
          .updateTable("mgn_registrations")
          .set({
            council_name: payload.medical_council,
            registration_number: payload.registration_number,
            state_or_jurisdiction: payload.registration_state || null,
            status: "CLAIMED",
          })
          .where("id", "=", existingReg.id)
          .execute();
      } else {
        await verifDb
          .insertInto("mgn_registrations" as any)
          .values({
            id: nanoid(),
            user_id: userId,
            council_name: payload.medical_council,
            registration_number: payload.registration_number,
            state_or_jurisdiction: payload.registration_state || null,
            status: "CLAIMED",
            created_at: now,
          })
          .execute();
      }
    }

    await syncUserDossier(userId);
    return this.getIdentity(userId);
  }

  /**
   * Explicit "Submit & Request Review" by the user.
   * Validates mandatory documents against schema before setting UNDER_REVIEW.
   */
  static async submitAndRequestReview(userId: string) {
    const identity = await this.getIdentity(userId);
    if (!identity) throw new Error("Identity record not found");

    if (identity.verification_status === "UNDER_REVIEW") {
      return { success: true, message: "Application already under review." };
    }

    const docs = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    // Check mandatory documents from schema
    let mandatoryDocTypes: string[] = [];
    if (identity.account_type === "INDIVIDUAL") {
      const schema = getProfessionSchema(identity.profession_or_type);
      mandatoryDocTypes = schema.documents.filter((d) => d.mandatory).map((d) => d.id);
    } else {
      const schema = getOrganisationSchema(identity.profession_or_type);
      mandatoryDocTypes = schema.documents.filter((d) => d.mandatory).map((d) => d.id);
    }

    const uploadedTypes = new Set(docs.map((d) => d.document_type));
    const missingDocs = mandatoryDocTypes.filter((type) => !uploadedTypes.has(type));

    if (missingDocs.length > 0) {
      throw new Error(`Missing mandatory verification documents: ${missingDocs.join(", ")}`);
    }

    const now = new Date();
    await verifDb
      .updateTable("mgn_identities")
      .set({
        verification_status: "UNDER_REVIEW",
        submitted_at: now,
        updated_at: now,
      })
      .where("user_id", "=", userId)
      .execute();

    await verifDb
      .insertInto("mgn_verification_audit_logs" as any)
      .values({
        id: nanoid(),
        target_user_id: userId,
        actor_id: userId,
        action: "verification.review_requested",
        reason: "User completed documents and submitted for Admin verification review",
        previous_state: identity.verification_status,
        new_state: "UNDER_REVIEW",
        metadata: JSON.stringify({ documentCount: docs.length }),
        created_at: now,
      })
      .execute();

    await syncUserDossier(userId);
    return { success: true, message: "Application submitted for review successfully." };
  }

  /**
   * Admin Review Actions: APPROVE, REQUEST_CORRECTION, REJECT, SUSPEND.
   */
  static async processAdminReview(
    adminUserId: string,
    targetUserId: string,
    action: "APPROVE" | "REQUEST_CORRECTION" | "REJECT" | "SUSPEND",
    details: {
      reason?: string;
      correctionFields?: any;
    }
  ) {
    const identity = await this.getIdentity(targetUserId);
    if (!identity) throw new Error("Target user identity not found");

    const now = new Date();
    let newStatus: string = identity.verification_status;

    if (action === "APPROVE") {
      newStatus = "APPROVED";

      // 1. Verify professional titles
      const titles = await verifDb
        .selectFrom("mgn_professional_titles")
        .selectAll()
        .where("user_id", "=", targetUserId)
        .execute();

      for (const t of titles) {
        await verifDb
          .updateTable("mgn_professional_titles")
          .set({ verified_title: t.claimed_title, status: "VERIFIED", updated_at: now })
          .where("id", "=", t.id)
          .execute();
      }

      // 2. Verify qualifications & registrations
      await verifDb
        .updateTable("mgn_qualifications")
        .set({ status: "VERIFIED" })
        .where("user_id", "=", targetUserId)
        .execute();

      await verifDb
        .updateTable("mgn_registrations")
        .set({ status: "VERIFIED" })
        .where("user_id", "=", targetUserId)
        .execute();

      await verifDb
        .updateTable("mgn_verification_documents")
        .set({ status: "VERIFIED" })
        .where("user_id", "=", targetUserId)
        .execute();

      // 3. Update canonical profile in professional_profiles table
      const verifiedTitle = titles.find((t) => t.status === "VERIFIED")?.claimed_title;
      const verifiedName = verifiedTitle
        ? `${verifiedTitle} ${identity.legal_first_name || ""} ${identity.legal_last_name || ""}`.trim()
        : `${identity.legal_first_name || ""} ${identity.legal_last_name || ""}`.trim();

      const existingProfProfile = await verifDb
        .selectFrom("professional_profiles")
        .selectAll()
        .where("user_id", "=", targetUserId)
        .executeTakeFirst();

      if (existingProfProfile) {
        await verifDb
          .updateTable("professional_profiles")
          .set({
            profession: identity.profession_or_type,
            specialization: identity.specialization,
            city: identity.city,
            state: identity.state,
            country: identity.country,
            identity_verified: true,
            education_verified: true,
            registration_verified: true,
            experience_verified: true,
            updated_at: now,
          })
          .where("user_id", "=", targetUserId)
          .execute();
      }
    } else if (action === "REQUEST_CORRECTION") {
      newStatus = "CORRECTION_REQUIRED";
    } else if (action === "REJECT") {
      newStatus = "REJECTED";
    } else if (action === "SUSPEND") {
      newStatus = "SUSPENDED";
    }

    const freshDeadline =
      action === "REQUEST_CORRECTION"
        ? new Date(now.getTime() + 72 * 60 * 60 * 1000)
        : identity.verification_deadline;

    await verifDb
      .updateTable("mgn_identities")
      .set({
        verification_status: newStatus,
        verification_deadline: freshDeadline,
        reviewed_at: now,
        reviewed_by: adminUserId,
        correction_reason: action === "REQUEST_CORRECTION" ? details.reason : null,
        correction_fields: action === "REQUEST_CORRECTION" ? JSON.stringify(details.correctionFields || {}) : null,
        rejection_reason: action === "REJECT" ? details.reason : null,
        updated_at: now,
      })
      .where("user_id", "=", targetUserId)
      .execute();

    // Log audit trail
    await verifDb
      .insertInto("mgn_verification_audit_logs" as any)
      .values({
        id: nanoid(),
        target_user_id: targetUserId,
        actor_id: adminUserId,
        action: `verification.${action.toLowerCase()}`,
        reason: details.reason || `Admin processed review action: ${action}`,
        previous_state: identity.verification_status,
        new_state: newStatus,
        metadata: JSON.stringify(details),
        created_at: now,
      })
      .execute();

    await syncUserDossier(targetUserId);

    return { success: true, newStatus };
  }
}
