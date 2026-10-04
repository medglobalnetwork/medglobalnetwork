// app/api/research/projects/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ResearchService } from "@/modules/research/services/research-service";
import { validateCreateProjectInput } from "@/modules/research/validation/research-validation";
import { consumeCreationQuota, refundCreationQuota } from "@/lib/creation-quota";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { searchParams } = new URL(request.url);

  const filters = {
    search: searchParams.get("search") || undefined,
    research_area: searchParams.get("area") || undefined,
    recruiting_only: searchParams.get("recruiting") === "true",
    lead_id: searchParams.get("lead_id") || undefined,
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
  };

  try {
    const result = await ResearchService.getProjects(filters, session?.user?.id);
    return Response.json(result);
  } catch (err: any) {
    console.error("GET /api/research/projects error:", err);
    return Response.json({ error: err.message || "Failed to fetch research projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  let quotaConsumed = false;
  let quotaResult: any = null;
  let ownerType: "individual" | "organization" = "individual";
  let ownerId = session.user.id;

  try {
    const body = await request.json();
    const validation = validateCreateProjectInput(body);
    if (!validation.valid) {
      return Response.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });
    }

    const isOrg = Boolean(body.organization_id || body.orgId);
    ownerType = isOrg ? "organization" : "individual";
    ownerId = (isOrg ? (body.organization_id || body.orgId) : session.user.id) as string;

    const paymentOrderId = body.payment_order_id || body.order_id || request.headers.get("x-payment-order-id") || undefined;
    quotaResult = await consumeCreationQuota({
      ownerType,
      ownerId,
      category: "research",
      paymentOrderId,
    });

    if (!quotaResult.allowed) {
      return Response.json(
        {
          error: quotaResult.reason || "Payment required to publish. Free upload already used.",
          requiresPayment: true,
          price: quotaResult.price,
          currency: quotaResult.currency,
          category: quotaResult.category,
        },
        { status: 402 }
      );
    }

    quotaConsumed = true;

    try {
      const project = await ResearchService.createProject(body, session.user.id);
      return Response.json({ success: true, project }, { status: 201 });
    } catch (createErr: any) {
      if (quotaConsumed && quotaResult) {
        await refundCreationQuota({
          ownerType,
          ownerId,
          category: "research",
          isFree: quotaResult.isFree,
          orderId: quotaResult.orderId,
        });
      }
      throw createErr;
    }
  } catch (err: any) {
    console.error("POST /api/research/projects error:", err);
    return Response.json({ error: err.message || "Failed to create research project" }, { status: 400 });
  }
}

