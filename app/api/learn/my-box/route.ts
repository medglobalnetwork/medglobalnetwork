// app/api/learn/my-box/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserMyBoxData } from "@/modules/learn/lib/learn-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const data = await getUserMyBoxData(session.user.id);
    return Response.json(data);
  } catch (err: any) {
    console.error("GET /api/learn/my-box error:", err);
    return Response.json({ error: "Failed to fetch My Box data" }, { status: 500 });
  }
}
