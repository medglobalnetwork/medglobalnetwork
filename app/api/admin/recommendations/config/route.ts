// ============================================================
// MGN Admin API — Recommendation Engine Configuration
// app/api/admin/recommendations/config/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import {
  getRecommendationConfig,
  updateRecommendationConfig,
} from "@/modules/recommendations/lib/admin-config";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 403 });
    }

    const config = await getRecommendationConfig();
    return NextResponse.json({ config });
  } catch (err: any) {
    console.error("GET /api/admin/recommendations/config error:", err);
    return NextResponse.json({ error: err.message || "Failed to load config" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "settings.write")) {
      return NextResponse.json({ error: "Unauthorized. Permission settings.write required." }, { status: 403 });
    }

    const body = await req.json();
    const previousConfig = await getRecommendationConfig();
    const updatedConfig = await updateRecommendationConfig(body, admin.userId);

    await recordAuditLog({
      admin,
      action: "recommendations.config_updated",
      entityType: "recommendation_rules",
      entityId: "master_config",
      previousState: previousConfig,
      newState: updatedConfig,
      reason: body.reason || "Admin updated recommendation weights and parameters",
    });

    return NextResponse.json({
      success: true,
      message: "Recommendation engine configuration updated successfully",
      config: updatedConfig,
    });
  } catch (err: any) {
    console.error("PUT /api/admin/recommendations/config error:", err);
    return NextResponse.json({ error: err.message || "Failed to update config" }, { status: 500 });
  }
}
