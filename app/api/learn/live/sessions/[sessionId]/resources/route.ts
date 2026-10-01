// app/api/learn/live/sessions/[sessionId]/resources/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const resources = await LiveClassroomRepository.getResources(sessionId);
    return Response.json({ resources });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/resources error:`, err);
    return Response.json({ error: "Failed to fetch live resources" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to add resources" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, resource_type, file_url, file_size_bytes } = body;

    if (!title || !file_url) {
      return Response.json({ error: "Title and file_url are required" }, { status: 400 });
    }

    const resource = await LiveClassroomRepository.addResource({
      session_id: sessionId,
      title,
      resource_type: resource_type || "pdf",
      file_url,
      file_size_bytes,
    });

    return Response.json({ success: true, resource });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/resources error:`, err);
    return Response.json({ error: "Failed to add resource" }, { status: 500 });
  }
}
