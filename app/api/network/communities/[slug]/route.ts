// app/api/network/communities/[slug]/route.ts
import { auth } from "@/lib/auth";
import { networkDb } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const community = await networkDb
      .selectFrom("communities")
      .where("slug", "=", slug)
      .selectAll()
      .executeTakeFirst();

    if (!community) {
      return Response.json({ error: "Community not found" }, { status: 404 });
    }

    const membership = await networkDb
      .selectFrom("community_members")
      .where("community_id", "=", community.id)
      .where("user_id", "=", session.user.id)
      .selectAll()
      .executeTakeFirst();

    return Response.json({
      data: {
        ...community,
        is_member: !!membership,
        user_role: membership?.role ?? null,
      },
    });
  } catch (err) {
    console.error(`GET /api/network/communities/${slug} error:`, err);
    return Response.json({ error: "Failed to fetch community" }, { status: 500 });
  }
}
