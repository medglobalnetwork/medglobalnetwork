import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;

    // Get real job ID if slug passed
    const jobRes: any = await sql`
      SELECT id FROM jobs WHERE id = ${jobId} OR slug = ${jobId} LIMIT 1
    `.execute(database);

    if (!jobRes.rows?.[0]) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const realJobId = jobRes.rows[0].id;

    await sql`
      INSERT INTO saved_jobs (user_id, job_id)
      VALUES (${currentUserId}, ${realJobId})
      ON CONFLICT (user_id, job_id) DO NOTHING
    `.execute(database);

    return NextResponse.json({ success: true, saved: true });
  } catch (error: any) {
    console.error("Failed to save job:", error);
    return NextResponse.json({ error: error.message || "Failed to save job" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const jobRes: any = await sql`
      SELECT id FROM jobs WHERE id = ${jobId} OR slug = ${jobId} LIMIT 1
    `.execute(database);

    if (jobRes.rows?.[0]) {
      await sql`
        DELETE FROM saved_jobs 
        WHERE user_id = ${currentUserId} AND job_id = ${jobRes.rows[0].id}
      `.execute(database);
    }

    return NextResponse.json({ success: true, saved: false });
  } catch (error: any) {
    console.error("Failed to unsave job:", error);
    return NextResponse.json({ error: error.message || "Failed to unsave job" }, { status: 500 });
  }
}
