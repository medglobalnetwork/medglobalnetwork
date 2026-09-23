// app/api/research/publications/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResearchService } from "@/modules/research/services/research-service";
import { validateAddPublicationInput } from "@/modules/research/validation/research-validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters = {
    search: searchParams.get("search") || undefined,
    research_area: searchParams.get("area") || undefined,
    user_id: searchParams.get("user_id") || undefined,
  };

  try {
    const publications = await ResearchService.getPublications(filters);
    return Response.json({ publications });
  } catch (err: any) {
    console.error("GET /api/research/publications error:", err);
    return Response.json({ error: err.message || "Failed to fetch publications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = validateAddPublicationInput(body);
    if (!validation.valid) {
      return Response.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });
    }

    const publication = await ResearchService.addPublication(body, session.user.id);
    return Response.json({ success: true, publication }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/research/publications error:", err);
    return Response.json({ error: err.message || "Failed to add publication" }, { status: 400 });
  }
}
