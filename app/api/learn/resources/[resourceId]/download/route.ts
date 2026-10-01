// app/api/learn/resources/[resourceId]/download/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { authorizeDownload } from "@/modules/learn/lib/resource-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const h = await headers();
  const ipAddress = h.get("x-forwarded-for") || h.get("x-real-ip");
  const userAgent = h.get("user-agent");

  try {
    const download = await authorizeDownload(
      session.user.id,
      resourceId,
      ipAddress,
      userAgent
    );

    return Response.json(download);
  } catch (err: any) {
    console.error(`GET /api/learn/resources/${resourceId}/download error:`, err);
    const status = err.message?.startsWith("403") ? 403 : 500;
    return Response.json(
      { error: err.message || "Failed to authorize download" },
      { status }
    );
  }
}
