// app/api/announcements/[announcementId]/read/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { AnnouncementService } from "@/modules/shared/notifications/announcement-service";

export const dynamic = "force-dynamic";

/** Marks one announcement as read for the signed-in user. Idempotent. */
export async function POST(
  _request: Request,
  props: { params: Promise<{ announcementId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { announcementId } = await props.params;
    if (!announcementId) {
      return NextResponse.json({ error: "Missing announcement id" }, { status: 400 });
    }

    await AnnouncementService.markRead(session.user.id, announcementId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/announcements/[id]/read error:", error);
    return NextResponse.json(
      { error: "Failed to mark announcement read" },
      { status: 500 }
    );
  }
}