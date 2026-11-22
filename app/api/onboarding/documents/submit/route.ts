import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { ensureVerificationTables, verifDb } from "@/modules/onboarding/lib/verification-db";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`submit-docs:ip:${clientIp}`, 15, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many submission attempts. Please wait a moment." },
        { status: 429 }
      );
    }

    let targetUserId = "";
    try {
      const session = await auth.api.getSession({ headers: reqHeaders });
      if (session?.user?.id) targetUserId = session.user.id;
    } catch {}

    const body = await request.json().catch(() => ({}));
    const identityType = (body.identityType || "").trim(); // specific identity or empty for all
    const userFallback = body.userId || "";

    if (!targetUserId && userFallback) {
      targetUserId = userFallback;
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required to submit documents." },
        { status: 401 }
      );
    }

    await ensureVerificationTables();

    // 1. Fetch current identity status
    const identityRes = await verifDb
      .selectFrom("mgn_identities")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .executeTakeFirst();

    // 2. Fetch all uploaded documents for the user
    const docs = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", targetUserId)
      .execute();

    if (docs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please upload at least one required verification document before submitting." },
        { status: 400 }
      );
    }

    // 3. Update status per identity or for the target identity
    const currentStatuses = (identityRes as any)?.identity_statuses || {};
    const updatedStatuses = { ...currentStatuses };

    if (identityType) {
      // Validate documents exist for this identity
      const identityDocs = docs.filter(
        (d) => (d as any).identity_type === identityType || (!d.identity_type && d.document_type.startsWith(identityType))
      );
      if (identityDocs.length === 0) {
        return NextResponse.json(
          { success: false, error: `No documents uploaded for ${identityType}. Please upload required documents first.` },
          { status: 400 }
        );
      }

      updatedStatuses[identityType] = "UNDER_REVIEW";

      // Update documents status to UNDER_REVIEW
      await pool.query(
        `UPDATE mgn_verification_documents 
         SET status = 'UNDER_REVIEW' 
         WHERE user_id = $1 AND (identity_type = $2 OR document_type LIKE $3) AND status = 'PENDING'`,
        [targetUserId, identityType, `${identityType}%`]
      );
    } else {
      // All identities with uploaded docs moved to UNDER_REVIEW
      const uniqueTypes = Array.from(new Set(docs.map((d) => (d as any).identity_type || "general")));
      uniqueTypes.forEach((t) => {
        updatedStatuses[t] = "UNDER_REVIEW";
      });

      await pool.query(
        `UPDATE mgn_verification_documents 
         SET status = 'UNDER_REVIEW' 
         WHERE user_id = $1 AND status = 'PENDING'`,
        [targetUserId]
      );
    }

    // Ensure submission_id column exists
    try {
      await pool.query(`
        ALTER TABLE mgn_identities ADD COLUMN IF NOT EXISTS submission_id VARCHAR(64);
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS submission_id VARCHAR(64);
      `);
    } catch {}

    const now = new Date();
    const existingSubId = (identityRes as any)?.submission_id;
    const submissionId = existingSubId || `SUB-MGN-${nanoid(8).toUpperCase()}`;

    // 4. Update mgn_identities & professional_profiles
    await pool.query(
      `UPDATE mgn_identities 
       SET identity_statuses = $1, 
           verification_status = 'UNDER_REVIEW', 
           submission_id = $2,
           submitted_at = COALESCE(submitted_at, $3), 
           updated_at = $3 
       WHERE user_id = $4`,
      [JSON.stringify(updatedStatuses), submissionId, now, targetUserId]
    );

    await pool.query(
      `UPDATE professional_profiles 
       SET identity_statuses = $1, 
           verification_status = 'UNDER_REVIEW', 
           submission_id = $2,
           updated_at = $3 
       WHERE user_id = $4`,
      [JSON.stringify(updatedStatuses), submissionId, now, targetUserId]
    );

    // 5. Insert audit log
    await pool.query(
      `INSERT INTO mgn_verification_audit_logs 
        (id, target_user_id, actor_id, action, reason, previous_state, new_state, metadata, created_at)
       VALUES ($1, $2, $3, 'identity.submitted_for_review', $4, 'NOT_SUBMITTED', 'UNDER_REVIEW', $5, NOW())`,
      [
        nanoid(),
        targetUserId,
        targetUserId,
        identityType
          ? `User submitted documents for ${identityType} review`
          : `User submitted all verification documents for clinical compliance review`,
        JSON.stringify({
          submissionId,
          identityType: identityType || "all",
          submittedAt: now.toISOString(),
          totalDocuments: docs.length,
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      submissionId,
      message: identityType
        ? `Documents for ${identityType} submitted for review successfully.`
        : "All identity verification documents submitted for clinical credentials review.",
      identityStatuses: updatedStatuses,
      submittedAt: now.toISOString(),
    });
  } catch (err: any) {
    console.error("POST /api/onboarding/documents/submit error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit documents for review." },
      { status: 500 }
    );
  }
}
