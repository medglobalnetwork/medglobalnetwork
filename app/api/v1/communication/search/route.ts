// ============================================================
// MGN Communication Engine — Communication Search API
// app/api/v1/communication/search/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  try {
    const results = await CommunicationService.searchCommunication(session.user.id, q);
    return Response.json({ success: true, data: results });
  } catch (err: any) {
    console.error("Communication search error:", err);
    return Response.json({ error: err.message || "Failed to perform search" }, { status: 500 });
  }
}
