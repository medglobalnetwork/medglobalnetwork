// app/api/org/[orgId]/programs/route.ts
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
    const programs = await OrganizationService.getAcademicPrograms(orgId);
    return Response.json({ programs });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/programs error:`, err);
    return Response.json({ error: err.message || "Failed to fetch programs" }, { status: 500 });
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
    const program = await OrganizationService.createAcademicProgram(orgId, body);
    return Response.json({ program });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/programs error:`, err);
    return Response.json({ error: err.message || "Failed to create program" }, { status: 500 });
  }
}
