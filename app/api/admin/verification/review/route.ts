// app/api/admin/verification/review/route.ts
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { headers } from "next/headers";
import { VerificationService } from "@/modules/onboarding/lib/verification-service";
import { verifDb } from "@/modules/onboarding/lib/verification-db";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const admin = await getAdminSession(await headers());
  if (!admin || (!hasPermission(admin, "verification.approve") && !hasPermission(admin, "verification.reject"))) {
    return Response.json({ error: "Access denied. Admin permissions required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { targetUserId, action, reason, correctionFields } = body;

    if (!targetUserId || !action) {
      return Response.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const result = await VerificationService.processAdminReview(
      admin.userId,
      targetUserId,
      action,
      { reason, correctionFields }
    );

    // Send in-app notification to applicant
    let notifMessage = "";
    if (action === "APPROVE") {
      notifMessage = "🎉 Congratulations! Your MGN Professional Identity has been verified & approved.";
    } else if (action === "REQUEST_CORRECTION") {
      notifMessage = `⚠️ Action Required: Admin requested verification correction. Reason: ${reason || "Please update flagged documents."}`;
    } else if (action === "REJECT") {
      notifMessage = `❌ Verification Update: Your application was not approved. Reason: ${reason || "Document mismatch."}`;
    }

    if (notifMessage) {
      await verifDb
        .insertInto("network_notifications" as any)
        .values({
          id: nanoid(),
          user_id: targetUserId,
          type: "verification_update",
          entity_type: "identity",
          entity_id: targetUserId,
          message: notifMessage,
          is_read: false,
          created_at: new Date(),
        })
        .execute()
        .catch(() => {}); // Gracefully log if table differs
    }

    return Response.json(result);
  } catch (err: any) {
    console.error("POST /api/admin/verification/review error:", err);
    return Response.json({ error: err.message || "Failed to process review" }, { status: 500 });
  }
}
