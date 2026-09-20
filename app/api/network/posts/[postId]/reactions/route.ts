// app/api/network/posts/[postId]/reactions/route.ts
import { auth } from "@/lib/auth";
import { networkDb, generateId } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { postId } = await params;
  const { reactionType } = (await request.json().catch(() => ({}))) as { reactionType?: string };

  try {
    await networkDb
      .insertInto("post_reactions")
      .values({
        id: generateId(),
        post_id: postId,
        user_id: session.user.id,
        reaction_type: reactionType ?? "like",
        created_at: new Date(),
      })
      .onConflict((oc) => oc.doNothing())
      .execute();

    // Increment count
    await networkDb
      .updateTable("network_posts")
      .set((eb) => ({ reaction_count: eb("reaction_count", "+", 1) }))
      .where("id", "=", postId)
      .execute();

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST /api/network/posts/[postId]/reactions error:", err);
    return Response.json({ error: "Failed to react" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    const deleted = await networkDb
      .deleteFrom("post_reactions")
      .where("post_id", "=", postId)
      .where("user_id", "=", session.user.id)
      .executeTakeFirst();

    if (Number(deleted.numDeletedRows) > 0) {
      await networkDb
        .updateTable("network_posts")
        .set((eb) => ({
          reaction_count: eb("reaction_count", "-", 1),
        }))
        .where("id", "=", postId)
        .execute();
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/network/posts/[postId]/reactions error:", err);
    return Response.json({ error: "Failed to remove reaction" }, { status: 500 });
  }
}
