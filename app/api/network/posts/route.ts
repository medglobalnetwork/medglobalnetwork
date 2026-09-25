// app/api/network/posts/route.ts
import { auth } from "@/lib/auth";
import { networkDb, generateId } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "20", 10), 50);
  const offset = (page - 1) * pageSize;
  const communityId = searchParams.get("communityId");
  const authorId = searchParams.get("userId") || searchParams.get("authorId");

  try {
    let q = networkDb
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
      .where("np.visibility", "=", "public")
      .orderBy("np.created_at", "desc");

    if (communityId) {
      q = q.where("np.community_id", "=", communityId);
    }

    if (authorId) {
      q = q.where("np.author_id", "=", authorId);
    }

    const posts = await q.limit(pageSize).offset(offset).execute();

    // Batch enrich with user reaction status (1 single batch query instead of N+1)
    const postIds = posts.map((p) => p.id);
    let userReactedSet = new Set<string>();
    if (session?.user?.id && postIds.length > 0) {
      const reactions = await networkDb
        .selectFrom("post_reactions")
        .select(["post_id"])
        .where("post_id", "in", postIds)
        .where("user_id", "=", session.user.id)
        .execute()
        .catch(() => []);
      userReactedSet = new Set(reactions.map((r) => r.post_id));
    }

    const parseMediaUrls = (raw: unknown): string[] => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw.filter((u) => typeof u === "string" && u.trim().length > 0);
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.filter((u) => typeof u === "string" && u.trim().length > 0);
          } catch {}
        }
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          return trimmed
            .slice(1, -1)
            .split(",")
            .map((s) => s.replace(/^"|"$/g, "").trim())
            .filter(Boolean);
        }
        return [trimmed];
      }
      return [];
    };

    const enriched = posts.map((post) => ({
      ...post,
      media_urls: parseMediaUrls(post.media_urls),
      user_reacted: userReactedSet.has(post.id),
      author: {
        user_id: post.author_id,
        name: post.name,
        image: post.image,
        profession: post.profession,
        specialization: post.specialization,
        organization: post.organization,
        identity_verified: post.identity_verified ?? false,
        education_verified: post.education_verified ?? false,
        registration_verified: post.registration_verified ?? false,
      },
    }));

    return Response.json({
      data: enriched,
      page,
      pageSize,
      hasMore: posts.length === pageSize,
    });
  } catch (err) {
    console.error("GET /api/network/posts error:", err);
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { content, postType, communityId, visibility, mediaUrls } = await request.json() as {
      content: string;
      postType?: string;
      communityId?: string;
      visibility?: string;
      mediaUrls?: string[];
    };

    if (!content?.trim() && (!mediaUrls || mediaUrls.length === 0)) {
      return Response.json({ error: "Content or media is required" }, { status: 400 });
    }

    const id = generateId();
    const now = new Date();

    await networkDb
      .insertInto("network_posts")
      .values({
        id,
        author_id: session.user.id,
        post_type: postType ?? (mediaUrls && mediaUrls.length > 0 ? "image" : "text"),
        content: (content || "").trim(),
        media_urls: mediaUrls && mediaUrls.length > 0 ? mediaUrls : null,
        poll_options: null,
        poll_ends_at: null,
        community_id: communityId ?? null,
        visibility: visibility ?? "public",
        reaction_count: 0,
        comment_count: 0,
        share_count: 0,
        created_at: now,
        updated_at: now,
      })
      .execute();

    return Response.json({ success: true, postId: id });
  } catch (err) {
    console.error("POST /api/network/posts error:", err);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}
