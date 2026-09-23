// app/api/camps/[campId]/volunteer/[volId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampsService } from "@/modules/camps/services/camps-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ campId: string; volId: string }> }
) {
  const { campId, volId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.action === "review") {
      const result = await CampsService.reviewVolunteer(campId, volId, body.status, session.user.id);
      return Response.json(result);
    } else if (body.action === "attendance") {
      const result = await CampsService.markVolunteerAttendance(campId, volId, body.attended, session.user.id);
      return Response.json(result);
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("PATCH /api/camps/[campId]/volunteer/[volId] error:", err);
    return Response.json({ error: err.message || "Failed to update volunteer status" }, { status: 400 });
  }
}
