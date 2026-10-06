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

      let identity = await verifDb
        .selectFrom("mgn_identities")
        .selectAll()
        .where("user_id", "=", userId)
        .executeTakeFirst();

      // Check user governance status and professional profile verification in database
      const userRes: any = await verifDb.selectFrom("user" as any)
        .leftJoin("professional_profiles as pp", "pp.user_id", "user.id")
        .select([
          "user.id as id",
          "user.email as email",
          "user.status as account_status",
          "user.banned as is_banned",
          "pp.registration_verified as registration_verified",
          "pp.identity_verified as identity_verified",
          "pp.education_verified as education_verified",
          "pp.profession as profession",
          "pp.specialization as specialization",
        ])
        .where("user.id", "=", userId)
        .executeTakeFirst();

      if (userRes) {
        if (userRes.is_banned || userRes.account_status === "banned") {
          return { ...(identity || {}), user_id: userId, verification_status: "BANNED" };
        }
        if (userRes.account_status === "suspended") {
          return { ...(identity || {}), user_id: userId, verification_status: "SUSPENDED" };
        }
        if (userRes.account_status === "on_hold") {
          return { ...(identity || {}), user_id: userId, verification_status: "ON_HOLD" };
        }

        const isProfileApproved = Boolean(userRes.registration_verified || userRes.identity_verified);
        if (isProfileApproved) {
          const now = new Date();
          if (!identity) {
            const newId = nanoid();
            await verifDb
              .insertInto("mgn_identities" as any)
              .values({
                id: newId,
                user_id: userId,
                account_type: "INDIVIDUAL",
                category: "clinical_practitioner",
                profession_or_type: userRes.profession || "general_physician",
                verification_status: "APPROVED",
                onboarding_step: 6,
                created_at: now,
                updated_at: now,
              })
              .execute();

            identity = await verifDb
              .selectFrom("mgn_identities")
              .selectAll()
              .where("user_id", "=", userId)
              .executeTakeFirst();
          } else if (identity.verification_status !== "APPROVED") {
            await verifDb
              .updateTable("mgn_identities")
              .set({ verification_status: "APPROVED", onboarding_step: 6, updated_at: now })
              .where("user_id", "=", userId)
              .execute();

            identity = { ...identity, verification_status: "APPROVED", onboarding_step: 6 };
          }
          return identity;
        }
      }

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
    step?: number;
  }) {
    await ensureVerificationTables();

    const existing = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", userId)
      .executeTakeFirst();

    const now = new Date();
    const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 Hours Server-Side Deadline
    const stepToSave = data.step || (existing as any)?.onboarding_step || 2;

    if (existing) {
      await verifDb
        .updateTable("mgn_identities")
        .set({
          account_type: data.account_type,
          category: data.category,
          profession_or_type: data.profession_or_type,
          onboarding_step: stepToSave,
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
          onboarding_step: stepToSave,
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
   * Auto-creates the identity record if not yet initialized.
   */
  static async saveDraftDetails(userId: string, payload: any) {
    await ensureVerificationTables();
    let identity = await this.getIdentity(userId);

    const now = new Date();
    const deadline = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const stepToSave = payload.step ?? payload.onboarding_step ?? (identity as any)?.onboarding_step ?? 1;

    if (!identity) {
      // Auto-create initial draft identity
      await verifDb
        .insertInto("mgn_identities" as any)
        .values({
          id: nanoid(),
          user_id: userId,
          account_type: payload.account_type || "INDIVIDUAL",
          category: payload.category || "clinical_practitioner",
          profession_or_type: payload.profession_or_type || "general_physician",
          legal_first_name: payload.legal_first_name || null,
          legal_middle_name: payload.legal_middle_name || null,
          legal_last_name: payload.legal_last_name || null,
          display_name: payload.display_name || null,
          dob: payload.dob || null,
          gender: payload.gender || "male",
          country: payload.country || "India",
          state: payload.state || null,
          city: payload.city || null,
          address: payload.address || null,
          phone: payload.phone || null,
          official_email: payload.official_email || null,
          website: payload.website || null,
          current_organization: payload.current_organization || null,
          specialization: payload.specialization || null,
          sub_specialization: payload.sub_specialization || null,
          experience_years: payload.experience_years ? Number(payload.experience_years) : 0,
          verification_status: "DRAFT",
          onboarding_step: stepToSave,
          verification_deadline: deadline,
          enrolled_at: now,
          created_at: now,
          updated_at: now,
        })
        .execute();

      identity = await this.getIdentity(userId);
    } else {
      if (
        identity.verification_status === "UNDER_REVIEW" ||
        identity.verification_status === "APPROVED"
      ) {
        throw new Error("Cannot edit details while under review or approved.");
      }

      const updateData: any = {
        updated_at: now,
        onboarding_step: stepToSave,
      };

      if (payload.account_type !== undefined) updateData.account_type = payload.account_type;
      if (payload.category !== undefined) updateData.category = payload.category;
      if (payload.profession_or_type !== undefined) updateData.profession_or_type = payload.profession_or_type;
      if (payload.legal_first_name !== undefined) updateData.legal_first_name = payload.legal_first_name;
      if (payload.legal_middle_name !== undefined) updateData.legal_middle_name = payload.legal_middle_name;
      if (payload.legal_last_name !== undefined) updateData.legal_last_name = payload.legal_last_name;
      if (payload.display_name !== undefined) updateData.display_name = payload.display_name;
      if (payload.dob !== undefined) updateData.dob = payload.dob;
      if (payload.gender !== undefined) updateData.gender = payload.gender;
      if (payload.country !== undefined) updateData.country = payload.country;
      if (payload.state !== undefined) updateData.state = payload.state;
      if (payload.city !== undefined) updateData.city = payload.city;
      if (payload.address !== undefined) updateData.address = payload.address;
      if (payload.phone !== undefined) updateData.phone = payload.phone;
      if (payload.official_email !== undefined) updateData.official_email = payload.official_email;
      if (payload.website !== undefined) updateData.website = payload.website;
      if (payload.current_organization !== undefined) updateData.current_organization = payload.current_organization;
      if (payload.specialization !== undefined) updateData.specialization = payload.specialization;
      if (payload.sub_specialization !== undefined) updateData.sub_specialization = payload.sub_specialization;
      if (payload.experience_years !== undefined) updateData.experience_years = Number(payload.experience_years);

      await verifDb
        .updateTable("mgn_identities")
        .set(updateData)
        .where("user_id", "=", userId)
        .execute();
    }

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
    await ensureVerificationTables();
    let identity = await this.getIdentity(userId);
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
        onboarding_step: 6,
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
   * Allows user to skip document upload for now and enter the 72-hour grace period (ENROLLED).
   */
  static async skipDocumentsAndEnroll(userId: string) {
    await ensureVerificationTables();
    let identity = await this.getIdentity(userId);

    const now = new Date();
    const deadline = identity?.verification_deadline || new Date(now.getTime() + 72 * 60 * 60 * 1000);

    if (!identity) {
      await verifDb
        .insertInto("mgn_identities" as any)
        .values({
          id: nanoid(),
          user_id: userId,
          account_type: "INDIVIDUAL",
          category: "clinical_practitioner",
          profession_or_type: "general_physician",
          verification_status: "ENROLLED",
          onboarding_step: 5,
          verification_deadline: deadline,
          enrolled_at: now,
          created_at: now,
          updated_at: now,
        })
        .execute();
    } else {
      await verifDb
        .updateTable("mgn_identities")
        .set({
          verification_status: "ENROLLED",
          verification_deadline: deadline,
          onboarding_step: 5,
          updated_at: now,
        })
        .where("user_id", "=", userId)
        .execute();
    }

    await verifDb
      .insertInto("mgn_verification_audit_logs" as any)
      .values({
        id: nanoid(),
        target_user_id: userId,
        actor_id: userId,
        action: "onboarding.skipped_documents",
        reason: "User deferred document upload to 72-hour grace window",
        previous_state: identity?.verification_status || "NONE",
        new_state: "ENROLLED",
        metadata: JSON.stringify({ deadline }),
        created_at: now,
      })
      .execute();

    await syncUserDossier(userId);
    return { success: true, message: "Enrolled in 72-hour verification grace window." };
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
    let identity = await this.getIdentity(targetUserId);
    if (!identity) {
      await this.startOrEnroll(targetUserId, {
        account_type: "INDIVIDUAL",
        category: "clinical_practitioner",
        profession_or_type: "general_physician",
        step: 6,
      });
      identity = await this.getIdentity(targetUserId);
    }
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

      // 4. Update user account status
      await verifDb
        .updateTable("user" as any)
        .set({ status: "active", banned: false, updatedAt: now } as any)
        .where("id", "=", targetUserId)
        .execute();
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
