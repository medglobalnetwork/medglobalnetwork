// app/api/shared/calendar/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CentralCalendarService } from "@/modules/shared/scheduling/calendar-service";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fromDate = searchParams.get("from") || undefined;
  const toDate = searchParams.get("to") || undefined;

  try {
    const agenda = await CentralCalendarService.getUserAgenda(session.user.id, {
      fromDate,
      toDate,
      limit: 100,
    });

    return Response.json({ agenda });
  } catch (err: any) {
    console.error("GET /api/shared/calendar error:", err);
    return Response.json({ error: err.message || "Failed to fetch calendar agenda" }, { status: 500 });
  }
}
