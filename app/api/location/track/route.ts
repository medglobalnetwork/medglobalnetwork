// ============================================================
// MGN Location Tracking API
// app/api/location/track/route.ts
// ============================================================

import { getSafeSession } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { saveTrackedLocation, getLatestUserLocation } from "@/lib/location-tracking";
import { isValidLatLng } from "@/lib/geo";

export const dynamic = "force-dynamic";

/**
 * POST /api/location/track
 * Records or updates the client's current GPS position.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSafeSession(await headers());
    const userId = session?.user?.id || null;

    const cookieStore = await cookies();
    let sessionId = cookieStore.get("mgn_session_id")?.value;
    if (!sessionId && !userId) {
      sessionId = crypto.randomUUID();
      try {
        cookieStore.set("mgn_session_id", sessionId, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
          httpOnly: true,
          sameSite: "lax",
        });
      } catch {}
    }

    const body = await req.json().catch(() => ({}));
    const lat = parseFloat(body.lat ?? body.latitude);
    const lng = parseFloat(body.lng ?? body.longitude);

    if (!isValidLatLng({ lat, lng })) {
      return NextResponse.json(
        { error: "Valid lat and lng are required" },
        { status: 400 }
      );
    }

    let location: any = null;
    try {
      location = await saveTrackedLocation({
        userId,
        sessionId,
        lat,
        lng,
        accuracyMeters: body.accuracy ?? body.accuracyMeters ?? null,
        altitude: body.altitude ?? null,
        heading: body.heading ?? null,
        speed: body.speed ?? null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || "India",
        locality: body.locality || null,
        postalCode: body.postalCode || null,
        formattedAddress: body.formattedAddress || null,
        source: body.source || "gps",
      });
    } catch (saveErr) {
      console.warn("saveTrackedLocation fallback:", saveErr);
      location = {
        id: "loc_fallback",
        latitude: lat,
        longitude: lng,
        accuracy_meters: body.accuracy ?? null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || "India",
        locality: body.locality || null,
        formatted_address: body.formattedAddress || null,
        source: body.source || "gps",
        updated_at: new Date(),
      };
    }

    const response = NextResponse.json({
      success: true,
      location: {
        id: location.id,
        lat: location.latitude,
        lng: location.longitude,
        accuracy_meters: location.accuracy_meters,
        city: location.city,
        state: location.state,
        country: location.country,
        locality: location.locality,
        formatted_address: location.formatted_address,
        source: location.source,
        updated_at: location.updated_at,
      },
    });

    response.cookies.set("mgn_lat", String(location.latitude), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
    response.cookies.set("mgn_lng", String(location.longitude), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
    if (location.city) {
      response.cookies.set("mgn_city", encodeURIComponent(location.city), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
    }
    if (location.state) {
      response.cookies.set("mgn_state", encodeURIComponent(location.state), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
    }

    return response;
  } catch (error) {
    console.error("POST /api/location/track error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record location" },
      { status: 200 }
    );
  }
}

/**
 * GET /api/location/track
 * Returns the user's latest recorded location.
 */
export async function GET() {
  try {
    const session = await getSafeSession(await headers());
    const userId = session?.user?.id || null;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("mgn_session_id")?.value || null;

    let location: any = null;
    try {
      location = await getLatestUserLocation(userId, sessionId);
    } catch {
      location = null;
    }

    if (!location) {
      // Check cookie fallback
      const latCookie = cookieStore.get("mgn_lat")?.value;
      const lngCookie = cookieStore.get("mgn_lng")?.value;
      const cityCookie = cookieStore.get("mgn_city")?.value;
      const stateCookie = cookieStore.get("mgn_state")?.value;

      if (latCookie && lngCookie) {
        return NextResponse.json({
          location: {
            lat: parseFloat(latCookie),
            lng: parseFloat(lngCookie),
            city: cityCookie ? decodeURIComponent(cityCookie) : null,
            state: stateCookie ? decodeURIComponent(stateCookie) : null,
            country: "India",
            source: "cookie",
          },
        });
      }

      return NextResponse.json({ location: null });
    }

    return NextResponse.json({
      location: {
        id: location.id,
        lat: location.latitude,
        lng: location.longitude,
        accuracy_meters: location.accuracy_meters,
        city: location.city,
        state: location.state,
        country: location.country,
        locality: location.locality,
        formatted_address: location.formatted_address,
        source: location.source,
        updated_at: location.updated_at,
      },
    });
  } catch (error) {
    console.error("GET /api/location/track error:", error);
    return NextResponse.json({ location: null }, { status: 200 });
  }
}

