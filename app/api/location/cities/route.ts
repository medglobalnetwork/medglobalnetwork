// ============================================================
// MGN Cities Autocomplete & Manual Selection API
// app/api/location/cities/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/lib/location-tracking";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "25", 10), 50);

    const cities = searchCities(q, limit);

    return NextResponse.json({
      cities,
      total: cities.length,
    });
  } catch (error) {
    console.error("GET /api/location/cities error:", error);
    return NextResponse.json(
      { error: "Failed to search cities" },
      { status: 500 }
    );
  }
}

