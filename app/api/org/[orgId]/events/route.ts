// app/api/org/[orgId]/events/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { OrgEntitlementService } from "@/modules/organizations/lib/org-entitlements";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { generateOrgId, ensureOrgTables } from "@/modules/organizations/lib/org-db";
import { consumeCreationQuota, refundCreationQuota } from "@/lib/creation-quota";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  await ensureOrgTables();

  try {
    const eventsRes = await sql<any>`
      SELECT * FROM events
      WHERE organization_id = ${orgId}
      ORDER BY start_time DESC
    `.execute(db);

    const confRes = await sql<any>`
      SELECT * FROM organization_conferences
      WHERE organization_id = ${orgId}
      ORDER BY start_date DESC
    `.execute(db);

    return Response.json({
      events: eventsRes.rows,
      conferences: confRes.rows,
    });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/events error:`, err);
    return Response.json({ error: err.message || "Failed to fetch events" }, { status: 500 });
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
  let quotaConsumed = false;
  let quotaResult: any = null;
  let category: any = "events";

  try {
    const { member } = await OrganizationService.getOrganizationById(orgId, session.user.id);
    if (!member || !hasOrgPermission(member.role, undefined, "EVENTS_CREATE")) {
      return Response.json({ error: "Permission denied to create events" }, { status: 403 });
    }

    // Check Plan Limits
    const entitlement = await OrgEntitlementService.canCreateEvent(orgId);
    if (!entitlement.allowed) {
      return Response.json({ error: entitlement.reason }, { status: 403 });
    }

    const body = await request.json();
    category = body.event_type === "conference" ? "conferences" : "events";
    const paymentOrderId = body.payment_order_id || body.order_id || request.headers.get("x-payment-order-id") || undefined;
    quotaResult = await consumeCreationQuota({
      ownerType: "organization",
      ownerId: orgId,
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
      const id = generateOrgId();
      const slug = (body.title || "event")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);

      await sql`
        INSERT INTO events (
          id, slug, title, event_type, category, description,
          organizer_type, organizer_id, organization_id, start_time, end_time,
          format, price, currency, is_free, capacity, cme_credits,
          certificate_enabled, status, created_at, updated_at
        ) VALUES (
          ${id}, ${slug}, ${body.title}, ${body.event_type || "webinar"}, ${body.category || "General Healthcare"},
          ${body.description}, 'organization', ${session.user.id}, ${orgId},
          ${new Date(body.start_time)}, ${new Date(body.end_time)},
          ${body.format || "online"}, ${body.price || 0}, 'INR', ${body.is_free !== false},
          ${body.capacity || 100}, ${body.cme_credits || 0}, true, 'published',
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `.execute(db);

      await OrganizationService.logAudit({
        organization_id: orgId,
        user_id: session.user.id,
        user_name: session.user.name || "Event Manager",
        user_email: session.user.email || "",
        action: "EVENT_CREATED",
        entity_type: "EVENT",
        entity_id: id,
        details: { title: body.title, type: body.event_type },
      });

      return Response.json({ success: true, id }, { status: 201 });
    } catch (createErr: any) {
      if (quotaConsumed && quotaResult) {
        await refundCreationQuota({
          ownerType: "organization",
          ownerId: orgId,
          category,
          isFree: quotaResult.isFree,
          orderId: quotaResult.orderId,
        });
      }
      throw createErr;
    }
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/events error:`, err);
    return Response.json({ error: err.message || "Failed to create event" }, { status: 500 });
  }
}
