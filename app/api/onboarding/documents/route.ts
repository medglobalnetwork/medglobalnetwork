// app/api/onboarding/documents/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifDb } from "@/modules/onboarding/lib/verification-db";
import { ensureUserStorage, syncUserDossier } from "@/modules/onboarding/lib/user-storage";
import { isR2Configured, uploadR2Buffer } from "@/lib/r2";
import { nanoid } from "nanoid";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = (formData.get("document_type") as string) || "OTHER";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      return Response.json({ error: "Invalid file format. Please upload PDF, JPG, or PNG." }, { status: 400 });
    }

    const fileExtension = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const safeDocId = nanoid(8);
    const sanitizedType = documentType.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let storedPath: string;

    // Prefer Cloudflare R2 permanent cloud storage if configured
    if (isR2Configured) {
      const r2Key = `kyc/${session.user.id}/${sanitizedType}_${safeDocId}${fileExtension}`;
      await uploadR2Buffer({
        key: r2Key,
        buffer: fileBuffer,
        contentType: file.type,
      });
      storedPath = r2Key;
    } else {
      // Local / Serverless-safe fallback
      const storagePaths = await ensureUserStorage(session.user.id);
      const storedFileName = `${sanitizedType}_${safeDocId}${fileExtension}`;
      storedPath = path.join(storagePaths.documentsDir, storedFileName);
      try {
        await writeFile(storedPath, fileBuffer);
      } catch (localWriteErr) {
        console.warn("Could not save to local filesystem on serverless:", localWriteErr);
      }
    }

    // Remove existing document record for same type if any, to keep latest clean
    await verifDb
      .deleteFrom("mgn_verification_documents")
      .where("user_id", "=", session.user.id)
      .where("document_type", "=", documentType)
      .execute();

    await verifDb
      .insertInto("mgn_verification_documents" as any)
      .values({
        id: safeDocId,
        user_id: session.user.id,
        document_type: documentType,
        file_name: file.name,
        file_path: storedPath,
        file_size: file.size,
        mime_type: file.type,
        status: "PENDING",
        uploaded_at: new Date(),
      })
      .execute();

    await verifDb
      .insertInto("mgn_verification_audit_logs" as any)
      .values({
        id: nanoid(),
        target_user_id: session.user.id,
        actor_id: session.user.id,
        action: "document.uploaded",
        reason: `Uploaded ${documentType} (${file.name})`,
        previous_state: "NONE",
        new_state: "PENDING",
        metadata: JSON.stringify({ documentType, fileName: file.name, size: file.size, storedPath }),
        created_at: new Date(),
      })
      .execute();

    // Sync dossier file asynchronously (gracefully ignored on serverless if local FS is read-only)
    syncUserDossier(session.user.id).catch(() => {});

    return Response.json({
      success: true,
      document: {
        id: safeDocId,
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        status: "PENDING",
        stored_path: storedPath,
      },
    });
  } catch (err: any) {
    console.error("POST /api/onboarding/documents error:", err);
    return Response.json({ error: err.message || "Failed to upload document" }, { status: 500 });
  }
}
