// app/api/events/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventsService } from "@/modules/events/services/events-service";
import { validateCreateEventInput } from "@/modules/events/validation/events-validation";
import { consumeCreationQuota, refundCreationQuota } from "@/lib/creation-quota";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { searchParams } = new URL(request.url);

  const params = {
    search: searchParams.get("search") || undefined,
    event_type: searchParams.get("type") || undefined,
    category: searchParams.get("category") || undefined,
    format: searchParams.get("format") || undefined,
    city: searchParams.get("city") || undefined,
    is_free: searchParams.get("is_free") ? searchParams.get("is_free") === "true" : undefined,
    timeframe: (searchParams.get("timeframe") as any) || "upcoming",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
    organizer_id: searchParams.get("organizer_id") || undefined,
  };

  try {
    const result = await EventsService.getEvents(params, session?.user?.id);
    return Response.json(result);
  } catch (err: any) {
    console.error("GET /api/events error:", err);
    return Response.json({ error: err.message || "Failed to fetch events" }, { status: 500 });
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
  let category: any = "events";

  try {
    const body = await request.json();
    const validation = validateCreateEventInput(body);
    if (!validation.valid) {
      return Response.json({ error: validation.errors[0], errors: validation.errors }, { status: 400 });
    }

    category = body.event_type === "conference" ? "conferences" : "events";
    const paymentOrderId = body.payment_order_id || body.order_id || request.headers.get("x-payment-order-id") || undefined;
    
    const isOrg = Boolean(body.organization_id || body.orgId || (body.organizer_type === "organization" && body.organizer_id));
    ownerType = isOrg ? "organization" : "individual";
    ownerId = (isOrg ? (body.organization_id || body.orgId || body.organizer_id) : session.user.id) as string;

    quotaResult = await consumeCreationQuota({
      ownerType,
      ownerId,
      category,
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
      const event = await EventsService.createEvent(body, session.user.id);
      return Response.json({ success: true, event }, { status: 201 });
    } catch (createErr: any) {
      if (quotaConsumed && quotaResult) {
        await refundCreationQuota({
          ownerType,
          ownerId,
          category,
          isFree: quotaResult.isFree,
          orderId: quotaResult.orderId,
        });
      }
      throw createErr;
    }
  } catch (err: any) {
    console.error("POST /api/events error:", err);
    return Response.json({ error: err.message || "Failed to create event" }, { status: 400 });
  }
}

