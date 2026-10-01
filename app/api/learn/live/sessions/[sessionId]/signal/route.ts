// app/api/learn/live/sessions/[sessionId]/signal/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

// In-memory signaling cache for low-latency WebRTC exchange
const signalingCache = new Map<string, Array<{ from: string; to?: string; type: string; data: any; timestamp: number }>>();

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const since = parseInt(searchParams.get("since") || "0", 10);

  const roomSignals = signalingCache.get(sessionId) || [];
  const mySignals = roomSignals.filter(
    (s) => s.timestamp > since && (!s.to || s.to === session.user.id) && s.from !== session.user.id
  );

  return Response.json({ signals: mySignals, latestTimestamp: Date.now() });
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { to, type, data } = body;

    const signalItem = {
      from: session.user.id,
      to,
      type, // 'offer' | 'answer' | 'ice-candidate' | 'mute' | 'screen'
      data,
      timestamp: Date.now(),
    };

    if (!signalingCache.has(sessionId)) {
      signalingCache.set(sessionId, []);
    }

    const roomSignals = signalingCache.get(sessionId)!;
    roomSignals.push(signalItem);

    // Keep only recent 100 signals per room (older than 2 minutes discarded)
    const cutoff = Date.now() - 120000;
    if (roomSignals.length > 100) {
      const filtered = roomSignals.filter((s) => s.timestamp > cutoff);
      signalingCache.set(sessionId, filtered);
    }

    return Response.json({ success: true, timestamp: signalItem.timestamp });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/signal error:`, err);
    return Response.json({ error: "Signaling failed" }, { status: 500 });
  }
}
