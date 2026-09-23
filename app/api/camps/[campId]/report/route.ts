// app/api/camps/[campId]/report/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampsService } from "@/modules/camps/services/camps-service";
import { database } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campId: string }> }
) {
  const { campId } = await params;
  try {
    const db = database as any;
    const report = await db
      .selectFrom("camp_reports")
      .selectAll()
      .where("camp_id", "=", campId)
      .executeTakeFirst();

    return Response.json({ report: report || null });
  } catch (err: any) {
    console.error("GET /api/camps/[campId]/report error:", err);
    return Response.json({ error: err.message || "Failed to fetch camp report" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campId: string }> }
) {
  const { campId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.key_findings_summary || body.key_findings_summary.trim().length < 10) {
      return Response.json({ error: "Key findings summary is required." }, { status: 400 });
    }

    const report = await CampsService.submitCampReport(campId, body, session.user.id);
    return Response.json({ success: true, report });
  } catch (err: any) {
    console.error("POST /api/camps/[campId]/report error:", err);
    return Response.json({ error: err.message || "Failed to submit camp report" }, { status: 400 });
  }
}
