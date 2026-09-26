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

    const response = NextResponse.json({
      success: true,
      sessionToken: result.sessionToken,
      userId: result.userId,
    });

    // Set standard session cookie
    response.cookies.set({
      name: "better-auth.session_token",
      value: result.sessionToken,
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
        value: result.sessionToken,
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
