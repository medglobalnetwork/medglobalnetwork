import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkEmailRegistered } from "@/lib/email-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`email-check:${clientIp}`, 30, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { exists: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawEmail = (body.email || "").trim().toLowerCase();

    if (!rawEmail) {
      return NextResponse.json(
        { exists: false, error: "Email address is required." },
        { status: 400 }
      );
    }

    const exists = await checkEmailRegistered(rawEmail);

    return NextResponse.json({
      exists,
      email: rawEmail,
    });
  } catch (err: any) {
    console.error("Email check error:", err);
    return NextResponse.json(
      { exists: false, error: err.message || "Failed to check email." },
      { status: 500 }
    );
  }
}
