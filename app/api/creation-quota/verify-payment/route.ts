// app/api/creation-quota/verify-payment/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifyRazorpayPayment } from "@/lib/creation-quota";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderId, paymentId, signature, orgId } = body;

    if (!orderId) {
      return Response.json({ error: "Order ID is required" }, { status: 400 });
    }

    const ownerType = orgId ? "organization" : "individual";
    const ownerId = orgId || session.user.id;

    const result = await verifyRazorpayPayment({
      orderId,
      paymentId,
      signature,
      ownerType,
      ownerId,
    });

    if (!result.success) {
      return Response.json(
        { error: result.error || "Payment verification failed" },
        { status: 400 }
      );
    }

    return Response.json(result);
  } catch (err: any) {
    console.error("POST /api/creation-quota/verify-payment error:", err);
    return Response.json(
      { error: err.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
