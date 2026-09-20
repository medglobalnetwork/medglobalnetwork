// app/api/stories/[storyId]/reaction/route.ts
import { auth } from "@/lib/auth";
import { reactToStory } from "@/modules/home/lib/home-db";
import { headers } from "next/headers";

export async function POST(
  request: Request,
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
    const { reactionType = "like" } = (await request.json()) as { reactionType?: string };
    await reactToStory(storyId, session.user.id, reactionType);
    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/stories/[storyId]/reaction error:", error);
    return Response.json({ error: "Failed to record reaction" }, { status: 500 });
  }
}
