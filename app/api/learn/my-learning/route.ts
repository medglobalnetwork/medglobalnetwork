// app/api/learn/my-learning/route.ts
import { auth } from "@/lib/auth";
import { getUserMyLearning } from "@/modules/learn/lib/learn-db";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const data = await getUserMyLearning(session.user.id);
    return Response.json(data);
  } catch (err) {
    console.error("GET /api/learn/my-learning error:", err);
    return Response.json(
      { error: "Failed to fetch my learning", inProgress: [], completed: [], certificates: [] },
      { status: 500 }
    );
  }
}
