import { auth, database } from "@/lib/auth";
import { ensureDpdpTables } from "@/modules/dpdp/lib/dpdp-db";
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
      SELECT id, user_id, full_name, relationship, email, phone, identity_proof_type, identity_proof_number, notes, created_at, updated_at
      FROM user_nominees
      WHERE user_id = ${session.user.id}
      LIMIT 1
    `.execute(database);

    return Response.json({ nominee: result.rows[0] || null });
  } catch (err: any) {
    console.error("Failed to fetch nominee:", err);
    return Response.json({ error: "Failed to fetch nominee details" }, { status: 500 });
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
    const { full_name, relationship, email, phone, identity_proof_type, identity_proof_number, notes } = body;

    if (!full_name || !relationship || !email) {
      return Response.json(
        { error: "Full Name, Relationship, and Email are required fields." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const result = await sql<any>`
      INSERT INTO user_nominees (
        user_id, full_name, relationship, email, phone, identity_proof_type, identity_proof_number, notes, updated_at
      ) VALUES (
        ${session.user.id},
        ${full_name.trim()},
        ${relationship.trim()},
        ${email.trim().toLowerCase()},
        ${phone ? phone.trim() : null},
        ${identity_proof_type ? identity_proof_type.trim() : null},
        ${identity_proof_number ? identity_proof_number.trim() : null},
        ${notes ? notes.trim() : null},
        now()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        relationship = EXCLUDED.relationship,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        identity_proof_type = EXCLUDED.identity_proof_type,
        identity_proof_number = EXCLUDED.identity_proof_number,
        notes = EXCLUDED.notes,
        updated_at = now()
      RETURNING *
    `.execute(database);

    return Response.json({
      success: true,
      nominee: result.rows[0],
      message: "Nominee details saved successfully under DPDP Section 14.",
    });
  } catch (err: any) {
    console.error("Failed to save nominee:", err);
    return Response.json({ error: err.message || "Failed to save nominee" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    await ensureDpdpTables();
    await sql`
      DELETE FROM user_nominees
      WHERE user_id = ${session.user.id}
    `.execute(database);

    return Response.json({ success: true, message: "Nominee removed successfully." });
  } catch (err: any) {
    console.error("Failed to delete nominee:", err);
    return Response.json({ error: "Failed to remove nominee" }, { status: 500 });
  }
}
