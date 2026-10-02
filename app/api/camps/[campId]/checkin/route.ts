// app/api/camps/[campId]/checkin/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CampsService } from "@/modules/camps/services/camps-service";
import { isValidLatLng } from "@/lib/geo";
import { checkRateLimit, getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

/** Check-in history for the signed-in user. */
export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ campId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { campId } = await props.params;
    const checkins = await CampsService.getMyCheckIns(campId, session.user.id);
    return NextResponse.json({ checkins });
  } catch (error) {
    console.error("GET /api/camps/[campId]/checkin error:", error);
    return NextResponse.json({ error: "Failed to load check-ins" }, { status: 500 });
  }
}

/**
 * POST — geofence check-in.
 * Body: { lat, lng, accuracy? }
 *
 * Attempts are rate-limited because a device that cannot get a fix will
 * otherwise retry in a loop.
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ campId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const clientIp = getClientIp(await headers());
    if (!checkRateLimit(`camp:checkin:${clientIp}`, 20, 60000).allowed) {
      return NextResponse.json(
        { error: "Too many check-in attempts. Try again shortly." },
        { status: 429 }
      );
    }

    const { campId } = await props.params;
    const body = (await req.json().catch(() => ({}))) ?? {};
    const point = { lat: body.lat, lng: body.lng };

    if (!isValidLatLng(point)) {
      return NextResponse.json(
        { error: "A GPS fix is required to check in" },
        { status: 400 }
      );
    }

    const result = await CampsService.checkIn({
      campId,
      userId: session.user.id,
      lat: point.lat,
      lng: point.lng,
      accuracyMeters:
        typeof body.accuracy === "number" ? body.accuracy : null,
    });

    if (!result.ok) {
      // Outside the fence is a valid, recorded outcome, not a server error.
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          distanceMeters: "distanceMeters" in result ? result.distanceMeters : null,
          radiusMeters: "radiusMeters" in result ? result.radiusMeters : null,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      distanceMeters: result.distanceMeters,
      radiusMeters: result.radiusMeters,
    });
  } catch (error) {
    console.error("POST /api/camps/[campId]/checkin error:", error);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}