import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/auth";

export async function POST(req: NextRequest) {
  return handleLogout(req);
}

export async function GET(req: NextRequest) {
  return handleLogout(req);
}

async function handleLogout(req: NextRequest) {
  try {
    // 1. Extract session token from cookies or authorization header
    const sessionTokenCookie =
      req.cookies.get("better-auth.session_token")?.value ||
      req.cookies.get("__Secure-better-auth.session_token")?.value ||
      "";

    let rawToken = sessionTokenCookie;
    if (rawToken && rawToken.includes(".")) {
      // Better auth signed token format: <rawToken>.<signature>
      rawToken = rawToken.split(".")[0];
    }

    // 2. Invalidate session in database if token is present
    if (rawToken || sessionTokenCookie) {
      try {
        await pool.query(
          `DELETE FROM session WHERE token = $1 OR token = $2 OR id = $1`,
          [rawToken, sessionTokenCookie]
        );
      } catch (dbErr) {
        console.warn("Session deletion in DB notice:", dbErr);
      }
    }

    // 3. Construct response that removes all auth cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    const cookieNames = [
      "better-auth.session_token",
      "__Secure-better-auth.session_token",
      "better-auth.session_data",
      "better-auth.csrf_token",
      "__Secure-better-auth.csrf_token",
      "better-auth.state",
      "mgn_session",
    ];

    for (const name of cookieNames) {
      // Clear cookie for root path with expired date
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        sameSite: "lax",
      });

      // Also clear secure variant
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.set("better-auth.session_token", "", { path: "/", maxAge: 0 });
    return response;
  }
}
