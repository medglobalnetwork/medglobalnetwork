import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NotesService } from "@/modules/learn/lib/student-db";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject") || undefined;
    const search = searchParams.get("search") || undefined;

    const notes = await NotesService.getSharedNotesFeed({ subject, search });
    return Response.json({ notes });
  } catch (err: any) {
    console.error("GET /api/learn/notes/share error:", err);
    return Response.json({ error: "Failed to fetch shared notes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { note_id, visibility, subject, topic, tags, copyright_declared } = body;

    if (!copyright_declared) {
      return Response.json(
        { error: "Copyright declaration must be accepted before publishing" },
        { status: 400 }
      );
    }

    await NotesService.publishNote(session.user.id, note_id, {
      visibility: visibility || "public",
      subject,
      topic,
      tags: Array.isArray(tags) ? tags : [],
      copyright_declared: true,
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/learn/notes/share error:", err);
    return Response.json({ error: "Failed to publish note" }, { status: 500 });
  }
}
