// ============================================================
// MGN Location-Aware Suggestion Engine Master Endpoint
// app/api/location/suggestions/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  getLocationSuggestions,
  SuggestionCategoryType,
} from "@/modules/recommendations/lib/location-suggestion-engine";
import { getLatestUserLocation } from "@/lib/location-tracking";
import { isValidLatLng, getCityCoordinates } from "@/lib/geo";

export const dynamic = "force-dynamic";

/**
 * GET /api/location/suggestions
 * Query parameters:
 *  - `lat`, `lng`: User coordinates. If omitted, falls back to latest tracked user location or cookies.
 *  - `radiusKm`: Search radius in km (default: 50, e.g. 5, 15, 50, 100, 200).
 *  - `category`: 'all' | 'people' | 'contents' | 'events' | 'opportunities' | 'facilities' (comma-separated or single).
 *  - `limit`: items per category (default: 10).
 *  - `offset`: pagination offset (default: 0).
 *  - `city`: optional city override (e.g. "Mumbai").
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id || null;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("mgn_session_id")?.value || null;

    const params = req.nextUrl.searchParams;
    let lat = parseFloat(params.get("lat") ?? "");
    let lng = parseFloat(params.get("lng") ?? "");
    let city = params.get("city") || "";
    let state = params.get("state") || "";

    // If city was specified but lat/lng was omitted or invalid, lookup city centroid
    if ((!isValidLatLng({ lat, lng })) && city) {
      const cityCoords = getCityCoordinates(city);
      if (cityCoords) {
        lat = cityCoords.lat;
        lng = cityCoords.lng;
      }
    }

    // If coordinates still omitted, check DB for user's latest tracked location
    if (!isValidLatLng({ lat, lng })) {
      const lastLoc = await getLatestUserLocation(userId, sessionId);
      if (lastLoc) {
        lat = Number(lastLoc.latitude);
        lng = Number(lastLoc.longitude);
        city = city || lastLoc.city || "";
        state = state || lastLoc.state || "";
      }
    }

    // If still omitted, check cookies
    if (!isValidLatLng({ lat, lng })) {
      const latCookie = cookieStore.get("mgn_lat")?.value;
      const lngCookie = cookieStore.get("mgn_lng")?.value;
      if (latCookie && lngCookie) {
        lat = parseFloat(latCookie);
        lng = parseFloat(lngCookie);
        city = city || decodeURIComponent(cookieStore.get("mgn_city")?.value || "");
        state = state || decodeURIComponent(cookieStore.get("mgn_state")?.value || "");
      }
    }

    // Default to Mumbai (financial & central healthcare hub) if completely unavailable
    if (!isValidLatLng({ lat, lng })) {
      lat = 19.0760;
      lng = 72.8777;
      city = city || "Mumbai";
      state = state || "Maharashtra";
    }

    const radiusKm = Math.min(
      500,
      Math.max(1, parseFloat(params.get("radiusKm") ?? "50") || 50)
    );
    const limit = Math.min(50, Math.max(1, parseInt(params.get("limit") ?? "10", 10) || 10));
    const offset = Math.max(0, parseInt(params.get("offset") ?? "0", 10) || 0);

    const categoryParam = params.get("category") || "all";
    const categories = categoryParam
      .split(",")
      .map((c) => c.trim().toLowerCase()) as SuggestionCategoryType[];

    const suggestions = await getLocationSuggestions({
      lat,
      lng,
      city,
      state,
      radiusKm,
      categories,
      limit,
      offset,
      userId,
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("GET /api/location/suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate location suggestions" },
      { status: 500 }
    );
  }
}

