import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  verifyPhoneOtp,
  findUserByPhone,
  createPhoneSession,
  normalizePhoneNumber,
} from "@/lib/phone-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    // IP rate limit on verification attempts: max 15 per minute
    const ipLimit = checkRateLimit(`verify:ip:${clientIp}`, 15, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }
    const body = await request.json();
    const rawPhone = (body.phone || "").trim();
    const rawOtp = (body.otp || "").trim();
    const isVerifyPath = request.url.includes("/api/auth/phone/verify");
    const purpose = (body.purpose || (isVerifyPath ? "verify" : "login")) as "login" | "signup" | "verify";

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    if (!rawOtp || rawOtp.length < 4) {
      return NextResponse.json(
        { success: false, error: "Please enter the 6-digit OTP code." },
        { status: 400 }
      );
    }

    const isValid = await verifyPhoneOtp(rawPhone, rawOtp);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(rawPhone);

    // If purpose is verification for signup/onboarding only
    if (purpose === "signup" || purpose === "verify") {
      return NextResponse.json({
        success: true,
        verified: true,
        phone: normalizedPhone,
        message: "Phone number verified successfully.",
      });
    }

    // Default purpose is "login": ONLY allow login if account exists!
    const user = await findUserByPhone(normalizedPhone);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          error: "No account found with this phone number. Please sign up to create an account.",
        },
        { status: 404 }
      );
    }

    // Extract headers for session tracking
    const userAgent = reqHeaders.get("user-agent");
    const ipAddress =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() ||
      reqHeaders.get("x-real-ip");

    // Create session in PostgreSQL
    const { signedSessionToken, maxAge } = await createPhoneSession(
      user.id,
      userAgent,
      ipAddress
    );

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        isNewUser: false,
      },
      message: "Authentication successful.",
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
    console.error("Failed to verify phone OTP:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify OTP. Please try again." },
      { status: 400 }
    );
  }
}
