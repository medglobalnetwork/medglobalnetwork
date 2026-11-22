import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`onboard-id:ip:${clientIp}`, 30, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const selectedIdentities: string[] = Array.isArray(body.selectedIdentities)
      ? body.selectedIdentities.filter(Boolean)
      : [];

    if (selectedIdentities.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please select at least one healthcare identity to proceed." },
        { status: 400 }
      );
    }

    // Resolve userId from body or active session
    let targetUserId = body.userId;
    if (!targetUserId) {
      try {
        const session = await auth.api.getSession({ headers: reqHeaders });
        if (session?.user?.id) {
          targetUserId = session.user.id;
        }
      } catch {}
    }

    // Ensure database columns exist
    try {
      await pool.query(`
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS selected_identities TEXT[];
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS selected_identities TEXT[];
        ALTER TABLE mgn_identities ADD COLUMN IF NOT EXISTS selected_identities TEXT[];
      `);
    } catch (schemaErr) {
      console.warn("Schema check warning in onboarding identity:", schemaErr);
    }

    // Update records in database
    if (targetUserId) {
      try {
        await pool.query(
          `UPDATE "user" 
           SET selected_identities = $1, "updatedAt" = NOW()
           WHERE id = $2`,
          [selectedIdentities, targetUserId]
        );

        await pool.query(
          `UPDATE professional_profiles 
           SET selected_identities = $1, updated_at = NOW()
           WHERE user_id = $2`,
          [selectedIdentities, targetUserId]
        );

        await pool.query(
          `UPDATE mgn_identities 
           SET selected_identities = $1, updated_at = NOW()
           WHERE user_id = $2`,
          [selectedIdentities, targetUserId]
        );
      } catch (dbErr) {
        console.warn("Database update note in onboarding identity:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      selectedIdentities,
      message: "Healthcare identities saved successfully.",
    });
  } catch (error: any) {
    console.error("Onboarding identity error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save selected identities." },
      { status: 500 }
    );
  }
}
