// ============================================================
// MGN Communication Engine — Presence & Typing API
// app/api/v1/communication/presence/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Ephemeral memory store for active user heartbeats & typing indicators
const activePresenceMap = new Map<string, { lastSeen: number; status: string; typingIn?: string }>();

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");

  if (targetUserId) {
    const presence = activePresenceMap.get(targetUserId);
    const isOnline = presence ? Date.now() - presence.lastSeen < 60000 : false;
    return Response.json({
      success: true,
      online: isOnline,
      status: isOnline ? presence?.status || "ONLINE" : "OFFLINE",
      typingIn: presence?.typingIn || null,
    });
  }

  return Response.json({ success: true });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { status, typingConversationId } = await request.json();
    activePresenceMap.set(session.user.id, {
      lastSeen: Date.now(),
      status: status || "ONLINE",
      typingIn: typingConversationId || undefined,
    });

    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to update presence" }, { status: 500 });
  }
}
