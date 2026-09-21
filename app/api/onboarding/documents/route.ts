// app/api/onboarding/documents/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifDb } from "@/modules/onboarding/lib/verification-db";
import { nanoid } from "nanoid";
import { writeFile, mkdir } from "fs/promises";
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

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(file.type)) {
      return Response.json({ error: "Invalid file format. Please upload PDF, JPG, or PNG." }, { status: 400 });
    }

    // Secure private directory storage
    const storageDir = path.join(process.cwd(), "private_storage", "verification_docs");
    await mkdir(storageDir, { recursive: true });

    const fileExtension = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const safeDocId = nanoid();
    const storedFileName = `${session.user.id}_${safeDocId}${fileExtension}`;
    const targetFilePath = path.join(storageDir, storedFileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(targetFilePath, Buffer.from(arrayBuffer));

    // Remove existing document for same type if any, to keep latest clean
    await verifDb
      .deleteFrom("mgn_verification_documents")
      .where("user_id", "=", session.user.id)
      .where("document_type", "=", documentType)
      .execute();

    await verifDb
      .insertInto("mgn_verification_documents")
      .values({
        id: safeDocId,
        user_id: session.user.id,
        document_type: documentType,
        file_name: file.name,
        file_path: targetFilePath,
        file_size: file.size,
        mime_type: file.type,
        status: "PENDING",
        uploaded_at: new Date(),
      })
      .execute();

    await verifDb
      .insertInto("mgn_verification_audit_logs")
      .values({
        id: nanoid(),
        target_user_id: session.user.id,
        actor_id: session.user.id,
        action: "document.uploaded",
        reason: `Uploaded ${documentType} (${file.name})`,
        previous_state: "NONE",
        new_state: "PENDING",
        metadata: JSON.stringify({ documentType, fileName: file.name, size: file.size }),
        created_at: new Date(),
      })
      .execute();

    return Response.json({
      success: true,
      document: {
        id: safeDocId,
        document_type: documentType,
        file_name: file.name,
        file_size: file.size,
        status: "PENDING",
      },
    });
  } catch (err: any) {
    console.error("POST /api/onboarding/documents error:", err);
    return Response.json({ error: err.message || "Failed to upload document" }, { status: 500 });
  }
}
