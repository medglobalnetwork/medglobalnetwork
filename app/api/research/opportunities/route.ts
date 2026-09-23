// app/api/research/opportunities/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResearchService } from "@/modules/research/services/research-service";
import { validateCreateOpportunityInput } from "@/modules/research/validation/research-validation";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { searchParams } = new URL(request.url);

  const filters = {
    search: searchParams.get("search") || undefined,
    type: searchParams.get("type") || undefined,
    project_id: searchParams.get("project_id") || undefined,
  };

  try {
    const opportunities = await ResearchService.getOpportunities(filters, session?.user?.id);
    return Response.json({ opportunities });
  } catch (err: any) {
    console.error("GET /api/research/opportunities error:", err);
    return Response.json({ error: err.message || "Failed to fetch opportunities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = validateCreateOpportunityInput(body);
    if (!validation.valid) {
      return Response.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });
    }

    const opportunity = await ResearchService.createOpportunity(body, session.user.id);
    return Response.json({ success: true, opportunity }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/research/opportunities error:", err);
    return Response.json({ error: err.message || "Failed to post opportunity" }, { status: 400 });
  }
}
