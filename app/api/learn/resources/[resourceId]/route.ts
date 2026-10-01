// app/api/learn/resources/[resourceId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getResourceById,
  updateResource,
  archiveResource,
} from "@/modules/learn/lib/resource-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  try {
    const resource = await getResourceById(resourceId, currentUserId);
    if (!resource) {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }
    return Response.json({ resource });
  } catch (err: any) {
    console.error(`GET /api/learn/resources/${resourceId} error:`, err);
    return Response.json(
      { error: err.message || "Failed to fetch resource" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateResource(resourceId, body, session.user.id);
    return Response.json({ resource: updated });
  } catch (err: any) {
    console.error(`PATCH /api/learn/resources/${resourceId} error:`, err);
    return Response.json(
      { error: err.message || "Failed to update resource" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    await archiveResource(resourceId, session.user.id);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error(`DELETE /api/learn/resources/${resourceId} error:`, err);
    return Response.json(
      { error: err.message || "Failed to archive resource" },
      { status: 500 }
    );
  }
}
