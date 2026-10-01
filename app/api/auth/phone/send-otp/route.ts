import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sendPhoneOtp } from "@/lib/phone-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    // IP-based rate limiting: max 5 OTP requests per minute per IP
    const ipLimit = checkRateLimit(`otp:ip:${clientIp}`, 5, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests from this connection. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawPhone = (body.phone || "").trim();

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    // Phone-based rate limiting: max 3 requests per 2 minutes
    const phoneLimit = checkRateLimit(`otp:phone:${rawPhone}`, 3, 120000);
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests for this mobile number. Please wait a moment." },
        { status: 429 }
      );
    }

    const result = await sendPhoneOtp(rawPhone);

    return NextResponse.json({
      success: true,
      message: result.message,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
      ...(result.devOtp ? { devOtp: result.devOtp } : {}),
    });
  } catch (err: any) {
    console.error("Failed to send phone OTP:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send OTP. Please try again." },
      { status: 400 }
    );
  }
}
