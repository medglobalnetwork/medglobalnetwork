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

    // 1. Resolve user by email or username
    const userRes = await pool.query(
      `SELECT id, name, email FROM "user" WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) LIMIT 1`,
      [email]
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

    // 2. Try triggering through Better Auth API
    let sentViaBetterAuth = false;
    try {
      const reqHeaders = await headers();
      const origin = reqHeaders.get("origin") || reqHeaders.get("host") || serverConfig.appUrl;
      const cleanOrigin = origin.startsWith("http") ? origin : `https://${origin}`;

      if (typeof (auth.api as any).forgetPassword === "function") {
        await (auth.api as any).forgetPassword({
          body: {
            email: targetEmail,
            redirectTo: `${cleanOrigin}/reset-password`,
          },
          headers: reqHeaders,
        });
        sentViaBetterAuth = true;
      }
    } catch (baErr) {
      console.warn("[FORGOT_PASSWORD] Better-Auth forgetPassword fallback triggered:", baErr);
    }

    // 3. Fallback: If Better Auth didn't dispatch, generate secure token directly in verification table
    if (!sentViaBetterAuth) {
      try {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        const reqHeaders = await headers();
        const origin = reqHeaders.get("origin") || reqHeaders.get("host") || serverConfig.appUrl;
        const cleanOrigin = origin.startsWith("http") ? origin : `https://${origin}`;
        const resetUrl = `${cleanOrigin}/reset-password?token=${token}`;

        // Ensure verification table exists and store token
        await pool.query(`
          CREATE TABLE IF NOT EXISTS verification (
            id TEXT PRIMARY KEY,
            identifier TEXT NOT NULL,
            value TEXT NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `).catch(() => {});

        const recordId = `ver_${crypto.randomUUID()}`;
        await pool.query(
          `INSERT INTO verification (id, identifier, value, expires_at)
           VALUES ($1, $2, $3, $4)`,
          [recordId, `reset-password:${targetEmail}`, token, expiresAt]
        );

        await sendPasswordResetEmail(targetEmail, resetUrl, user.name);
      } catch (directErr) {
        console.error("[FORGOT_PASSWORD] Direct token dispatch error:", directErr);
      }
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
