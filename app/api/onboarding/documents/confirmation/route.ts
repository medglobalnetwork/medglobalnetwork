import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { ensureVerificationTables, verifDb } from "@/modules/onboarding/lib/verification-db";
import { IDENTITY_DOCUMENT_REQUIREMENTS } from "../route";
import { nanoid } from "nanoid";

const IDENTITY_TITLES: Record<string, { title: string; group: string }> = {
  student: { title: "Student", group: "Education & Learning" },
  intern_trainee: { title: "Intern / Trainee", group: "Education & Learning" },
  doctor: { title: "Doctor", group: "Healthcare Professionals" },
  nurse: { title: "Nurse", group: "Healthcare Professionals" },
  pharmacist: { title: "Pharmacist", group: "Healthcare Professionals" },
  physiotherapist: { title: "Physiotherapist", group: "Healthcare Professionals" },
  paramedical: { title: "Paramedical Professional", group: "Healthcare Professionals" },
  allied_health: { title: "Allied Healthcare Professional", group: "Healthcare Professionals" },
  researcher: { title: "Researcher", group: "Research & Academia" },
  faculty: { title: "Faculty / Academician", group: "Research & Academia" },
  business_owner: { title: "Healthcare Business Owner", group: "Healthcare Business" },
  service_provider: { title: "Healthcare Service Provider", group: "Healthcare Business" },
  other_healthcare: { title: "Other Healthcare Identity", group: "Healthcare" },
};

export async function GET(request: Request) {
  try {
    const reqHeaders = await headers();
    let targetUserId = "";

    try {
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session?.user?.id) targetUserId = session.user.id;
    } catch {}

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    if (!targetUserId && queryUserId) {
      targetUserId = queryUserId;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view submission confirmation." },
        { status: 401 }
      );
    }

    await ensureVerificationTables();

    // 1. Fetch User details
    const userRes = await pool.query(
      `SELECT id, name, email, "emailVerified", phone, selected_identities FROM "user" WHERE id = $1 LIMIT 1`,
      [targetUserId]
    );
    const user = userRes.rows[0];

    // 2. Fetch Professional Profile
    const profileRes = await pool.query(
      `SELECT first_name, last_name, full_name, selected_identities, identity_statuses, verification_status, submission_id, updated_at 
       FROM professional_profiles 
       WHERE user_id = $1 LIMIT 1`,
      [targetUserId]
    );
    const profile = profileRes.rows[0] || {};

    // 3. Fetch Identity Record
    const identityRes = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .executeTakeFirst();

    // 4. Fetch All Documents
    const docs = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .execute();

    // 5. Resolve Selected Identities
    const rawSelected: string[] =
      (identityRes as any)?.selected_identities ||
      profile.selected_identities ||
      user?.selected_identities ||
      [];
    const selectedIdentities = Array.from(new Set(rawSelected.filter(Boolean)));

    // 6. Generate or resolve permanent submissionId
    const existingSubmissionId =
      identityRes?.submission_id ||
      profile.submission_id ||
      `SUB-MGN-${(identityRes?.id || targetUserId).slice(0, 8).toUpperCase()}`;

    // Resolve submission timestamp
    const submittedAt =
      identityRes?.submitted_at ||
      identityRes?.updated_at ||
      profile.updated_at ||
      new Date();

    const storedIdentityStatuses: Record<string, string> =
      (identityRes as any)?.identity_statuses || profile.identity_statuses || {};

    // 7. Build Identity Cards with all 7 supported statuses
    // NOT_SUBMITTED | INCOMPLETE | SUBMITTED | UNDER_REVIEW | ADDITIONAL_INFORMATION_REQUIRED | REJECTED | APPROVED
    let totalSubmittedDocsCount = 0;
    let hasUnderReview = false;
    let hasNotSubmitted = false;
    let hasIncomplete = false;

    const identityCards = selectedIdentities.map((identityKey) => {
      const meta = IDENTITY_TITLES[identityKey] || {
        title: identityKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        group: "Healthcare",
      };

      const reqs = IDENTITY_DOCUMENT_REQUIREMENTS[identityKey] || [];
      const mandatoryReqs = reqs.filter((r) => r.mandatory);

      const identityDocs = docs
        .filter(
          (d) => (d as any).identity_type === identityKey || (!d.identity_type && d.document_type.startsWith(identityKey))
        )
        .map((d) => ({
          id: d.id,
          documentType: d.document_type,
          documentLabel: (d as any).document_label || d.document_type,
          fileName: d.file_name,
          fileSize: d.file_size,
          mimeType: d.mime_type,
          status: d.status,
          rejectionReason: d.rejection_reason || null,
          uploadedAt: d.uploaded_at ? new Date(d.uploaded_at).toISOString() : new Date().toISOString(),
        }));

      totalSubmittedDocsCount += identityDocs.length;

      const uploadedTypes = new Set(identityDocs.map((d) => d.documentType));
      const uploadedMandatoryCount = mandatoryReqs.filter((r) => uploadedTypes.has(r.id)).length;
      const hasAllMandatory = uploadedMandatoryCount >= mandatoryReqs.length;

      // Determine precise status among the 7 supported statuses
      let cardStatus = storedIdentityStatuses[identityKey] || "NOT_SUBMITTED";

      if (identityDocs.length === 0) {
        cardStatus = "NOT_SUBMITTED";
        hasNotSubmitted = true;
      } else if (!hasAllMandatory && cardStatus !== "UNDER_REVIEW" && cardStatus !== "APPROVED") {
        cardStatus = "INCOMPLETE";
        hasIncomplete = true;
      } else if (cardStatus === "NOT_SUBMITTED") {
        cardStatus = "SUBMITTED";
      }

      if (cardStatus === "UNDER_REVIEW" || cardStatus === "SUBMITTED") {
        hasUnderReview = true;
      }

      return {
        identityKey,
        title: meta.title,
        group: meta.group,
        status: cardStatus,
        documents: identityDocs,
        mandatoryCount: mandatoryReqs.length,
        uploadedMandatoryCount,
        hasMissingMandatory: !hasAllMandatory,
        reviewNotes: identityDocs.find((d) => d.rejectionReason)?.rejectionReason || null,
      };
    });

    const isPartialSubmission = (hasUnderReview || totalSubmittedDocsCount > 0) && (hasNotSubmitted || hasIncomplete);

    const fullName =
      profile.full_name ||
      user?.name ||
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "Healthcare Professional";

    return NextResponse.json({
      success: true,
      submission: {
        submissionId: existingSubmissionId,
        submittedAt: new Date(submittedAt).toISOString(),
        totalDocumentsSubmitted: totalSubmittedDocsCount,
        overallStatus: identityRes?.verification_status || (totalSubmittedDocsCount > 0 ? "UNDER_REVIEW" : "DRAFT"),
        isPartialSubmission,
      },
      user: {
        id: targetUserId,
        fullName,
        email: user?.email || "",
        emailVerified: Boolean(user?.emailVerified),
        phone: user?.phone || "",
        notifications: {
          emailAlerts: true,
          inAppAlerts: true,
        },
      },
      identityCards,
    });
  } catch (err: any) {
    console.error("GET /api/onboarding/documents/confirmation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve verification submission summary." },
      { status: 500 }
    );
  }
}
