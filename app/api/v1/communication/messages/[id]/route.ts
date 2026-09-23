// ============================================================
// MGN Communication Engine — Message Operations (Edit & Delete)
// app/api/v1/communication/messages/[id]/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await props.params;

  try {
    const { content } = await request.json();
    if (!content?.trim()) {
      return Response.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    await CommunicationService.editMessage(session.user.id, id, content);
    return Response.json({ success: true, message: "Message edited" });
  } catch (err: any) {
    console.error("PATCH message error:", err);
    return Response.json({ error: err.message || "Failed to edit message" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await props.params;
  const { searchParams } = new URL(request.url);
  const deleteForAll = searchParams.get("deleteForAll") === "true";

  try {
    await CommunicationService.deleteMessage(session.user.id, id, deleteForAll);
    return Response.json({ success: true, message: "Message deleted" });
  } catch (err: any) {
    console.error("DELETE message error:", err);
    return Response.json({ error: err.message || "Failed to delete message" }, { status: 500 });
  }
}
