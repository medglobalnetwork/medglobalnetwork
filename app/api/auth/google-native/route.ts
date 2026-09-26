import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/auth";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

interface GoogleTokenInfo {
  sub: string;
  email: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  aud?: string;
  error_description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid Google ID token" },
        { status: 400 }
      );
    }

    // 1. Verify ID token directly with Google's public validation endpoint
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!verifyRes.ok) {
      const errJson = await verifyRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errJson.error_description || "Google ID token validation failed",
        },
        { status: 401 }
      );
    }

    const payload = (await verifyRes.json()) as GoogleTokenInfo;

    const googleSub = payload.sub;
    const email = payload.email?.toLowerCase().trim();
    const name = payload.name || "Medical Professional";
    const picture = payload.picture || null;

    if (!googleSub || !email) {
      return NextResponse.json(
        { error: "Incomplete profile from Google token" },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    let userName: string = name;
    let userEmail: string = email;
    let userImage: string | null = picture;

    // 2. Check if this Google account is already registered
    const accountCheck = await pool.query(
      `SELECT a."userId", u.name, u.email, u.image 
       FROM account a 
       JOIN "user" u ON a."userId" = u.id 
       WHERE a."providerId" = 'google' AND a."accountId" = $1 
       LIMIT 1`,
      [googleSub]
    );

    if (accountCheck.rows && accountCheck.rows.length > 0) {
      userId = accountCheck.rows[0].userId;
      userName = accountCheck.rows[0].name || name;
      userEmail = accountCheck.rows[0].email || email;
      userImage = accountCheck.rows[0].image || picture;
    } else {
      // 3. Check if user with same email exists
      const userCheck = await pool.query(
        `SELECT id, name, email, image FROM "user" WHERE LOWER(email) = $1 LIMIT 1`,
        [email]
      );

      if (userCheck.rows && userCheck.rows.length > 0) {
        userId = userCheck.rows[0].id;
        userName = userCheck.rows[0].name || name;
        userEmail = userCheck.rows[0].email || email;
        userImage = userCheck.rows[0].image || picture;

        // Link Google account to existing user
        const accountId = crypto.randomBytes(16).toString("hex");
        await pool.query(
          `INSERT INTO account (id, "userId", "providerId", "accountId", "createdAt", "updatedAt")
           VALUES ($1, $2, 'google', $3, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [accountId, userId, googleSub]
        );
      } else {
        // 4. Create new user & link Google account
        userId = crypto.randomBytes(16).toString("hex");
        await pool.query(
          `INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, true, $4, NOW(), NOW())`,
          [userId, name, email, picture]
        );

        const accountId = crypto.randomBytes(16).toString("hex");
        await pool.query(
          `INSERT INTO account (id, "userId", "providerId", "accountId", "createdAt", "updatedAt")
           VALUES ($1, $2, 'google', $3, NOW(), NOW())`,
          [accountId, userId, googleSub]
        );
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Unable to establish user account" },
        { status: 500 }
      );
    }

    // 5. Create active session in PostgreSQL
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionId = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await pool.query(
      `INSERT INTO "session" (id, "userId", token, "expiresAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [sessionId, userId, sessionToken, expiresAt]
    );

    const secret =
      process.env.BETTER_AUTH_SECRET ||
      "mgn-auth-super-secret-key-2026-production-stable-mgnlife";
    
    let signedSessionToken = sessionToken;
    try {
      const { makeSignature } = await import("better-auth/crypto");
      const sig = await makeSignature(sessionToken, secret);
      signedSessionToken = `${sessionToken}.${sig}`;
    } catch (sigErr) {
      console.warn("Could not sign session cookie with better-auth:", sigErr);
    }

    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24 * 30; // 30 days

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        image: userImage,
      },
      session: {
        token: sessionToken,
        expiresAt: expiresAt.toISOString(),
      },
    });

    // Set standard signed session cookie
    response.cookies.set({
      name: "better-auth.session_token",
      value: signedSessionToken,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: isProduction,
      maxAge,
    });

    // Set secure cookie variant for HTTPS environments
    if (isProduction) {
      response.cookies.set({
        name: "__Secure-better-auth.session_token",
        value: signedSessionToken,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
        maxAge,
      });
    }

    return response;
  } catch (error) {
    console.error("Native Google sign-in error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication error" },
      { status: 500 }
    );
  }
}
