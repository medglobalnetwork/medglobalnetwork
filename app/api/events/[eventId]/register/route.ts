// app/api/events/[eventId]/register/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventsService } from "@/modules/events/services/events-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to register for events." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const registration = await EventsService.registerForEvent(eventId, session.user.id, body?.answers);
    return Response.json({ success: true, registration });
  } catch (err: any) {
    console.error("POST /api/events/[eventId]/register error:", err);
    return Response.json({ error: err.message || "Registration failed." }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const success = await EventsService.cancelRegistration(eventId, session.user.id);
    return Response.json({ success });
  } catch (err: any) {
    console.error("DELETE /api/events/[eventId]/register error:", err);
    return Response.json({ error: err.message || "Failed to cancel registration." }, { status: 400 });
  }
}
