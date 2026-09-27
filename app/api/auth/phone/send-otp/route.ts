import { NextResponse } from "next/server";
import { sendPhoneOtp } from "@/lib/phone-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = (body.phone || "").trim();

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    const result = await sendPhoneOtp(rawPhone);

    return NextResponse.json({
      success: true,
      message: result.message,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
      devOtp: result.devOtp,
    });
  } catch (err: any) {
    console.error("Failed to send phone OTP:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to send OTP. Please try again." },
      { status: 400 }
    );
  }
}
