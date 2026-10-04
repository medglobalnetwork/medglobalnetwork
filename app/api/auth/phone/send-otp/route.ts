import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { sendPhoneOtp, findUserByPhone, normalizePhoneNumber } from "@/lib/phone-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    // IP-based rate limiting: max 10 OTP requests per minute per IP
    const ipLimit = checkRateLimit(`otp:ip:${clientIp}`, 10, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests from this connection. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawPhone = (body.phone || "").trim();
    const purpose = (body.purpose || "login") as "login" | "signup" | "verify";

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(rawPhone);
    const digits = normalized.replace(/\D/g, "");
    if (digits.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Explicit Check for Phone OTP Login Restriction:
    // If logging in, user MUST already exist in the database!
    if (purpose === "login") {
      const existingUser = await findUserByPhone(normalized);
      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            notFound: true,
            error: "No account found with this phone number. Please sign up to create an account.",
          },
          { status: 404 }
        );
      }
    } else if (purpose === "signup") {
      const existingUser = await findUserByPhone(normalized);
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            alreadyExists: true,
            error: "An account with this phone number already exists. Please log in.",
          },
          { status: 409 }
        );
      }
    }

    // Phone-based rate limiting: relaxed to allow reCAPTCHA verification retries
    const phoneLimit = checkRateLimit(`otp:phone:${normalized}`, 10, 120000);
    if (!phoneLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests for this mobile number. Please wait a moment." },
        { status: 429 }
      );
    }

    const result = await sendPhoneOtp(normalized, purpose);

    return NextResponse.json({
      success: true,
      message: result.message,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
      ...(result.devOtp ? { devOtp: result.devOtp } : {}),
    });
  } catch (err: any) {
    console.error("Failed to send phone OTP:", err);
    const status = err.message?.includes("No account found")
      ? 404
      : err.message?.includes("already exists")
      ? 409
      : 400;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send OTP. Please try again." },
      { status }
    );
  }
}
