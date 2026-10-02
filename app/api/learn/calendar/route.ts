import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LearningCalendarService } from "@/modules/learn/lib/student-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const events = await LearningCalendarService.getStudentEvents(session.user.id);
    return Response.json({ events });
  } catch (err: any) {
    console.error("GET /api/learn/calendar error:", err);
    return Response.json({ error: "Failed to fetch student calendar events" }, { status: 500 });
  }
}
