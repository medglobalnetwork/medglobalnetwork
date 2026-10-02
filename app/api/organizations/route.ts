// app/api/organizations/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const orgs = await OrganizationService.getUserOrganizations(session.user.id);
    return Response.json(orgs);
  } catch (err: any) {
    console.error("GET /api/organizations error:", err);
    return Response.json({ error: err.message || "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name) {
      return Response.json({ error: "Organization name is required" }, { status: 400 });
    }

    const org = await OrganizationService.createOrganization(session.user.id, body);
    return Response.json({ organization: org }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/organizations error:", err);
    return Response.json({ error: err.message || "Failed to create organization" }, { status: 500 });
  }
}
