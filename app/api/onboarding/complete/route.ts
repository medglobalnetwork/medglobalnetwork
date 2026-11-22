import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { ensureVerificationTables, verifDb } from "@/modules/onboarding/lib/verification-db";
import { nanoid } from "nanoid";

const IDENTITY_METADATA: Record<string, { title: string; group: string; description: string }> = {
  student: {
    title: "Student",
    group: "Education & Learning",
    description: "Enrolled in medical, dental, nursing, pharmacy, or allied health degree.",
  },
  intern_trainee: {
    title: "Intern / Trainee",
    group: "Education & Learning",
    description: "Rotating intern, house surgeon, clinical trainee, or junior resident.",
  },
  doctor: {
    title: "Doctor",
    group: "Healthcare Professionals",
    description: "Allopathic (MBBS/MD/MS), AYUSH, dental clinician, or super-specialist.",
  },
  nurse: {
    title: "Nurse",
    group: "Healthcare Professionals",
    description: "Registered nurse (GNM/BSc), nursing officer, or clinical specialist.",
  },
  pharmacist: {
    title: "Pharmacist",
    group: "Healthcare Professionals",
    description: "Hospital, retail, clinical, or industrial pharmaceutical professional.",
  },
  physiotherapist: {
    title: "Physiotherapist",
    group: "Healthcare Professionals",
    description: "Physical rehabilitation, sports therapist, or orthopedic physiotherapist.",
  },
  paramedical: {
    title: "Paramedical Professional",
    group: "Healthcare Professionals",
    description: "Emergency medical technician (EMT), lab technologist, or radiology tech.",
  },
  allied_health: {
    title: "Allied Healthcare Professional",
    group: "Healthcare Professionals",
    description: "Clinical psychologist, dietitian/nutritionist, optometrist, or audiologist.",
  },
  researcher: {
    title: "Researcher",
    group: "Research & Academia",
    description: "Clinical scientist, trial investigator, epidemiologist, or biotech researcher.",
  },
  faculty: {
    title: "Faculty / Academician",
    group: "Research & Academia",
    description: "Professor, assistant professor, lecturer, or clinical preceptor in health sciences.",
  },
  business_owner: {
    title: "Healthcare Business Owner",
    group: "Healthcare Business & Services",
    description: "Founder or partner in clinic, diagnostic center, pharma, or medical equipment firm.",
  },
  service_provider: {
    title: "Healthcare Service Provider",
    group: "Healthcare Business & Services",
    description: "Provider of medical billing, healthcare consulting, logistics, or clinical services.",
  },
  other_healthcare: {
    title: "Other Healthcare-related Identity",
    group: "Other Healthcare",
    description: "Other health-adjacent, administrative, or specialized healthcare role.",
  },
};

export async function GET(request: Request) {
  try {
    const reqHeaders = await headers();
    let targetUserId = "";

    // 1. Session auth check
    try {
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session?.user?.id) targetUserId = session.user.id;
    } catch {}

    // 2. Query fallback for testing / client restoration
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    if (!targetUserId && queryUserId) {
      targetUserId = queryUserId;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to fetch account completion status." },
        { status: 401 }
      );
    }

    // Ensure database tables exist
    await ensureVerificationTables();

    // 3. Fetch User details
    const userRes = await pool.query(
      `SELECT id, name, email, "emailVerified", phone, "createdAt", selected_identities, account_type 
       FROM "user" 
       WHERE id = $1 LIMIT 1`,
      [targetUserId]
    );

    const user = userRes.rows[0];
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    // 4. Fetch Professional Profile
    const profileRes = await pool.query(
      `SELECT account_type, first_name, last_name, full_name, phone, selected_identities, identity_details, verification_status, created_at 
       FROM professional_profiles 
       WHERE user_id = $1 LIMIT 1`,
      [targetUserId]
    );
    const profile = profileRes.rows[0] || {};

    // 5. Fetch or initialize mgn_identities
    let identity = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .executeTakeFirst();

    const userCreatedAt = user.createdAt ? new Date(user.createdAt) : new Date();
    // 72-hour deadline calculation from registration completion timestamp
    const default72hDeadline = new Date(userCreatedAt.getTime() + 72 * 60 * 60 * 1000);

    if (!identity) {
      const newId = nanoid();
      await verifDb
        .insertInto("mgn_identities" as any)
        .values({
          id: newId,
          user_id: targetUserId,
          account_type: "INDIVIDUAL",
          category: "clinical_practitioner",
          profession_or_type: "general_physician",
          verification_status: "DRAFT",
          onboarding_step: 7,
          verification_deadline: default72hDeadline,
          enrolled_at: userCreatedAt,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .execute();

      identity = await verifDb
        .selectFrom("mgn_identities")
        .selectAll()
        .where("user_id", "=", targetUserId)
        .executeTakeFirst();
    } else if (!identity.verification_deadline) {
      // If deadline was not set previously, pin it permanently to userCreatedAt + 72 hours
      await verifDb
        .updateTable("mgn_identities")
        .set({
          verification_deadline: default72hDeadline,
          updated_at: new Date(),
        })
        .where("user_id", "=", targetUserId)
        .execute();

      identity = {
        ...identity,
        verification_deadline: default72hDeadline,
      };
    }

    // 6. Check uploaded documents
    const docs = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .execute();

    const verificationStatus = identity?.verification_status || "DRAFT";
    const documentsCount = docs.length;
    const documentsSubmitted = documentsCount > 0 || verificationStatus === "UNDER_REVIEW";
    const isApproved = verificationStatus === "APPROVED";
    const isReviewPending = verificationStatus === "UNDER_REVIEW" || (documentsSubmitted && !isApproved);

    // 7. Calculate Deadline & Countdown (Server-authoritative)
    const deadlineTime = identity?.verification_deadline
      ? new Date(identity.verification_deadline).getTime()
      : default72hDeadline.getTime();

    const now = Date.now();
    const deadlineRemainingSeconds = Math.max(0, Math.floor((deadlineTime - now) / 1000));
    // If documents are submitted before deadline or currently under review, the deadline is NOT treated as missed
    const isExpired = deadlineRemainingSeconds <= 0 && !documentsSubmitted && !isApproved;

    // 8. Consolidate Selected Identities
    const rawSelected: string[] =
      (identity as any)?.selected_identities ||
      profile.selected_identities ||
      user.selected_identities ||
      [];

    const uniqueSelected = Array.from(new Set(rawSelected.filter(Boolean)));

    // Map each identity with its independent verification status
    // Rule: Never automatically show verified badges or professional prefixes.
    // Identity verification must be approved by the authorized verification workflow.
    const identitiesWithStatus = uniqueSelected.map((key) => {
      const meta = IDENTITY_METADATA[key] || {
        title: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        group: "Healthcare",
        description: "Healthcare member identity",
      };

      let status = "Pending Document Verification";
      if (isApproved) {
        status = "Verified by MED Global Network";
      } else if (isReviewPending) {
        status = "Under Review";
      } else if (isExpired) {
        status = "Verification Pending";
      }

      return {
        id: key,
        title: meta.title,
        group: meta.group,
        description: meta.description,
        status,
        isVerified: isApproved,
      };
    });

    const fullName =
      profile.full_name ||
      user.name ||
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "Healthcare Member";

    return NextResponse.json({
      success: true,
      account: {
        userId: user.id,
        fullName,
        email: user.email,
        phone: user.phone || profile.phone || "",
        accountType: "Individual Account",
        emailVerified: Boolean(user.emailVerified),
        phoneVerified: true, // Contact verification verified in Step 3
        createdAt: userCreatedAt.toISOString(),
      },
      identities: identitiesWithStatus,
      verification: {
        status: isApproved
          ? "APPROVED"
          : isReviewPending
          ? "UNDER_REVIEW"
          : isExpired
          ? "DEADLINE_EXPIRED"
          : "PENDING_DOCUMENT_UPLOAD",
        deadlineIso: new Date(deadlineTime).toISOString(),
        deadlineRemainingSeconds,
        documentsSubmitted,
        isReviewPending,
        isExpired,
        isApproved,
        documentsCount,
      },
    });
  } catch (err: any) {
    console.error("GET /api/onboarding/complete error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load account completion status." },
      { status: 500 }
    );
  }
}
