import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/mail";
import { serverConfig } from "@/lib/env";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail = body.email || body.identifier;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();

    // 1. Resolve user by email, username or phone
    const userRes = await pool.query(
      `SELECT id, name, email FROM "user" WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) OR phone = $2 LIMIT 1`,
      [email, rawEmail.trim()]
    );

    if (userRes.rows.length === 0) {
      // Return positive message for privacy/security (prevent account enumeration)
      return NextResponse.json({
        success: true,
        message: "If an account is registered with this email, a password reset link has been sent.",
      });
    }

    const user = userRes.rows[0];
    const targetEmail = user.email;

    if (!targetEmail) {
      return NextResponse.json(
        { error: "No email address is linked to this account." },
        { status: 400 }
      );
    }

    // 2. Generate secure token for password reset
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    const reqHeaders = await headers();
    const origin = reqHeaders.get("origin") || reqHeaders.get("host") || serverConfig.appUrl;
    let cleanOrigin = origin.startsWith("http")
      ? origin
      : origin.includes("localhost") || origin.includes("127.0.0.1")
      ? `http://${origin}`
      : `https://${origin}`;
    const resetUrl = `${cleanOrigin}/reset-password?token=${token}`;

    // 3. Store token in verification table with exact Better-Auth schema:
    // identifier: reset-password:${token}, value: user.id, "expiresAt"
    const recordId = `ver_${crypto.randomUUID()}`;
    await pool.query(
      `INSERT INTO verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [recordId, `reset-password:${token}`, user.id, expiresAt]
    );

    // 4. Dispatch branded email to targetEmail
    console.info(`[FORGOT_PASSWORD] Dispatching reset email to ${targetEmail} with URL: ${resetUrl}`);
    const emailSent = await sendPasswordResetEmail(targetEmail, resetUrl, user.name);
    console.info(`[FORGOT_PASSWORD] Email send result for ${targetEmail}: ${emailSent ? "SUCCESS" : "FAILED"}`);

    if (!emailSent) {
      console.warn(`[FORGOT_PASSWORD] SMTP failed to deliver reset link to ${targetEmail}. Fallback reset URL: ${resetUrl}`);
    }

    return NextResponse.json({
      success: true,
      message: "If an account is registered with this email, a password reset link has been sent.",
    });
  } catch (err: any) {
    console.error("POST /api/auth/forgot-password error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
