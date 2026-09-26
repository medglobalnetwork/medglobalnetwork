import { NextRequest, NextResponse } from "next/server";
import { exchangeMobileBridgeCode } from "@/lib/mobile-bridge";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bridge_token } = body;

    if (!bridge_token || typeof bridge_token !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing bridge token" },
        { status: 400 }
      );
    }

    const result = await exchangeMobileBridgeCode(bridge_token);
    if (!result) {
      return NextResponse.json(
        { error: "Bridge token expired or invalid" },
        { status: 401 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24 * 30; // 30 days

    const secret =
      process.env.BETTER_AUTH_SECRET ||
      "mgn-auth-super-secret-key-2026-production-stable-mgnlife";

    let signedSessionToken = result.sessionToken;
    try {
      const { makeSignature } = await import("better-auth/crypto");
      const sig = await makeSignature(result.sessionToken, secret);
      signedSessionToken = `${result.sessionToken}.${sig}`;
    } catch (sigErr) {
      console.warn("Could not sign session cookie with better-auth:", sigErr);
    }

    const response = NextResponse.json({
      success: true,
      sessionToken: result.sessionToken,
      userId: result.userId,
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
    console.error("Error exchanging mobile bridge token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
