import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`onboard-pi:ip:${clientIp}`, 30, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const firstName = (body.firstName || "").trim();
    const middleName = (body.middleName || "").trim();
    const lastName = (body.lastName || "").trim();
    const dateOfBirth = (body.dateOfBirth || "").trim();
    const gender = (body.gender || "").trim();
    const country = (body.country || "India").trim();
    const state = (body.state || "").trim();
    const city = (body.city || "").trim();
    const isSkip = body.isSkip === true;

    // Resolve userId from session or payload
    let targetUserId = body.userId;
    if (!targetUserId) {
      try {
        const session = await auth.api.getSession({ headers: reqHeaders });
        if (session?.user?.id) {
          targetUserId = session.user.id;
        }
      } catch {}
    }

    // If not skipping, validate required fields
    if (!isSkip) {
      if (!firstName) {
        return NextResponse.json(
          { success: false, error: "First name is required." },
          { status: 400 }
        );
      }
      if (!lastName) {
        return NextResponse.json(
          { success: false, error: "Last name is required." },
          { status: 400 }
        );
      }
      if (!country) {
        return NextResponse.json(
          { success: false, error: "Country is required." },
          { status: 400 }
        );
      }
      if (!state) {
        return NextResponse.json(
          { success: false, error: "State / Province is required." },
          { status: 400 }
        );
      }
      if (!city) {
        return NextResponse.json(
          { success: false, error: "City is required." },
          { status: 400 }
        );
      }
    }

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

    // Ensure database columns exist safely
    try {
      await pool.query(`
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS gender TEXT;
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS first_name TEXT;
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS middle_name TEXT;
        ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_name TEXT;
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS middle_name TEXT;
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
        ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
      `);
    } catch (schemaErr) {
      console.warn("Schema ensure warning in personal-information:", schemaErr);
    }

    // Persist to database if userId is known
    if (targetUserId) {
      try {
        if (fullName) {
          await pool.query(
            `UPDATE "user" 
             SET name = $1, first_name = $2, middle_name = $3, last_name = $4, date_of_birth = $5, gender = $6, "updatedAt" = NOW()
             WHERE id = $7`,
            [fullName, firstName, middleName, lastName, dateOfBirth || null, gender || null, targetUserId]
          );
        }

        await pool.query(
          `INSERT INTO professional_profiles (user_id, first_name, middle_name, last_name, country, state, city, date_of_birth, gender, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             first_name = COALESCE(EXCLUDED.first_name, professional_profiles.first_name),
             middle_name = COALESCE(EXCLUDED.middle_name, professional_profiles.middle_name),
             last_name = COALESCE(EXCLUDED.last_name, professional_profiles.last_name),
             country = COALESCE(EXCLUDED.country, professional_profiles.country),
             state = COALESCE(EXCLUDED.state, professional_profiles.state),
             city = COALESCE(EXCLUDED.city, professional_profiles.city),
             date_of_birth = COALESCE(EXCLUDED.date_of_birth, professional_profiles.date_of_birth),
             gender = COALESCE(EXCLUDED.gender, professional_profiles.gender),
             updated_at = NOW()`,
          [targetUserId, firstName, middleName, lastName, country, state, city, dateOfBirth || null, gender || null]
        );
      } catch (dbErr) {
        console.warn("Could not save to DB in personal-information:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isSkip ? "Personal information skipped." : "Personal information saved successfully.",
      data: {
        firstName,
        middleName,
        lastName,
        fullName,
        dateOfBirth,
        gender,
        country,
        state,
        city,
      },
    });
  } catch (err: any) {
    console.error("Personal information save error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save personal information." },
      { status: 500 }
    );
  }
}
