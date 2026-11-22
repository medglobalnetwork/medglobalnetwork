import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { pool } from "@/lib/auth";
import { normalizePhoneNumber, findUserByPhone, sendPhoneOtp } from "@/lib/phone-auth";
import { checkEmailRegistered, sendEmailOtp } from "@/lib/email-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`onboard-update:ip:${clientIp}`, 10, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { userId, type, value } = body;

    if (!type || !value) {
      return NextResponse.json(
        { success: false, error: "Missing required contact details." },
        { status: 400 }
      );
    }

    if (type === "email") {
      const email = value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      // Check if duplicate
      const alreadyExists = await checkEmailRegistered(email);
      if (alreadyExists) {
        return NextResponse.json(
          { success: false, error: "This email address is already in use by another account." },
          { status: 409 }
        );
      }

      // Update database if userId provided
      if (userId) {
        try {
          await pool.query(
            `UPDATE "user" SET email = $1, "emailVerified" = FALSE, "updatedAt" = NOW() WHERE id = $2`,
            [email, userId]
          );
        } catch (dbErr) {
          console.warn("Could not update user email:", dbErr);
        }
      }

      // Dispatch fresh OTP
      await sendEmailOtp(email, "verify");

      return NextResponse.json({
        success: true,
        type: "email",
        newValue: email,
        message: `Email updated. A new verification code has been dispatched to ${email}.`,
      });
    }

    if (type === "phone") {
      const normalizedPhone = normalizePhoneNumber(value);
      const digits = normalizedPhone.replace(/\D/g, "");
      if (digits.length < 10) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid 10-digit mobile number." },
          { status: 400 }
        );
      }

      // Check if duplicate
      const existingUser = await findUserByPhone(normalizedPhone);
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { success: false, error: "This mobile number is already registered to another account." },
          { status: 409 }
        );
      }

      // Update database if userId provided
      if (userId) {
        try {
          await pool.query(
            `UPDATE "user" SET phone = $1, "updatedAt" = NOW() WHERE id = $2`,
            [normalizedPhone, userId]
          );
          await pool.query(
            `UPDATE professional_profiles SET phone = $1, updated_at = NOW() WHERE user_id = $2`,
            [normalizedPhone, userId]
          );
        } catch (dbErr) {
          console.warn("Could not update user phone:", dbErr);
        }
      }

      // Dispatch fresh OTP
      await sendPhoneOtp(normalizedPhone, "verify");

      return NextResponse.json({
        success: true,
        type: "phone",
        newValue: normalizedPhone,
        message: `Mobile number updated. A new verification code has been dispatched to ${normalizedPhone}.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid contact type specified." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Update contact error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update contact. Please try again." },
      { status: 500 }
    );
  }
}
