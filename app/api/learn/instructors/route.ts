// app/api/learn/instructors/route.ts
import { getVerifiedInstructors } from "@/modules/learn/lib/learn-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(20, Number(searchParams.get("limit")) || 6);

  try {
    const instructors = await getVerifiedInstructors(limit);
    return Response.json({ instructors });
  } catch (err: any) {
    console.error("GET /api/learn/instructors error:", err);
    return Response.json({ error: "Failed to fetch instructors" }, { status: 500 });
  }
}
