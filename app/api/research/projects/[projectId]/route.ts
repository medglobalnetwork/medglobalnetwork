// app/api/research/projects/[projectId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResearchService } from "@/modules/research/services/research-service";
import { database } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const project = await ResearchService.getProjectDetail(projectId, session?.user?.id);
    if (!project) return Response.json({ error: "Research project not found" }, { status: 404 });
    return Response.json(project);
  } catch (err: any) {
    console.error("GET /api/research/projects/[projectId] error:", err);
    return Response.json({ error: err.message || "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const project = await ResearchService.getProjectDetail(projectId, session.user.id);
    if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

    if (project.lead_researcher_id !== session.user.id) {
      return Response.json({ error: "Not authorized to update this project" }, { status: 403 });
    }

    const body = await request.json();
    const db = database as any;
    await db
      .updateTable("research_projects")
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where("id", "=", projectId)
      .execute();

    const updated = await ResearchService.getProjectDetail(projectId, session.user.id);
    return Response.json(updated);
  } catch (err: any) {
    console.error("PATCH /api/research/projects/[projectId] error:", err);
    return Response.json({ error: err.message || "Failed to update project" }, { status: 500 });
  }
}
