// app/api/camps/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampsService } from "@/modules/camps/services/camps-service";
import { validateCreateCampInput } from "@/modules/camps/validation/camps-validation";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { searchParams } = new URL(request.url);

  const params = {
    search: searchParams.get("search") || undefined,
    camp_type: searchParams.get("type") || undefined,
    city: searchParams.get("city") || undefined,
    timeframe: (searchParams.get("timeframe") as any) || "upcoming",
    has_volunteer_slots: searchParams.get("volunteer") === "true",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
    organizer_id: searchParams.get("organizer_id") || undefined,
  };

  try {
    const result = await CampsService.getCamps(params, session?.user?.id);
    return Response.json(result);
  } catch (err: any) {
    console.error("GET /api/camps error:", err);
    return Response.json({ error: err.message || "Failed to fetch medical camps" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = validateCreateCampInput(body);
    if (!validation.valid) {
      return Response.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });
    }

    const camp = await CampsService.createCamp(body, session.user.id);
    return Response.json({ success: true, camp }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/camps error:", err);
    return Response.json({ error: err.message || "Failed to organize camp" }, { status: 400 });
  }
}
