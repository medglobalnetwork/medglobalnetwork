// app/api/org/[orgId]/training/route.ts
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
  const url = new URL(request.url);
  const department = url.searchParams.get("department") || undefined;

  try {
    const trainings = await OrganizationService.getInternalTrainings(orgId, department);
    return Response.json({ trainings });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/training error:`, err);
    return Response.json({ error: err.message || "Failed to fetch internal trainings" }, { status: 500 });
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
    const training = await OrganizationService.createInternalTraining(orgId, session.user.id, body);
    return Response.json({ training });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/training error:`, err);
    return Response.json({ error: err.message || "Failed to create internal training" }, { status: 500 });
  }
}
