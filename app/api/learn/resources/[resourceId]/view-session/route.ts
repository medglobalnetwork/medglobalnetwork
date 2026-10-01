// app/api/learn/resources/[resourceId]/view-session/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createViewSession } from "@/modules/learn/lib/resource-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    let lessonId: string | null = null;
    let courseId: string | null = null;

    try {
      const body = await request.json();
      lessonId = body.lessonId || null;
      courseId = body.courseId || null;
    } catch {
      // Body may be empty
    }

    const viewSession = await createViewSession(
      session.user.id,
      resourceId,
      lessonId,
      courseId
    );

    return Response.json({ viewSession });
  } catch (err: any) {
    console.error(`POST /api/learn/resources/${resourceId}/view-session error:`, err);
    const status = err.message?.includes("not have permission") ? 403 : 500;
    return Response.json(
      { error: err.message || "Failed to create view session" },
      { status }
    );
  }
}
