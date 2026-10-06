import { database } from "@/lib/auth";
import { sql } from "kysely";
import { NextRequest, NextResponse } from "next/server";

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

  // Check if any campaign exists, if not seed initial demo campaigns
  const countRes = await sql<any>`SELECT count(*)::int as count FROM sponsored_campaigns`.execute(database);
  if (countRes.rows[0]?.count === 0) {
    await sql`
      INSERT INTO sponsored_campaigns (title, subtitle, banner_url, banner_mobile_url, display_style, target_url, cta_text, slot, target_profession, status)
      VALUES 
      (
        'Annual Clinical Excellence Summit 2026',
        'Earn 15 accredited CME credit points. Join 1,200+ doctors across cardiology and neurology.',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
        'creative_image',
        '/learn/courses',
        'Register for CME',
        'feed_hero',
        'all',
        'active'
      ),
      (
        'Medical Device Innovation Fellowship',
        'Exclusive grants and clinical research funding for resident doctors & clinicians.',
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
        null,
        'rich_card',
        '/opportunities/jobs',
        'Apply for Grant',
        'sidebar_featured',
        'all',
        'active'
      );
    `.execute(database);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureAdsTable();
    const { searchParams } = new URL(request.url);
    const slot = searchParams.get("slot") || "feed_hero";
    const profession = searchParams.get("profession");

    let query = sql<any>`
      SELECT id, title, subtitle, banner_url, banner_mobile_url, display_style, target_url, cta_text, slot, target_profession
      FROM sponsored_campaigns
      WHERE status = 'active'
      AND (slot = ${slot} OR slot = 'all')
    `;

    if (profession && profession !== "all") {
      query = sql<any>`
        ${query} AND (target_profession = ${profession} OR target_profession = 'all')
      `;
    }

    query = sql<any>`
      ${query} ORDER BY random() LIMIT 5
    `;

    const result = await query.execute(database);

    // Increment impressions asynchronously
    if (result.rows.length > 0) {
      const ids = result.rows.map((r: any) => r.id);
      sql`
        UPDATE sponsored_campaigns
        SET impressions = impressions + 1
        WHERE id = ANY(${ids}::text[])
      `.execute(database).catch(() => {});
    }

    return NextResponse.json({ ads: result.rows });
  } catch (err: any) {
    console.error("GET /api/ads error:", err);
    return NextResponse.json({ ads: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (id) {
      await sql`
        UPDATE sponsored_campaigns
        SET clicks = clicks + 1
        WHERE id = ${id}
      `.execute(database);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
