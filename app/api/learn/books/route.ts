import { getSafeSession } from "@/lib/auth";
import { BookService } from "@/modules/learn/lib/student-db";

export async function GET(req: Request) {
  const session = await getSafeSession();
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const subject = searchParams.get("subject") || undefined;
    const category = searchParams.get("category") || undefined;
    const access = searchParams.get("access") || undefined;
    const search = searchParams.get("search") || undefined;

    if (id) {
      const book = await BookService.getBookById(id, session.user.id);
      if (!book) {
        return Response.json({ error: "Book not found" }, { status: 404 });
      }
      return Response.json({ book });
    }

    const books = await BookService.getBooks({ subject, category, access, search });
    return Response.json({ books });
  } catch (err: any) {
    console.error("GET /api/learn/books error:", err);
    return Response.json({ error: "Failed to fetch medical books" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSafeSession();
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { book_id, current_page, total_pages } = body;
    await BookService.updateReadingProgress(session.user.id, book_id, current_page, total_pages);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("POST /api/learn/books error:", err);
    return Response.json({ error: "Failed to update reading progress" }, { status: 500 });
  }
}
