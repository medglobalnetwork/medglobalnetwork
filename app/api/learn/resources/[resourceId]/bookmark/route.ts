// app/api/learn/resources/[resourceId]/bookmark/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { toggleResourceBookmark } from "@/modules/learn/lib/resource-service";

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
    let collectionId: string | null = null;
    let notes: string | null = null;

    try {
      const body = await request.json();
      collectionId = body.collectionId || null;
      notes = body.notes || null;
    } catch {
      // Body may be empty
    }

    const result = await toggleResourceBookmark(
      session.user.id,
      resourceId,
      collectionId,
      notes
    );

    return Response.json(result);
  } catch (err: any) {
    console.error(`POST /api/learn/resources/${resourceId}/bookmark error:`, err);
    return Response.json(
      { error: err.message || "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
