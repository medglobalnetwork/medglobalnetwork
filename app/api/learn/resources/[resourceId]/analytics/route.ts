// app/api/learn/resources/[resourceId]/analytics/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getResourceAnalytics } from "@/modules/learn/lib/resource-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const summary = await getResourceAnalytics(resourceId);
    return Response.json({ summary });
  } catch (err: any) {
    console.error(`GET /api/learn/resources/${resourceId}/analytics error:`, err);
    return Response.json(
      { error: err.message || "Failed to fetch resource analytics" },
      { status: 500 }
    );
  }
}
