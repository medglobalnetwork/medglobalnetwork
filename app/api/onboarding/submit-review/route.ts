// app/api/onboarding/submit-review/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { VerificationService } from "@/modules/onboarding/lib/verification-service";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const result = await VerificationService.submitAndRequestReview(session.user.id);
    return Response.json(result);
  } catch (err: any) {
    console.error("POST /api/onboarding/submit-review error:", err);
    return Response.json({ error: err.message || "Failed to submit for review" }, { status: 400 });
  }
}
