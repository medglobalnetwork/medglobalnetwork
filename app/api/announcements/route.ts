// app/api/announcements/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/modules/admin/lib/rbac";
import {
  AnnouncementScope,
  AnnouncementService,
} from "@/modules/shared/notifications/announcement-service";

export const dynamic = "force-dynamic";

const SCOPES: AnnouncementScope[] = ["global", "camp", "event"];
const PRIORITIES = ["normal", "high", "urgent"] as const;

/** Announcements the signed-in user can see, newest and most urgent first. */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get("limit") || "50", 10) || 50,
      200
    );

    const announcements = await AnnouncementService.listForUser(session.user.id, limit);
    const unreadCount = announcements.filter((a: any) => !a.is_read).length;

    return NextResponse.json({ data: announcements, unreadCount });
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json(
      { error: "Failed to load announcements" },
      { status: 500 }
    );
  }
}

/**
 * Publishes an announcement.
 *   scope=global → any admin may publish.
 *   scope=camp   → the camp's organizer.
 *   scope=event  → the event's organizer.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { scope, scopeId, title, body: message, priority, expiresAt } = body ?? {};

    if (!SCOPES.includes(scope)) {
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
    }
    if (scope !== "global" && !scopeId) {
      return NextResponse.json(
        { error: `scopeId is required for ${scope} announcements` },
        { status: 400 }
      );
    }
    if (typeof title !== "string" || !title.trim() || title.length > 255) {
      return NextResponse.json(
        { error: "Title is required (max 255 characters)" },
        { status: 400 }
      );
    }
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Body is required" }, { status: 400 });
    }

    const resolvedPriority = PRIORITIES.includes(priority) ? priority : "normal";

    if (scope === "global") {
      const admin = await getAdminSession();
      if (!admin) {
        return NextResponse.json(
          { error: "Only admins can publish global announcements" },
          { status: 403 }
        );
      }
    } else {
      const allowed = await AnnouncementService.canPublish(
        session.user.id,
        scope,
        String(scopeId)
      );
      if (!allowed) {
        return NextResponse.json(
          { error: `Only the ${scope} organizer can publish here` },
          { status: 403 }
        );
      }
    }

    const parsedExpiry =
      expiresAt && !Number.isNaN(Date.parse(expiresAt)) ? new Date(expiresAt) : null;

    const announcement = await AnnouncementService.create({
      scope,
      scopeId: scope === "global" ? null : String(scopeId),
      createdBy: session.user.id,
      title: title.trim(),
      body: message.trim(),
      priority: resolvedPriority,
      expiresAt: parsedExpiry,
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json(
      { error: "Failed to publish announcement" },
      { status: 500 }
    );
  }
}