// app/api/learn/live/sessions/[sessionId]/attendance/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    if (liveSession.instructor_id !== session.user.id && liveSession.user_role !== "co_host") {
      return Response.json({ error: "Forbidden: Only instructor/co-host can view attendance roster" }, { status: 403 });
    }

    const attendance = await LiveClassroomRepository.getAttendanceList(sessionId);
    const totalEligible = attendance.filter((a) => a.is_eligible).length;

    return Response.json({
      attendance,
      summary: {
        total_tracked: attendance.length,
        total_eligible: totalEligible,
        min_required_percentage: liveSession.settings?.min_attendance_percentage || 75,
      },
    });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/attendance error:`, err);
    return Response.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}
