import { auth, pool, database } from "@/lib/auth";
import { headers } from "next/headers";
import { sql } from "kysely";
import { getAdminSession } from "@/modules/admin/lib/rbac";

export const dynamic = "force-dynamic";

async function ensureAdsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS sponsored_campaigns (
      id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      title              TEXT NOT NULL,
      subtitle           TEXT,
      banner_url         TEXT NOT NULL,
      banner_mobile_url  TEXT,
      display_style      TEXT NOT NULL DEFAULT 'creative_image',
      target_url         TEXT NOT NULL,
      cta_text           TEXT NOT NULL DEFAULT 'Learn More',
      slot               TEXT NOT NULL DEFAULT 'feed_hero',
      target_profession  TEXT NOT NULL DEFAULT 'all',
      status             TEXT NOT NULL DEFAULT 'active',
      impressions        INTEGER NOT NULL DEFAULT 0,
      clicks             INTEGER NOT NULL DEFAULT 0,
      created_by         TEXT,
      created_at         TIMESTAMPTZ DEFAULT now(),
      updated_at         TIMESTAMPTZ DEFAULT now()
    );
  `.execute(database);

  await sql`ALTER TABLE sponsored_campaigns ADD COLUMN IF NOT EXISTS banner_mobile_url TEXT;`.execute(database);
  await sql`ALTER TABLE sponsored_campaigns ADD COLUMN IF NOT EXISTS display_style TEXT DEFAULT 'creative_image';`.execute(database);
  await sql`CREATE INDEX IF NOT EXISTS idx_ads_slot_status ON sponsored_campaigns(slot, status);`.execute(database);
}

export async function GET() {
  const reqHeaders = await headers();
  const admin = await getAdminSession(reqHeaders);
  if (!admin) {
    return Response.json({ error: "Unauthorized admin access" }, { status: 403 });
  }

  try {
    await ensureAdsTable();
    const result = await sql<any>`
      SELECT * FROM sponsored_campaigns
      ORDER BY created_at DESC
    `.execute(database);

    const stats = {
      total_campaigns: result.rows.length,
      active_campaigns: result.rows.filter((r) => r.status === "active").length,
      total_impressions: result.rows.reduce((acc, r) => acc + (r.impressions || 0), 0),
      total_clicks: result.rows.reduce((acc, r) => acc + (r.clicks || 0), 0),
    };

    return Response.json({ campaigns: result.rows, stats });
  } catch (err: any) {
    console.error("GET /api/admin/ads error:", err);
    return Response.json({ error: err.message || "Failed to fetch ad campaigns" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const reqHeaders = await headers();
  const admin = await getAdminSession(reqHeaders);
  if (!admin) {
    return Response.json({ error: "Unauthorized admin access" }, { status: 403 });
  }

  try {
    await ensureAdsTable();
    const body = await request.json();
    const {
      title,
      subtitle,
      banner_url,
      banner_mobile_url,
      display_style,
      target_url,
      cta_text,
      slot,
      target_profession,
      status,
    } = body;

    if (!title || !banner_url || !target_url) {
      return Response.json(
        { error: "Campaign title, banner image URL, and destination URL are required." },
        { status: 400 }
      );
    }

    const result = await sql<any>`
      INSERT INTO sponsored_campaigns (
        title, subtitle, banner_url, banner_mobile_url, display_style, target_url, cta_text, slot, target_profession, status, created_by, updated_at
      ) VALUES (
        ${title.trim()},
        ${subtitle ? subtitle.trim() : null},
        ${banner_url.trim()},
        ${banner_mobile_url ? banner_mobile_url.trim() : null},
        ${display_style || 'creative_image'},
        ${target_url.trim()},
        ${cta_text ? cta_text.trim() : 'Learn More'},
        ${slot || 'feed_hero'},
        ${target_profession || 'all'},
        ${status || 'active'},
        ${admin.userId},
        now()
      )
      RETURNING *
    `.execute(database);

    return Response.json({
      success: true,
      campaign: result.rows[0],
      message: "Ad campaign created and published successfully!",
    });
  } catch (err: any) {
    console.error("POST /api/admin/ads error:", err);
    return Response.json({ error: err.message || "Failed to create ad campaign" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const reqHeaders = await headers();
  const admin = await getAdminSession(reqHeaders);
  if (!admin) {
    return Response.json({ error: "Unauthorized admin access" }, { status: 403 });
  }

  try {
    await ensureAdsTable();
    const body = await request.json();
    const { id, status, title, subtitle, banner_url, banner_mobile_url, display_style, target_url, cta_text, slot, target_profession } = body;

    if (!id) {
      return Response.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    const result = await sql<any>`
      UPDATE sponsored_campaigns
      SET
        status = COALESCE(${status}, status),
        title = COALESCE(${title}, title),
        subtitle = COALESCE(${subtitle}, subtitle),
        banner_url = COALESCE(${banner_url}, banner_url),
        banner_mobile_url = COALESCE(${banner_mobile_url}, banner_mobile_url),
        display_style = COALESCE(${display_style}, display_style),
        target_url = COALESCE(${target_url}, target_url),
        cta_text = COALESCE(${cta_text}, cta_text),
        slot = COALESCE(${slot}, slot),
        target_profession = COALESCE(${target_profession}, target_profession),
        updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `.execute(database);

    return Response.json({
      success: true,
      campaign: result.rows[0],
      message: "Campaign updated successfully.",
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/ads error:", err);
    return Response.json({ error: err.message || "Failed to update ad campaign" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const reqHeaders = await headers();
  const admin = await getAdminSession(reqHeaders);
  if (!admin) {
    return Response.json({ error: "Unauthorized admin access" }, { status: 403 });
  }

  try {
    await ensureAdsTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    await sql`
      DELETE FROM sponsored_campaigns
      WHERE id = ${id}
    `.execute(database);

    return Response.json({ success: true, message: "Campaign deleted successfully." });
  } catch (err: any) {
    console.error("DELETE /api/admin/ads error:", err);
    return Response.json({ error: err.message || "Failed to delete campaign" }, { status: 500 });
  }
}
