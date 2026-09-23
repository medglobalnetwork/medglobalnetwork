// ============================================================
// MGN Communication Engine — Communication Settings API
// app/api/v1/communication/settings/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const settings = await CommunicationService.getSettings(session.user.id);
    return Response.json({ success: true, data: settings });
  } catch (err: any) {
    console.error("GET communication settings error:", err);
    return Response.json({ error: err.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await CommunicationService.updateSettings(session.user.id, body);
    return Response.json({ success: true, message: "Settings updated" });
  } catch (err: any) {
    console.error("POST communication settings error:", err);
    return Response.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}
