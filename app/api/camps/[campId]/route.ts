// app/api/camps/[campId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampsService } from "@/modules/camps/services/camps-service";
import { database } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campId: string }> }
) {
  const { campId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const camp = await CampsService.getCampDetail(campId, session?.user?.id);
    if (!camp) return Response.json({ error: "Medical camp not found" }, { status: 404 });
    return Response.json(camp);
  } catch (err: any) {
    console.error("GET /api/camps/[campId] error:", err);
    return Response.json({ error: err.message || "Failed to fetch camp" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ campId: string }> }
) {
  const { campId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const camp = await CampsService.getCampDetail(campId, session.user.id);
    if (!camp) return Response.json({ error: "Camp not found" }, { status: 404 });

    if (camp.organizer_id !== session.user.id) {
      return Response.json({ error: "Not authorized to update this camp" }, { status: 403 });
    }

    const body = await request.json();
    const db = database as any;
    await db
      .updateTable("camps")
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where("id", "=", campId)
      .execute();

    const updated = await CampsService.getCampDetail(campId, session.user.id);
    return Response.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/camps/[campId] error:", err);
    return Response.json({ error: err.message || "Failed to update camp" }, { status: 500 });
  }
}
