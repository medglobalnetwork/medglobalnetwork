// app/api/stories/[storyId]/view/route.ts
import { auth } from "@/lib/auth";
import { markStoryViewed } from "@/modules/home/lib/home-db";
import { headers } from "next/headers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { storyId } = await params;
  if (!storyId) {
    return Response.json({ error: "Invalid story ID" }, { status: 400 });
  }

  try {
    await markStoryViewed(storyId, session.user.id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/stories/[storyId]/view error:", error);
    return Response.json({ error: "Failed to record view" }, { status: 500 });
  }
}
