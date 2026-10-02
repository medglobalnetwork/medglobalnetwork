// app/api/location/nearby/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CampsService } from "@/modules/camps/services/camps-service";
import { isValidLatLng, formatDistance, estimateWalkMinutes, mapsUrl } from "@/lib/geo";

export const dynamic = "force-dynamic";

const MAX_RADIUS_M = 200_000; // 200 km — beyond that "nearby" is meaningless

/**
 * GET — camps near a coordinate, closest first.
 * `?lat=&lng=&radiusKm=&limit=`
 *
 * Coordinates are passed explicitly rather than derived server-side: the
 * browser never reveals the user's position to us, only the client does.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const params = req.nextUrl.searchParams;
    const point = {
      lat: parseFloat(params.get("lat") ?? ""),
      lng: parseFloat(params.get("lng") ?? ""),
    };

    if (!isValidLatLng(point)) {
      return NextResponse.json(
        { error: "lat and lng query parameters are required" },
        { status: 400 }
      );
    }

    const radiusKm = Math.min(
      MAX_RADIUS_M / 1000,
      Math.max(0.1, parseFloat(params.get("radiusKm") ?? "50") || 50)
    );
    const limit = Math.min(50, Math.max(1, parseInt(params.get("limit") ?? "20", 10) || 20));

    const camps = await CampsService.getNearbyCamps(point, radiusKm * 1000, limit);

    return NextResponse.json({
      camps: camps.map((c) => ({
        ...c,
        distance_label: formatDistance(c.distance_meters),
        walk_minutes: estimateWalkMinutes(c.distance_meters),
        maps_url: mapsUrl(
          { lat: Number(c.latitude), lng: Number(c.longitude) },
          c.venue_name ?? c.title
        ),
      })),
      radius_km: radiusKm,
    });
  } catch (error) {
    console.error("GET /api/location/nearby error:", error);
    return NextResponse.json({ error: "Failed to find nearby camps" }, { status: 500 });
  }
}