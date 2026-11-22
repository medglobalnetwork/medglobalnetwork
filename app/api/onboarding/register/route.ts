import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { normalizePhoneNumber, findUserByPhone, sendPhoneOtp } from "@/lib/phone-auth";
import { checkEmailRegistered, sendEmailOtp } from "@/lib/email-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`onboard-reg:ip:${clientIp}`, 15, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const firstName = (body.firstName || "").trim();
    const lastName = (body.lastName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const rawPhone = (body.phone || "").trim();
    const countryCode = (body.countryCode || "+91").trim();
    const password = body.password || "";
    const accountType = (body.accountType || "INDIVIDUAL").trim();

    // 1. Validation
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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: "Mobile number is required." },
        { status: 400 }
      );
    }

    const phoneFull = rawPhone.startsWith("+") ? rawPhone : `${countryCode}${rawPhone}`;
    const normalizedPhone = normalizePhoneNumber(phoneFull);
    const digitsOnly = normalizedPhone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid mobile number (at least 10 digits)." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 2. Prevent duplicate accounts (Duplicate Email check)
    const emailExists = await checkEmailRegistered(email);
    if (emailExists) {
      return NextResponse.json(
        {
          success: false,
          field: "email",
          error: "An account with this email address already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    // 3. Prevent duplicate accounts (Duplicate Mobile Number check)
    const phoneExists = await findUserByPhone(normalizedPhone);
    if (phoneExists) {
      return NextResponse.json(
        {
          success: false,
          field: "phone",
          error: "An account with this mobile number already exists. Please sign in.",
        },
        { status: 409 }
      );
    }

    const fullName = `${firstName} ${lastName}`.trim();

    // 4. Create user record with secure server-side password hashing via Better Auth
    let createdUser: { id: string; email: string; name?: string } | null = null;
    try {
      const authUserResult = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: fullName,
        },
        headers: reqHeaders,
      });
      createdUser = authUserResult?.user || null;
    } catch (authErr: any) {
      console.error("signUpEmail error in onboarding:", authErr);
      return NextResponse.json(
        { success: false, error: authErr.message || "Failed to create account credentials." },
        { status: 400 }
      );
    }

    if (!createdUser?.id) {
      return NextResponse.json(
        { success: false, error: "Account creation failed. Please try again." },
        { status: 500 }
      );
    }

    // 5. Update user table with normalized phone & onboarding accountType
    try {
      await pool.query(
        `UPDATE "user" 
         SET phone = $1, "updatedAt" = NOW()
         WHERE id = $2`,
        [normalizedPhone, createdUser.id]
      );
    } catch (dbErr) {
      console.warn("Could not save phone to user record:", dbErr);
    }

    // Initialize individual onboarding identity draft record if needed
    try {
      await pool.query(
        `INSERT INTO professional_profiles (user_id, account_type, first_name, last_name, full_name, phone, verification_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           account_type = EXCLUDED.account_type,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           full_name = EXCLUDED.full_name,
           phone = EXCLUDED.phone,
           updated_at = NOW()`,
        [createdUser.id, accountType, firstName, lastName, fullName, normalizedPhone]
      );
    } catch (profErr) {
      console.warn("Could not upsert draft professional profile:", profErr);
    }

    // 6. Initiate email & mobile OTP verification in background
    let emailOtpSent = false;
    let phoneOtpSent = false;

    try {
      await sendEmailOtp(email, "signup");
      emailOtpSent = true;
    } catch (e) {
      console.warn("Email OTP trigger error:", e);
    }

    try {
      await sendPhoneOtp(normalizedPhone, "signup");
      phoneOtpSent = true;
    } catch (p) {
      console.warn("Phone OTP trigger error:", p);
    }

    return NextResponse.json({
      success: true,
      userId: createdUser.id,
      email,
      phone: normalizedPhone,
      fullName,
      emailOtpSent,
      phoneOtpSent,
      message: "Account registered successfully. Verification OTP dispatched.",
    });
  } catch (error: any) {
    console.error("Onboarding register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
