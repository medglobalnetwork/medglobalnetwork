// app/api/network/posts/[postId]/comments/route.ts
import { auth } from "@/lib/auth";
import { networkDb, generateId } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    const comments = await networkDb
      .selectFrom("post_comments as pc")
      .innerJoin("user as u", "u.id", "pc.author_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "pc.author_id")
      .select([
        "pc.id",
        "pc.post_id",
        "pc.author_id",
        "pc.parent_id",
        "pc.content",
        "pc.created_at",
        "u.name",
        "u.image",
        "pp.profession",
      ])
      .where("pc.post_id", "=", postId)
      .where("pc.parent_id", "is", null)
      .orderBy("pc.created_at", "asc")
      .execute();

    return Response.json({ data: comments });
  } catch (err) {
    console.error("GET comments error:", err);
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    const { content, parentId } = await request.json() as {
      content: string;
      parentId?: string;
    };

    if (!content?.trim()) {
      return Response.json({ error: "Comment content is required" }, { status: 400 });
    }

    const id = generateId();
    const now = new Date();

    await networkDb
      .insertInto("post_comments")
      .values({
        id,
        post_id: postId,
        author_id: session.user.id,
        parent_id: parentId ?? null,
        content: content.trim(),
        created_at: now,
        updated_at: now,
      })
      .execute();

    await networkDb
      .updateTable("network_posts")
      .set((eb) => ({ comment_count: eb("comment_count", "+", 1) }))
      .where("id", "=", postId)
      .execute();

    return Response.json({ success: true, commentId: id });
  } catch (err) {
    console.error("POST comment error:", err);
    return Response.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
