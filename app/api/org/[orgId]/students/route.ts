// app/api/org/[orgId]/students/route.ts
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
    const students = await OrganizationService.getStudents(orgId);
    return Response.json({ students });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/students error:`, err);
    return Response.json({ error: err.message || "Failed to fetch students" }, { status: 500 });
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
    const student = await OrganizationService.createStudent(orgId, body);
    return Response.json({ student });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/students error:`, err);
    return Response.json({ error: err.message || "Failed to create student" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId");

  if (!studentId) {
    return Response.json({ error: "studentId is required" }, { status: 400 });
  }

  try {
    await OrganizationService.deleteStudent(orgId, studentId);
    return Response.json({ ok: true });
  } catch (err: any) {
    console.error(`DELETE /api/org/${orgId}/students error:`, err);
    return Response.json({ error: err.message || "Failed to delete student" }, { status: 500 });
  }
}
