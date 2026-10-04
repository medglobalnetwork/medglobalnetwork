// app/api/creation-quota/check/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkCreationQuota } from "@/lib/creation-quota";
import { CreationCategory, CREATION_PRICING } from "@/lib/pricing-config";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const orgId = searchParams.get("orgId") || undefined;

  const ownerType = orgId ? "organization" : "individual";
  const ownerId = orgId || session.user.id;

  try {
    if (categoryParam && categoryParam !== "all") {
      const quota = await checkCreationQuota({
        ownerType,
        ownerId,
        category: categoryParam,
      });
      return Response.json({ success: true, ...quota });
    }

    // Check all categories in parallel for Creation Hub overview
    const categories = Object.keys(CREATION_PRICING) as CreationCategory[];
    const results = await Promise.all(
      categories.map(async (cat) => {
        const q = await checkCreationQuota({ ownerType, ownerId, category: cat });
        return [cat, q] as const;
      })
    );

    const quotas = Object.fromEntries(results);
    return Response.json({ success: true, quotas });
  } catch (err: any) {
    console.error("GET /api/creation-quota/check error:", err);
    return Response.json(
      { error: err.message || "Failed to check creation quota" },
      { status: 500 }
    );
  }
}
