import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MindMapService } from "@/modules/learn/lib/student-db";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    if (id) {
      const mindMap = await MindMapService.getMindMapById(id);
      if (!mindMap) {
        return Response.json({ error: "Mind map not found" }, { status: 404 });
      }
      return Response.json({ mindMap });
    }

    const mindMaps = await MindMapService.getMindMaps({ category, search });
    return Response.json({ mindMaps });
  } catch (err: any) {
    console.error("GET /api/learn/mind-maps error:", err);
    return Response.json({ error: "Failed to fetch mind maps" }, { status: 500 });
  }
}
