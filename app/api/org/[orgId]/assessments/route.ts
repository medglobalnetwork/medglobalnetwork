// app/api/org/[orgId]/assessments/route.ts
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
    const assessments = await OrganizationService.getAssessments(orgId, department);
    return Response.json({ assessments });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/assessments error:`, err);
    return Response.json({ error: err.message || "Failed to fetch assessments" }, { status: 500 });
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
    const assessment = await OrganizationService.createAssessment(orgId, session.user.id, body);
    return Response.json({ assessment });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/assessments error:`, err);
    return Response.json({ error: err.message || "Failed to create assessment" }, { status: 500 });
  }
}
