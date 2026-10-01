// app/api/learn/resources/my-box/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMyBoxSavedResources } from "@/modules/learn/lib/resource-service";

export async function GET(_request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const resources = await getMyBoxSavedResources(session.user.id);
    return Response.json({ resources, count: resources.length });
  } catch (err: any) {
    console.error("GET /api/learn/resources/my-box error:", err);
    return Response.json(
      { error: err.message || "Failed to fetch saved resources", resources: [] },
      { status: 500 }
    );
  }
}
