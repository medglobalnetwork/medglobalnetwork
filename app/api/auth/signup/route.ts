import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { normalizePhoneNumber, isPhoneVerifiedRecently, verifyPhoneOtp, findUserByPhone } from "@/lib/phone-auth";
import { isEmailVerifiedRecently, verifyEmailOtp, checkEmailRegistered } from "@/lib/email-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`signup:ip:${clientIp}`, 10, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const rawPhone = (body.phone || "").trim();
    const password = body.password || "";
    const name = (body.name || "").trim();
    const accountType = body.accountType || "INDIVIDUAL";
    const customUsername = (body.username || "").trim().toLowerCase();
    const emailOtp = (body.emailOtp || "").trim();
    const phoneOtp = (body.phoneOtp || "").trim();

    // 1. Basic Fields Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: "Mobile number is required for verified registration." },
        { status: 400 }
      );
    }

    const phone = normalizePhoneNumber(rawPhone);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Name is required (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // 2. Conflict Checks: Ensure email and phone are not already taken
    const emailTaken = await checkEmailRegistered(email);
    if (emailTaken) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists. Please log in." },
        { status: 409 }
      );
    }

    const phoneUser = await findUserByPhone(phone);
    if (phoneUser) {
      return NextResponse.json(
        { success: false, error: "An account with this mobile number already exists. Please log in." },
        { status: 409 }
      );
    }

    // 3. Mandatory Phone Verification Check:
    let isPhoneVerified = await isPhoneVerifiedRecently(phone);
    if (!isPhoneVerified && phoneOtp) {
      isPhoneVerified = await verifyPhoneOtp(phone, phoneOtp);
    }
    if (!isPhoneVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Mobile number has not been verified. Please verify phone OTP before creating account.",
          unverifiedField: "phone",
        },
        { status: 400 }
      );
    }

    // 4. Mandatory Email Verification Check:
    let isEmailVerified = await isEmailVerifiedRecently(email);
    if (!isEmailVerified && emailOtp) {
      isEmailVerified = await verifyEmailOtp(email, emailOtp);
    }
    if (!isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Email address has not been verified. Please verify email verification code before creating account.",
          unverifiedField: "email",
        },
        { status: 400 }
      );
    }

    // 5. Create user via Better Auth API
    let authUserResult: any = null;
    try {
      authUserResult = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: reqHeaders,
      });
    } catch (authErr: any) {
      console.error("Better Auth signUpEmail error:", authErr);
      return NextResponse.json(
        { success: false, error: authErr.message || "Failed to create user credentials." },
        { status: 400 }
      );
    }

    const createdUser = authUserResult?.user;
    if (!createdUser?.id) {
      return NextResponse.json(
        { success: false, error: "Account creation failed. Please try again." },
        { status: 500 }
      );
    }

    // 6. Update user in PostgreSQL with verified phone and email status
    await pool.query(
      `UPDATE "user" 
       SET phone = $1, "emailVerified" = TRUE, username = COALESCE(NULLIF($2, ''), username), "updatedAt" = NOW()
       WHERE id = $3`,
      [phone, customUsername || null, createdUser.id]
    );

    // 7. Update professional_profiles if custom username was provided
    if (customUsername) {
      await pool.query(
        `UPDATE professional_profiles 
         SET username = $1, phone = $2, updated_at = NOW()
         WHERE user_id = $3`,
        [customUsername, phone, createdUser.id]
      );
    } else {
      await pool.query(
        `UPDATE professional_profiles 
         SET phone = $1, updated_at = NOW()
         WHERE user_id = $2`,
        [phone, createdUser.id]
      );
    }

    // 8. Prepare response with session cookies if available
    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({
      success: true,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        phone,
        emailVerified: true,
        accountType,
      },
      message: "Account verified and created successfully!",
    });

    return response;
  } catch (err: any) {
    console.error("Signup completion error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to complete account registration." },
      { status: 500 }
    );
  }
}
