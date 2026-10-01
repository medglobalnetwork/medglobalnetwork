// app/api/learn/paths/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getLearningPaths } from "@/modules/learn/lib/learn-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  try {
    const paths = await getLearningPaths(session?.user?.id);
    return Response.json({ paths });
  } catch (err: any) {
    console.error("GET /api/learn/paths error:", err);
    return Response.json({ error: "Failed to fetch learning paths" }, { status: 500 });
  }
}
