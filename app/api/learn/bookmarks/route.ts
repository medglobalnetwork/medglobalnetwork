// app/api/learn/bookmarks/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserBookmarks, toggleBookmark } from "@/modules/learn/lib/learn-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const bookmarks = await getUserBookmarks(session.user.id);
    return Response.json({ bookmarks });
  } catch (err: any) {
    console.error("GET /api/learn/bookmarks error:", err);
    return Response.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { courseId, lessonId } = body;
    if (!courseId) {
      return Response.json({ error: "courseId is required" }, { status: 400 });
    }

    const res = await toggleBookmark(session.user.id, courseId, lessonId);
    return Response.json(res);
  } catch (err: any) {
    console.error("POST /api/learn/bookmarks error:", err);
    return Response.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
