// app/api/calls/ice-servers/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * ICE server list for WebRTC.
 *
 * STUN alone works for most home networks but fails for symmetric NAT and
 * restrictive corporate firewalls — set the TURN_* env vars for those.
 * Credentials are minted here rather than exposed to the bundle.
 */
export async function GET() {
  const servers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  const turnUrl = process.env.TURN_URL;
  const turnUsername = process.env.TURN_USERNAME;
  const turnCredential = process.env.TURN_CREDENTIAL;

  if (turnUrl && turnUsername && turnCredential) {
    servers.push({
      urls: turnUrl.split(",").map((u) => u.trim()).filter(Boolean),
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return NextResponse.json({ servers, hasTurn: Boolean(turnUrl) });
}