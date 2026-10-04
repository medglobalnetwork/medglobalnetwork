// app/api/creation-quota/create-order/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createRazorpayOrder } from "@/lib/creation-quota";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { category, orgId } = body;

    if (!category) {
      return Response.json({ error: "Category is required" }, { status: 400 });
    }

    const ownerType = orgId ? "organization" : "individual";
    const ownerId = orgId || session.user.id;

    const order = await createRazorpayOrder({
      ownerType,
      ownerId,
      category,
    });

    return Response.json({
      success: true,
      ...order,
    });
  } catch (err: any) {
    console.error("POST /api/creation-quota/create-order error:", err);
    return Response.json(
      { error: err.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
