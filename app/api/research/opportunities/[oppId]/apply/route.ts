// app/api/research/opportunities/[oppId]/apply/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResearchService } from "@/modules/research/services/research-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ oppId: string }> }
) {
  const { oppId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to apply" }, { status: 401 });
  }

  try {
    const { coverLetter, resumeUrl } = await request.json();
    const result = await ResearchService.applyOpportunity(oppId, session.user.id, coverLetter, resumeUrl);
    return Response.json({ success: true, ...result });
  } catch (err: any) {
    console.error("POST /api/research/opportunities/[oppId]/apply error:", err);
    return Response.json({ error: err.message || "Failed to submit application" }, { status: 400 });
  }
}
