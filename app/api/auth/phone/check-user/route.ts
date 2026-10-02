import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { findUserByPhone, normalizePhoneNumber } from "@/lib/phone-auth";
import { checkRateLimit, getClientIp } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const reqHeaders = await headers();
    const clientIp = getClientIp(reqHeaders);

    const ipLimit = checkRateLimit(`phone-check:${clientIp}`, 30, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { exists: false, error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawPhone = (body.phone || "").trim();

    if (!rawPhone) {
      return NextResponse.json(
        { exists: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(rawPhone);
    const user = await findUserByPhone(normalized);

    return NextResponse.json({
      exists: Boolean(user),
      phone: normalized,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Phone check error:", err);
    return NextResponse.json(
      { exists: false, error: err.message || "Failed to check phone number." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawPhone = url.searchParams.get("phone") || "";

    if (!rawPhone) {
      return NextResponse.json(
        { exists: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(rawPhone);
    const user = await findUserByPhone(normalized);

    return NextResponse.json({
      exists: Boolean(user),
      phone: normalized,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Phone check GET error:", err);
    return NextResponse.json(
      { exists: false, error: err.message || "Failed to check phone number." },
      { status: 500 }
    );
  }
}
