import { auth, database } from "@/lib/auth";
import { ensureDpdpTables, DEFAULT_CONSENT_ITEMS } from "@/modules/dpdp/lib/dpdp-db";
import { headers } from "next/headers";
import { sql } from "kysely";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    await ensureDpdpTables();
    const result = await sql<any>`
      SELECT consent_key, granted, granted_at
      FROM user_privacy_consents
      WHERE user_id = ${session.user.id}
    `.execute(database);

    const consentMap: Record<string, boolean> = {};
    for (const item of DEFAULT_CONSENT_ITEMS) {
      consentMap[item.key] = item.defaultGranted;
    }
    for (const row of result.rows) {
      consentMap[row.consent_key] = Boolean(row.granted);
    }

    return Response.json({
      consents: consentMap,
      items: DEFAULT_CONSENT_ITEMS,
    });
  } catch (err: any) {
    console.error("Failed to fetch consents:", err);
    return Response.json({ error: "Failed to fetch consent preferences" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    await ensureDpdpTables();
    const body = await request.json();
    const { consent_key, granted } = body;

    if (!consent_key || typeof granted !== "boolean") {
      return Response.json({ error: "Invalid consent payload" }, { status: 400 });
    }

    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "unknown";
    const userAgent = reqHeaders.get("user-agent") || "unknown";

    await sql`
      INSERT INTO user_privacy_consents (
        user_id, consent_key, granted, granted_at, ip_address, user_agent
      ) VALUES (
        ${session.user.id},
        ${consent_key},
        ${granted},
        now(),
        ${ip},
        ${userAgent}
      )
      ON CONFLICT (user_id, consent_key) DO UPDATE SET
        granted = EXCLUDED.granted,
        granted_at = now(),
        ip_address = EXCLUDED.ip_address,
        user_agent = EXCLUDED.user_agent
    `.execute(database);

    return Response.json({
      success: true,
      consent_key,
      granted,
      message: `Consent updated successfully.`,
    });
  } catch (err: any) {
    console.error("Failed to update consent:", err);
    return Response.json({ error: "Failed to update consent preference" }, { status: 500 });
  }
}
