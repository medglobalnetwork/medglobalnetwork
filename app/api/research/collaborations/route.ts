// app/api/research/collaborations/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResearchService } from "@/modules/research/services/research-service";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { projectId, roleApplied, proposalMessage } = await request.json();
    if (!projectId || !proposalMessage) {
      return Response.json({ error: "Project ID and proposal message are required." }, { status: 400 });
    }

    const req = await ResearchService.requestCollaboration(
      projectId,
      session.user.id,
      roleApplied || "collaborator",
      proposalMessage
    );

    return Response.json({ success: true, request: req }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/research/collaborations error:", err);
    return Response.json({ error: err.message || "Failed to submit collaboration request" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { requestId, status } = await request.json();
    if (!requestId || !status) {
      return Response.json({ error: "Request ID and status are required." }, { status: 400 });
    }

    const result = await ResearchService.respondCollaborationRequest(requestId, status, session.user.id);
    return Response.json(result);
  } catch (err: any) {
    console.error("PATCH /api/research/collaborations error:", err);
    return Response.json({ error: err.message || "Failed to respond to collaboration request" }, { status: 400 });
  }
}
