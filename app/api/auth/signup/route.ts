import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool, auth } from "@/lib/auth";
import { normalizePhoneNumber, findUserByPhone, createPhoneSession } from "@/lib/phone-auth";
import { isEmailVerifiedRecently, verifyEmailOtp, checkEmailRegistered } from "@/lib/email-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { VerificationService } from "@/modules/onboarding/lib/verification-service";

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

    // 1. Basic Fields Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: "Mobile number is required for registration." },
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

    // 2. Conflict Checks: Check if email is already taken or is completing an existing signup
    const emailTaken = await checkEmailRegistered(email);

    // 3. Mandatory Email Verification Check
    let isEmailVerified = await isEmailVerifiedRecently(email);
    if (!isEmailVerified && emailOtp) {
      isEmailVerified = await verifyEmailOtp(email, emailOtp);
    }
    if (!isEmailVerified) {
      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: "An account with this email address already exists. Please log in." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: "Email address has not been verified. Please enter the verification code sent to your email.",
          unverifiedField: "email",
        },
        { status: 400 }
      );
    }

    const phoneUser = await findUserByPhone(phone);
    if (phoneUser && (!emailTaken || phoneUser.email?.toLowerCase() !== email)) {
      return NextResponse.json(
        { success: false, error: "An account with this mobile number already exists. Please log in." },
        { status: 409 }
      );
    }

    // 5. Create user via Better Auth API, or reuse existing uncompleted record if email OTP is verified
    let createdUser: { id: string; email: string; name?: string } | null = null;
    
    if (emailTaken) {
      const existingUserRes = await pool.query(
        `SELECT id, email, name FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email]
      );
      if (existingUserRes.rows.length > 0) {
        createdUser = existingUserRes.rows[0];
      }
    }

    if (!createdUser) {
      try {
        const authUserResult = await auth.api.signUpEmail({
          body: {
            email,
            password,
            name,
          },
          headers: reqHeaders,
        });
        createdUser = authUserResult?.user || null;
      } catch (authErr: any) {
        // If Better Auth says user already exists, fetch the user record
        if (authErr?.message?.toLowerCase().includes("exists") || authErr?.code === "USER_ALREADY_EXISTS") {
          const fallbackRes = await pool.query(
            `SELECT id, email, name FROM "user" WHERE LOWER(email) = LOWER($1) LIMIT 1`,
            [email]
          );
          if (fallbackRes.rows.length > 0) {
            createdUser = fallbackRes.rows[0];
          }
        }
        
        if (!createdUser) {
          console.error("Better Auth signUpEmail error:", authErr);
          return NextResponse.json(
            { success: false, error: authErr.message || "Failed to create user credentials." },
            { status: 400 }
          );
        }
      }
    }

    if (!createdUser?.id) {
      return NextResponse.json(
        { success: false, error: "Account creation failed. Please try again." },
        { status: 500 }
      );
    }

    // 6. Update user in PostgreSQL with verified phone and email status
    try {
      await pool.query(
        `UPDATE "user" 
         SET phone = $1, "emailVerified" = TRUE, username = COALESCE(NULLIF($2, ''), username), name = COALESCE(NULLIF($3, ''), name), "updatedAt" = NOW()
         WHERE id = $4`,
        [phone, customUsername || null, name, createdUser.id]
      );
    } catch (userUpErr) {
      console.warn("Failed to update user phone/emailVerified status:", userUpErr);
    }

    // 7. Update professional_profiles if custom username was provided
    if (customUsername) {
      try {
        await pool.query(
          `UPDATE professional_profiles 
           SET username = $1, updated_at = NOW()
           WHERE user_id = $2`,
          [customUsername, createdUser.id]
        );
      } catch (profErr) {
        console.warn("Could not update professional profile username:", profErr);
      }
    }

    // 8. Pre-initialize identity record for step tracking
    try {
      await VerificationService.startOrEnroll(createdUser.id, {
        account_type: accountType,
        category: accountType === "INDIVIDUAL" ? "clinical_practitioner" : "hospital",
        profession_or_type: accountType === "INDIVIDUAL" ? "general_physician" : "hospital",
        step: 1,
      });
    } catch (verifInitErr) {
      console.warn("Could not pre-initialize identity record during signup:", verifInitErr);
    }

    // 9. Create session in PostgreSQL & prepare response with session cookies
    const userAgent = reqHeaders.get("user-agent");
    const ipAddress =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() ||
      reqHeaders.get("x-real-ip");

    const { signedSessionToken, maxAge } = await createPhoneSession(
      createdUser.id,
      userAgent,
      ipAddress
    );

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

    // Set standard Better Auth session cookie
    response.cookies.set("better-auth.session_token", signedSessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // If HTTPS / production, also set __Secure- prefix cookie
    if (isProduction) {
      response.cookies.set("__Secure-better-auth.session_token", signedSessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge,
      });
    }

    return response;
  } catch (err: any) {
    console.error("Signup completion error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to complete account registration." },
      { status: 500 }
    );
  }
}
