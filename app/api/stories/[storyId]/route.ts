// app/api/stories/[storyId]/route.ts
import { auth } from "@/lib/auth";
import { deleteStory } from "@/modules/home/lib/home-db";
import { headers } from "next/headers";

export async function DELETE(
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
    const deleted = await deleteStory(storyId, session.user.id);
    if (!deleted) {
      return Response.json({ error: "Story not found or unauthorized" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/stories/[storyId] error:", error);
    return Response.json({ error: "Failed to delete story" }, { status: 500 });
  }
}
