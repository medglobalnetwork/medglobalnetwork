// app/api/onboarding/documents/[id]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifDb } from "@/modules/onboarding/lib/verification-db";
import { getR2ObjectBuffer, isR2Configured } from "@/lib/r2";
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

    let fileBuffer: Buffer | null = null;
    let contentType = doc.mime_type || "application/octet-stream";

    // 1. Check Cloudflare R2 if key is an R2 path or file missing locally
    if (doc.file_path.startsWith("kyc/") || !existsSync(doc.file_path)) {
      if (isR2Configured) {
        const r2Data = await getR2ObjectBuffer(doc.file_path);
        if (r2Data) {
          fileBuffer = r2Data.buffer;
          contentType = r2Data.contentType || contentType;
        }
      }
    }

    // 2. Fallback to local filesystem if not loaded from R2
    if (!fileBuffer && existsSync(doc.file_path)) {
      fileBuffer = await readFile(doc.file_path);
    }

    if (!fileBuffer) {
      return Response.json({ error: "Document file not found on storage servers" }, { status: 404 });
    }

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.file_name)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("GET /api/onboarding/documents/[id] error:", err);
    return Response.json({ error: "Failed to load document" }, { status: 500 });
  }
}
