// app/api/org/[orgId]/calendar/route.ts
import { database } from "@/lib/auth";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  const items: any[] = [];

  try {
    if (type === "all" || type === "events") {
      const events = await sql<any>`
        SELECT id, title, start_time as date, 'Event' as type, event_type as subtype
        FROM events WHERE organization_id = ${orgId}
      `.execute(db);
      items.push(...events.rows);
    }

    if (type === "all" || type === "camps") {
      const camps = await sql<any>`
        SELECT id, title, start_date as date, 'Camp' as type, camp_type as subtype
        FROM camps WHERE organization_id = ${orgId}
      `.execute(db);
      items.push(...camps.rows);
    }

    if (type === "all" || type === "jobs") {
      const jobs = await sql<any>`
        SELECT id, title, application_deadline as date, 'Job Deadline' as type, employment_type as subtype
        FROM jobs WHERE organization_id = ${orgId} AND application_deadline IS NOT NULL
      `.execute(db);
      items.push(...jobs.rows);
    }

    // Sort by date ascending
    items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return Response.json({ items });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/calendar error:`, err);
    return Response.json({ items: [] });
  }
}
