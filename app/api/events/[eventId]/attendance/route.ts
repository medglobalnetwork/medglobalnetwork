// app/api/events/[eventId]/attendance/route.ts
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
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { attendeeUserId } = await request.json();
    if (!attendeeUserId) {
      return Response.json({ error: "attendeeUserId is required" }, { status: 400 });
    }

    const result = await EventsService.markAttendanceAndIssueCert(eventId, attendeeUserId, session.user.id);
    return Response.json(result);
  } catch (err: any) {
    console.error("POST /api/events/[eventId]/attendance error:", err);
    return Response.json({ error: err.message || "Failed to mark attendance" }, { status: 400 });
  }
}
