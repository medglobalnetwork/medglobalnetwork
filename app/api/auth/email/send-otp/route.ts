import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sendEmailOtp, checkEmailRegistered } from "@/lib/email-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    // IP rate limit: max 10 OTP requests per minute per IP
    const ipLimit = checkRateLimit(`email-otp:ip:${clientIp}`, 10, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification requests. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = (body.email || "").trim().toLowerCase();
    const purpose = (body.purpose || "signup") as "signup" | "login" | "verify";

    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (purpose === "signup") {
      const alreadyExists = await checkEmailRegistered(rawEmail);
      if (alreadyExists) {
        return NextResponse.json(
          {
            success: false,
            alreadyExists: true,
            error: "An account with this email address already exists. Please log in.",
          },
          { status: 409 }
        );
      }
    }

    // Email-based rate limit: max 3 per 2 minutes
    const emailLimit = checkRateLimit(`email-otp:addr:${rawEmail}`, 3, 120000);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification codes requested for this email. Please wait a moment." },
        { status: 429 }
      );
    }

    const result = await sendEmailOtp(rawEmail, purpose);

    return NextResponse.json({
      success: true,
      message: result.message,
      email: result.email,
      expiresInSeconds: result.expiresInSeconds,
      ...(result.devOtp ? { devOtp: result.devOtp } : {}),
    });
  } catch (err: any) {
    console.error("Failed to send email OTP:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send verification code. Please try again." },
      { status: 400 }
    );
  }
}
