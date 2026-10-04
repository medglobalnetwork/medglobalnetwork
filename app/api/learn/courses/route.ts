// app/api/learn/courses/route.ts
import { auth } from "@/lib/auth";
import { searchCourses, createCourse } from "@/modules/learn/lib/learn-db";
import { getRecommendedCourses } from "@/modules/learn/lib/learn-recommendations";
import { CreateCourseInput } from "@/modules/learn/types";
import { consumeCreationQuota, refundCreationQuota } from "@/lib/creation-quota";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || undefined;
  const category = searchParams.get("category") || undefined;
  const profession = searchParams.get("profession") || undefined;
  const specialization = searchParams.get("specialization") || undefined;
  const level = searchParams.get("level") || undefined;
  const sort = (searchParams.get("sort") as any) || "popular";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);
  const recommended = searchParams.get("recommended") === "true";

  try {
    if (recommended) {
      const courses = await getRecommendedCourses(currentUserId, pageSize);
      return Response.json({ courses, total: courses.length });
    }

    const is_free = searchParams.has("is_free")
      ? searchParams.get("is_free") === "true"
      : undefined;

    const result = await searchCourses(
      {
        query,
        category,
        profession,
        specialization,
        level,
        sort,
        page,
        pageSize,
        is_free,
      },
      currentUserId
    );

    return Response.json(result);
  } catch (err) {
    console.error("GET /api/learn/courses error:", err);
    return Response.json({ error: "Failed to fetch courses", courses: [], total: 0 }, { status: 500 });
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
    const rawBody = await request.json();
    const body = rawBody as CreateCourseInput & { payment_order_id?: string; order_id?: string; orgId?: string; organization_id?: string };

    if (!body.title?.trim()) {
      return Response.json({ error: "Course title is required" }, { status: 400 });
    }
    if (!body.category?.trim()) {
      return Response.json({ error: "Course category is required" }, { status: 400 });
    }

    const isOrg = Boolean(body.organization_id || body.orgId);
    ownerType = isOrg ? "organization" : "individual";
    ownerId = (isOrg ? (body.organization_id || body.orgId) : session.user.id) as string;

    const paymentOrderId = body.payment_order_id || body.order_id || request.headers.get("x-payment-order-id") || undefined;
    quotaResult = await consumeCreationQuota({
      ownerType,
      ownerId,
      category: "courses",
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
      const courseId = await createCourse(session.user.id, body);
      return Response.json({ success: true, courseId });
    } catch (createErr: any) {
      if (quotaConsumed && quotaResult) {
        await refundCreationQuota({
          ownerType,
          ownerId,
          category: "courses",
          isFree: quotaResult.isFree,
          orderId: quotaResult.orderId,
        });
      }
      throw createErr;
    }
  } catch (err) {
    console.error("POST /api/learn/courses error:", err);
    return Response.json({ error: "Failed to create course" }, { status: 500 });
  }
}

