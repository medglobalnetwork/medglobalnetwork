// app/api/admin/verification/[userId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { verifDb } from "@/modules/onboarding/lib/verification-db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const identity = await verifDb
      .selectFrom("mgn_identities as mi")
      .leftJoin("user as u", "u.id", "mi.user_id")
      .selectAll("mi")
      .select(["u.name as user_name", "u.email as user_email", "u.image as user_image"])
      .where("mi.user_id", "=", userId)
      .executeTakeFirst();

    if (!identity) {
      return Response.json({ error: "Applicant identity not found" }, { status: 404 });
    }

    const documents = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    const titles = await verifDb
      .selectFrom("mgn_professional_titles")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    const qualifications = await verifDb
      .selectFrom("mgn_qualifications")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    const registrations = await verifDb
      .selectFrom("mgn_registrations")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    const auditLogs = await verifDb
      .selectFrom("mgn_verification_audit_logs")
      .selectAll()
      .where("target_user_id", "=", userId)
      .orderBy("created_at", "desc")
      .execute();

    return Response.json({
      identity,
      documents,
      titles,
      qualifications,
      registrations,
      auditLogs,
    });
  } catch (err: any) {
    console.error("GET /api/admin/verification/[userId] error:", err);
    return Response.json({ error: "Failed to fetch applicant dossier" }, { status: 500 });
  }
}
