// app/api/events/[eventId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventsService } from "@/modules/events/services/events-service";
import { database } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const event = await EventsService.getEventDetail(eventId, session?.user?.id);
    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }
    return Response.json(event);
  } catch (err: any) {
    console.error("GET /api/events/[eventId] error:", err);
    return Response.json({ error: err.message || "Failed to fetch event" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const event = await EventsService.getEventDetail(eventId, session.user.id);
    if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

    if (event.organizer_id !== session.user.id) {
      return Response.json({ error: "Not authorized to update this event" }, { status: 403 });
    }

    const body = await request.json();
    const db = database as any;
    await db
      .updateTable("events")
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where("id", "=", eventId)
      .execute();

    const updated = await EventsService.getEventDetail(eventId, session.user.id);
    return Response.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/events/[eventId] error:", err);
    return Response.json({ error: err.message || "Failed to update event" }, { status: 500 });
  }
}
