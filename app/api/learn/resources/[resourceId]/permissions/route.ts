// app/api/learn/resources/[resourceId]/permissions/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getResourceById,
  updateResourcePermissions,
} from "@/modules/learn/lib/resource-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const resource = await getResourceById(resourceId, session?.user?.id);
    if (!resource) {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }
    return Response.json({ permissions: resource.permissions });
  } catch (err: any) {
    console.error(`GET /api/learn/resources/${resourceId}/permissions error:`, err);
    return Response.json(
      { error: err.message || "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const permissions = await updateResourcePermissions(
      resourceId,
      body,
      session.user.id
    );

    return Response.json({ permissions });
  } catch (err: any) {
    console.error(`PUT /api/learn/resources/${resourceId}/permissions error:`, err);
    return Response.json(
      { error: err.message || "Failed to update permissions" },
      { status: 500 }
    );
  }
}
