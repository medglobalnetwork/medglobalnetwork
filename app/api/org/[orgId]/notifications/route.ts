// app/api/org/[orgId]/notifications/route.ts
import { database } from "@/lib/auth";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  try {
    const logs = await sql<any>`
      SELECT 
        id,
        action as title,
        action || ' performed by ' || user_name as description,
        created_at
      FROM organization_audit_logs
      WHERE organization_id = ${orgId}
      ORDER BY created_at DESC
      LIMIT 20
    `.execute(db);

    return Response.json({ notifications: logs.rows });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/notifications error:`, err);
    return Response.json({ notifications: [] });
  }
}
