// app/api/learn/resources/[resourceId]/report/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { reportResource } from "@/modules/learn/lib/resource-service";

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
    const { reason, details } = await request.json();
    if (!reason) {
      return Response.json({ error: "Report reason is required" }, { status: 400 });
    }

    const result = await reportResource(
      session.user.id,
      resourceId,
      reason,
      details
    );

    return Response.json({ success: true, ...result }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/learn/resources/${resourceId}/report error:`, err);
    return Response.json(
      { error: err.message || "Failed to submit resource report" },
      { status: 500 }
    );
  }
}
