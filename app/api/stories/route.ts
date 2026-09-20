// app/api/stories/route.ts
import { auth } from "@/lib/auth";
import { getActiveStoryGroups, createStory } from "@/modules/home/lib/home-db";
import { CreateStoryInput } from "@/modules/home/types";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  try {
    const groups = await getActiveStoryGroups(currentUserId);
    return Response.json({ groups });
  } catch (error) {
    console.error("GET /api/stories error:", error);
    return Response.json({ error: "Failed to fetch stories", groups: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateStoryInput;

    if (!body.mediaType) {
      return Response.json({ error: "mediaType is required" }, { status: 400 });
    }

    if (body.mediaType === "text" && !body.caption?.trim()) {
      return Response.json({ error: "Text story requires content" }, { status: 400 });
    }

    if ((body.mediaType === "image" || body.mediaType === "video") && !body.mediaUrl?.trim()) {
      return Response.json({ error: "Media URL is required" }, { status: 400 });
    }

    const storyId = await createStory(session.user.id, body);
    return Response.json({ success: true, storyId });
  } catch (error) {
    console.error("POST /api/stories error:", error);
    return Response.json({ error: "Failed to create story" }, { status: 500 });
  }
}
