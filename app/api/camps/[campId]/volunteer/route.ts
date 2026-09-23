// app/api/camps/[campId]/volunteer/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampsService } from "@/modules/camps/services/camps-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campId: string }> }
) {
  const { campId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const volunteers = await CampsService.getCampVolunteers(campId, session.user.id);
    return Response.json({ volunteers });
  } catch (err: any) {
    console.error("GET /api/camps/[campId]/volunteer error:", err);
    return Response.json({ error: err.message || "Failed to fetch volunteers" }, { status: 400 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campId: string }> }
) {
  const { campId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to apply as a volunteer" }, { status: 401 });
  }

  try {
    const { roleId, applicationNote } = await request.json();
    if (!roleId) {
      return Response.json({ error: "Role ID is required to apply" }, { status: 400 });
    }

    const application = await CampsService.applyVolunteer(campId, session.user.id, roleId, applicationNote);
    return Response.json({ success: true, application });
  } catch (err: any) {
    console.error("POST /api/camps/[campId]/volunteer error:", err);
    return Response.json({ error: err.message || "Failed to submit volunteer application" }, { status: 400 });
  }
}
