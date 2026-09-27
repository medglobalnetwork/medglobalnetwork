// app/api/network/posts/[postId]/route.ts
import { auth } from "@/lib/auth";
import { networkDb } from "@/modules/network/lib/network-db";
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
  if (!postId) {
    return Response.json({ error: "Invalid post ID" }, { status: 400 });
  }

  try {
    const post = await networkDb
      .selectFrom("network_posts as np")
      .innerJoin("user as u", "u.id", "np.author_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "np.author_id")
      .select([
        "np.id",
        "np.author_id",
        "np.post_type",
        "np.content",
        "np.media_urls",
        "np.reaction_count",
        "np.comment_count",
        "np.share_count",
        "np.visibility",
        "np.created_at",
        "u.name",
        "u.image",
        "pp.profession",
        "pp.specialization",
        "pp.organization",
        "pp.identity_verified",
        "pp.education_verified",
        "pp.registration_verified",
      ])
      .where("np.id", "=", postId)
      .executeTakeFirst();

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    return Response.json({ post });
  } catch (error) {
    console.error("GET /api/network/posts/[postId] error:", error);
    return Response.json({ error: "Failed to fetch post" }, { status: 500 });
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
  if (!postId) {
    return Response.json({ error: "Invalid post ID" }, { status: 400 });
  }

  try {
    // 1. Fetch post to verify ownership or admin role
    const post = await networkDb
      .selectFrom("network_posts")
      .select(["id", "author_id"])
      .where("id", "=", postId)
      .executeTakeFirst();

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const isAuthor = post.author_id === session.user.id;
    const isAdmin = (session.user as any)?.role === "admin";

    if (!isAuthor && !isAdmin) {
      return Response.json({ error: "Unauthorized to delete this post" }, { status: 403 });
    }

    // 2. Cascade delete comments & reactions
    await networkDb
      .deleteFrom("post_comments")
      .where("post_id", "=", postId)
      .execute()
      .catch(() => {});

    await networkDb
      .deleteFrom("post_reactions")
      .where("post_id", "=", postId)
      .execute()
      .catch(() => {});

    // 3. Delete the post record
    await networkDb
      .deleteFrom("network_posts")
      .where("id", "=", postId)
      .execute();

    return Response.json({ success: true, deletedPostId: postId });
  } catch (error) {
    console.error("DELETE /api/network/posts/[postId] error:", error);
    return Response.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
