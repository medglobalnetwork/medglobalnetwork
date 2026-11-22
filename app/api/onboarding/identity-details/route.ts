import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

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
      return NextResponse.json({
        success: true,
        selectedIdentities: [],
        identityDetails: {},
      });
    }

    const res = await pool.query(
      `SELECT selected_identities, identity_details 
       FROM professional_profiles 
       WHERE user_id = $1 LIMIT 1`,
      [targetUserId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({
        success: true,
        selectedIdentities: [],
        identityDetails: {},
      });
    }

    return NextResponse.json({
      success: true,
      selectedIdentities: res.rows[0].selected_identities || [],
      identityDetails: res.rows[0].identity_details || {},
    });
  } catch (err: any) {
    console.error("GET identity-details error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch identity details." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`onboard-id-details:ip:${clientIp}`, 30, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const identityDetails = body.identityDetails || {};
    const selectedIdentities = Array.isArray(body.selectedIdentities) ? body.selectedIdentities : [];
    const isSkip = body.isSkip === true;

    // Resolve userId
    let targetUserId = body.userId;
    if (!targetUserId) {
      try {
        const session = await auth.api.getSession({ headers: reqHeaders });
        if (session?.user?.id) targetUserId = session.user.id;
      } catch {}
    }

    // Ensure database columns exist
    try {
      await pool.query(`
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS identity_details JSONB;
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS selected_identities TEXT[];
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS identity_details JSONB;
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS selected_identities TEXT[];
        ALTER TABLE mgn_identities ADD COLUMN IF NOT EXISTS identity_details JSONB;
        ALTER TABLE mgn_identities ADD COLUMN IF NOT EXISTS selected_identities TEXT[];
      `);
    } catch (schemaErr) {
      console.warn("Schema check warning in identity-details:", schemaErr);
    }

    // Extract primary profession/specialization if present
    let primarySpecialization = "";
    let primaryProfession = "";

    if (identityDetails.doctor?.specialization) {
      primarySpecialization = identityDetails.doctor.specialization;
      primaryProfession = "Doctor";
    } else if (identityDetails.student?.course) {
      primarySpecialization = identityDetails.student.course;
      primaryProfession = "Student";
    } else if (identityDetails.nurse?.category) {
      primarySpecialization = identityDetails.nurse.category;
      primaryProfession = "Nurse";
    } else if (identityDetails.researcher?.researchArea) {
      primarySpecialization = identityDetails.researcher.researchArea;
      primaryProfession = "Researcher";
    }

    if (targetUserId) {
      try {
        await pool.query(
          `UPDATE "user" 
           SET identity_details = $1, selected_identities = COALESCE($2, selected_identities), "updatedAt" = NOW()
           WHERE id = $3`,
          [JSON.stringify(identityDetails), selectedIdentities.length > 0 ? selectedIdentities : null, targetUserId]
        );

        await pool.query(
          `UPDATE professional_profiles 
           SET identity_details = $1, 
               selected_identities = COALESCE($2, selected_identities),
               specialization = COALESCE($3, specialization),
               profession = COALESCE($4, profession),
               updated_at = NOW()
           WHERE user_id = $5`,
          [
            JSON.stringify(identityDetails),
            selectedIdentities.length > 0 ? selectedIdentities : null,
            primarySpecialization || null,
            primaryProfession || null,
            targetUserId,
          ]
        );

        await pool.query(
          `UPDATE mgn_identities 
           SET identity_details = $1, 
               selected_identities = COALESCE($2, selected_identities),
               specialization = COALESCE($3, specialization),
               profession_or_type = COALESCE($4, profession_or_type),
               updated_at = NOW()
           WHERE user_id = $5`,
          [
            JSON.stringify(identityDetails),
            selectedIdentities.length > 0 ? selectedIdentities : null,
            primarySpecialization || null,
            primaryProfession || null,
            targetUserId,
          ]
        );
      } catch (dbErr) {
        console.warn("Database update error in identity-details:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isSkip ? "Identity details skipped." : "Identity details saved successfully.",
      identityDetails,
    });
  } catch (error: any) {
    console.error("Save identity details error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save identity details." },
      { status: 500 }
    );
  }
}
