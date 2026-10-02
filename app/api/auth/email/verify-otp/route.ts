import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyEmailOtp } from "@/lib/email-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`email-verify:ip:${clientIp}`, 15, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = (body.email || "").trim().toLowerCase();
    const rawOtp = (body.otp || "").trim();

    if (!rawEmail) {
      return NextResponse.json(
        { success: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    if (!rawOtp || rawOtp.length < 4) {
      return NextResponse.json(
        { success: false, error: "Please enter the 6-digit verification code." },
        { status: 400 }
      );
    }

    const isValid = await verifyEmailOtp(rawEmail, rawOtp);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      email: rawEmail,
      message: "Email address verified successfully.",
    });
  } catch (err: any) {
    console.error("Failed to verify email OTP:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to verify email code. Please try again." },
      { status: 400 }
    );
  }
}
