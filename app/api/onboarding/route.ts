// app/api/onboarding/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { VerificationService } from "@/modules/onboarding/lib/verification-service";
import { verifDb } from "@/modules/onboarding/lib/verification-db";
import { getProfessionSchema, getOrganisationSchema } from "@/modules/onboarding/config/schemas";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const identity = await VerificationService.getIdentity(session.user.id);
    if (!identity) {
      return Response.json({ identity: null, documents: [], progressPercent: 0 });
    }

    const docs = await verifDb
      .selectFrom("mgn_verification_documents")
      .selectAll()
      .where("user_id", "=", session.user.id)
      .execute();

    const titles = await verifDb
      .selectFrom("mgn_professional_titles")
      .selectAll()
      .where("user_id", "=", session.user.id)
      .execute();

    const qualifications = await verifDb
      .selectFrom("mgn_qualifications")
      .selectAll()
      .where("user_id", "=", session.user.id)
      .execute();

    const registrations = await verifDb
      .selectFrom("mgn_registrations")
      .selectAll()
      .where("user_id", "=", session.user.id)
      .execute();

    // Calculate progress percentage
    let totalItems = 3; // basic info, category/profession, review
    let completedItems = 1; // start
    if (identity.legal_first_name && identity.country) completedItems++;
    if (identity.profession_or_type) completedItems++;

    let schemaDocuments = [];
    if (identity.account_type === "INDIVIDUAL") {
      const s = getProfessionSchema(identity.profession_or_type);
      schemaDocuments = s.documents;
    } else {
      const s = getOrganisationSchema(identity.profession_or_type);
      schemaDocuments = s.documents;
    }

    const mandatoryDocs = schemaDocuments.filter((d) => d.mandatory);
    totalItems += mandatoryDocs.length;
    const uploadedTypes = new Set(docs.map((d) => d.document_type));
    const uploadedMandatoryCount = mandatoryDocs.filter((d) => uploadedTypes.has(d.id)).length;
    completedItems += uploadedMandatoryCount;

    const progressPercent = Math.min(100, Math.round((completedItems / totalItems) * 100));

    return Response.json({
      identity,
      documents: docs,
      titles,
      qualifications,
      registrations,
      schemaDocuments,
      progressPercent,
      remainingMs: identity.verification_deadline
        ? Math.max(0, new Date(identity.verification_deadline).getTime() - Date.now())
        : null,
    });
  } catch (err: any) {
    console.error("GET /api/onboarding error:", err);
    return Response.json({ error: err.message || "Failed to fetch onboarding state" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, ...payload } = body;

    if (action === "START") {
      const identity = await VerificationService.startOrEnroll(session.user.id, {
        account_type: payload.account_type || "INDIVIDUAL",
        category: payload.category || "healthcare_professional",
        profession_or_type: payload.profession_or_type || "doctor",
      });
      return Response.json({ success: true, identity });
    }

    // Default: Save step details
    const updated = await VerificationService.saveDraftDetails(session.user.id, payload);
    return Response.json({ success: true, identity: updated });
  } catch (err: any) {
    console.error("POST /api/onboarding error:", err);
    return Response.json({ error: err.message || "Failed to save onboarding details" }, { status: 500 });
  }
}
