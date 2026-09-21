// app/api/admin/verification/queue/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifDb } from "@/modules/onboarding/lib/verification-db";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // Admin permission check
  const isAdmin =
    session.user.email?.toLowerCase() === "patreshubham141@gmail.com" ||
    (session.user as any).role === "SUPER_ADMIN" ||
    (session.user as any).role === "ADMIN" ||
    (session.user as any).role === "VERIFICATION_ADMIN";

  if (!isAdmin) {
    return Response.json({ error: "Access denied. Admin permissions required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "UNDER_REVIEW";
  const search = searchParams.get("q") || "";

  try {
    let q = verifDb
      .selectFrom("mgn_identities as mi")
      .leftJoin("user as u", "u.id", "mi.user_id")
      .select([
        "mi.id",
        "mi.user_id",
        "mi.account_type",
        "mi.category",
        "mi.profession_or_type",
        "mi.legal_first_name",
        "mi.legal_last_name",
        "mi.display_name",
        "mi.city",
        "mi.state",
        "mi.country",
        "mi.verification_status",
        "mi.verification_deadline",
        "mi.enrolled_at",
        "mi.submitted_at",
        "mi.reviewed_at",
        "mi.reviewed_by",
        "mi.correction_reason",
        "mi.rejection_reason",
        "u.name as user_name",
        "u.email as user_email",
        "u.image as user_image",
      ]);

    if (status !== "ALL") {
      q = q.where("mi.verification_status", "=", status);
    }

    if (search) {
      q = q.where((eb) =>
        eb.or([
          eb("mi.legal_first_name", "ilike", `%${search}%`),
          eb("mi.legal_last_name", "ilike", `%${search}%`),
          eb("mi.display_name", "ilike", `%${search}%`),
          eb("u.email", "ilike", `%${search}%`),
          eb("mi.profession_or_type", "ilike", `%${search}%`),
        ])
      );
    }

    const items = await q.orderBy("mi.submitted_at", "desc").limit(50).execute();

    // Fetch counts for all tabs
    const counts = await verifDb
      .selectFrom("mgn_identities")
      .select(["verification_status"])
      .select((eb) => eb.fn.countAll<string>().as("count"))
      .groupBy("verification_status")
      .execute();

    const countsMap: Record<string, number> = {};
    counts.forEach((c) => {
      countsMap[c.verification_status] = parseInt(c.count || "0", 10);
    });

    return Response.json({
      items,
      counts: {
        UNDER_REVIEW: countsMap["UNDER_REVIEW"] || 0,
        CORRECTION_REQUIRED: countsMap["CORRECTION_REQUIRED"] || 0,
        APPROVED: countsMap["APPROVED"] || 0,
        REJECTED: countsMap["REJECTED"] || 0,
        ENROLLED: countsMap["ENROLLED"] || 0,
        VERIFICATION_INCOMPLETE: countsMap["VERIFICATION_INCOMPLETE"] || 0,
        SUSPENDED: countsMap["SUSPENDED"] || 0,
        TOTAL: Object.values(countsMap).reduce((a, b) => a + b, 0),
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/verification/queue error:", err);
    return Response.json({ error: "Failed to fetch verification queue" }, { status: 500 });
  }
}
