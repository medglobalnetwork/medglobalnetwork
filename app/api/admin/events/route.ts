// app/api/admin/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";
import { EventsRepository } from "@/modules/events/repository/events-db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "events.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission events.read required." }, { status: 403 });
    }

    await EventsRepository.ensureTables();

    const eventsRes: any = await sql`
      SELECT 
        e.id, e.slug, e.title, e.event_type, e.category, e.format, e.city, e.state,
        e.start_time, e.end_time, e.price, e.is_free, e.registered_count, e.capacity,
        e.status, e.created_at, e.published_at,
        u.name as organizer_name, u.email as organizer_email,
        o.name as organization_name
      FROM events e
      LEFT JOIN "user" u ON u.id = e.organizer_id
      LEFT JOIN organizations o ON o.id = e.organization_id
      ORDER BY e.created_at DESC
      LIMIT 100
    `.execute(database);

    const statsRes: any = await sql`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'pending_review' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = 'published' THEN 1 END)::int as published,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::int as cancelled
      FROM events
    `.execute(database);

    return NextResponse.json({
      events: eventsRes?.rows || [],
      stats: statsRes?.rows?.[0] || { total: 0, pending: 0, published: 0, cancelled: 0 },
    });
  } catch (error: any) {
    console.error("Error in admin events API:", error);
    return NextResponse.json({ error: error.message || "Failed to load events" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "events.approve")) {
      return NextResponse.json({ error: "Unauthorized. Permission events.approve required." }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetId, status, reason } = body;

    if (action === "update_event_status") {
      const publishedAt = status === "published" ? new Date() : null;

      await sql`
        UPDATE events 
        SET status = ${status}, 
            published_at = COALESCE(published_at, ${publishedAt}),
            rejection_reason = ${reason || null},
            updated_at = NOW() 
        WHERE id = ${targetId}
      `.execute(database);

      await recordAuditLog({
        admin,
        action: `events.status_${status}`,
        entityType: "event",
        entityId: targetId,
        newState: { status, reason },
        reason: reason || `Admin updated event status to ${status}`,
        userAgent: req.headers.get("user-agent") || undefined,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      });

      return NextResponse.json({ success: true, status });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in admin events PATCH:", error);
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}
