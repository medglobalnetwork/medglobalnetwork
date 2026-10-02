// app/api/org/[orgId]/placements/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const placements = await OrganizationService.getPlacements(orgId);
    return Response.json({ placements });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/placements error:`, err);
    return Response.json({ error: err.message || "Failed to fetch placements" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;
  const body = await request.json();

  try {
    const placement = await OrganizationService.createPlacement(orgId, body);
    return Response.json({ placement });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/placements error:`, err);
    return Response.json({ error: err.message || "Failed to create placement" }, { status: 500 });
  }
}
