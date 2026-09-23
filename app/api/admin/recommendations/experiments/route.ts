// ============================================================
// MGN Admin API — Recommendation A/B Experiments
// app/api/admin/recommendations/experiments/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import {
  recDb,
  ensureRecommendationTables,
  generateRecId,
} from "@/modules/recommendations/lib/recommendations-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await ensureRecommendationTables();

    const experiments = await recDb
      .selectFrom("recommendation_experiments")
      .selectAll()
      .orderBy("created_at", "desc")
      .execute();

    return NextResponse.json({ experiments });
  } catch (err: any) {
    console.error("GET /api/admin/recommendations/experiments error:", err);
    return NextResponse.json({ error: err.message || "Failed to load experiments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "settings.write")) {
      return NextResponse.json({ error: "Unauthorized. Permission settings.write required." }, { status: 403 });
    }

    await ensureRecommendationTables();
    const body = await req.json();
    const { name, description, variant_a_config, variant_b_config, traffic_split, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Experiment name is required" }, { status: 400 });
    }

    const id = generateRecId();
    const now = new Date();

    await recDb
      .insertInto("recommendation_experiments")
      .values({
        id,
        name,
        description: description || null,
        status: status || "active",
        variant_a_config: JSON.stringify(variant_a_config || {}),
        variant_b_config: JSON.stringify(variant_b_config || {}),
        traffic_split: Number(traffic_split) || 50,
        created_at: now,
        updated_at: now,
      })
      .execute();

    return NextResponse.json({ success: true, id, name });
  } catch (err: any) {
    console.error("POST /api/admin/recommendations/experiments error:", err);
    return NextResponse.json({ error: err.message || "Failed to create experiment" }, { status: 500 });
  }
}
