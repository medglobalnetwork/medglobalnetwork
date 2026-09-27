import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  verifyPhoneOtp,
  findOrCreateUserByPhone,
  createPhoneSession,
  normalizePhoneNumber,
} from "@/lib/phone-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = (body.phone || "").trim();
    const rawOtp = (body.otp || "").trim();
    const fullName = (body.name || "").trim();

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

    // OTP is valid - find or create user
    const user = await findOrCreateUserByPhone(rawPhone, fullName);

    // Extract headers for session tracking
    const reqHeaders = await headers();
    const userAgent = reqHeaders.get("user-agent");
    const ipAddress =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() ||
      reqHeaders.get("x-real-ip");

    // Create session in PostgreSQL
    const { sessionToken, signedSessionToken, maxAge } = await createPhoneSession(
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
        isNewUser: user.isNewUser,
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
