// ============================================================
// MGN Admin Control Plane — Network & Communities API
// app/api/admin/network/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession } from "@/modules/admin/lib/rbac";
import { ensureNetworkingTables } from "@/modules/network/lib/network-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    await ensureNetworkingTables();

    // 1. Communities list
    const commRes: any = await sql`
      SELECT 
        c.id,
        c.slug,
        c.name,
        c.description,
        c.specialty,
        c.cover_url,
        c.visibility,
        c.join_mode,
        c.member_count,
        c.post_count,
        c.created_at,
        u.name as creator_name,
        u.email as creator_email
      FROM communities c
      LEFT JOIN "user" u ON u.id = c.created_by
      ORDER BY c.created_at DESC
      LIMIT 100;
    `.execute(database);

    // 2. Real operational network stats
    const statsRes: any = await sql`
      SELECT 
        (SELECT COUNT(*)::INT FROM communities) as total_communities,
        (SELECT COUNT(*)::INT FROM network_posts) as total_posts,
        (SELECT COUNT(*)::INT FROM stories WHERE expires_at > NOW()) as active_stories,
        (SELECT COUNT(*)::INT FROM stories) as total_stories,
        (SELECT COUNT(*)::INT FROM connections) as total_connections
    `.execute(database);

    const stats = statsRes?.rows?.[0] || {
      total_communities: 0,
      total_posts: 0,
      active_stories: 0,
      total_stories: 0,
      total_connections: 0,
    };

    return NextResponse.json({
      communities: commRes?.rows || [],
      stats,
    });
  } catch (error: any) {
    console.error("GET /api/admin/network error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load network administration telemetry" },
      { status: 500 }
    );
  }
}
