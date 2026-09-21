// app/api/onboarding/documents/[id]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifDb } from "@/modules/onboarding/lib/verification-db";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const doc = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!doc) {
      return Response.json({ error: "Document not found" }, { status: 404 });
    }

    // Authorization: User must be owner OR Admin
    const isAdmin =
      session.user.email?.toLowerCase() === "patreshubham141@gmail.com" ||
      (session.user as any).role === "SUPER_ADMIN" ||
      (session.user as any).role === "ADMIN" ||
      (session.user as any).role === "VERIFICATION_ADMIN";

    if (doc.user_id !== session.user.id && !isAdmin) {
      return Response.json({ error: "Access denied. Private document." }, { status: 403 });
    }

    if (!existsSync(doc.file_path)) {
      return Response.json({ error: "File missing on storage server" }, { status: 404 });
    }

    const fileBuffer = await readFile(doc.file_path);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": doc.mime_type || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.file_name)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("GET /api/onboarding/documents/[id] error:", err);
    return Response.json({ error: "Failed to load document" }, { status: 500 });
  }
}
