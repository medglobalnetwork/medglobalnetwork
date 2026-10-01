// app/api/shared/certificates/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SharedCertificateService } from "@/modules/shared/certificates/certificate-service";
import { getCertificateByCode, getUserMyLearning } from "@/modules/learn/lib/learn-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const verifyCode = searchParams.get("code");
  const targetUserId = searchParams.get("userId");

  // 1. Public certificate verification by code/number
  if (verifyCode) {
    try {
      const unifiedCert = await SharedCertificateService.verifyCertificate(verifyCode);
      if (unifiedCert) {
        return Response.json({
          valid: unifiedCert.status === "valid",
          certificate: unifiedCert,
        });
      }

      // Fallback to Learn certificates table
      const learnCert = await getCertificateByCode(verifyCode);
      if (learnCert) {
        const normalized = {
          id: learnCert.id,
          certificate_number: learnCert.certificate_number,
          verification_code: learnCert.verification_code,
          user_id: learnCert.user_id,
          recipient_name:
            learnCert.metadata?.student_name || "Healthcare Professional",
          issuer_name:
            learnCert.metadata?.instructor_name || "MedGlobalNetwork Faculty",
          entity_type: "course" as const,
          entity_id: learnCert.course_id,
          title: learnCert.metadata?.course_title || "Certificate of Completion",
          subtitle: learnCert.metadata?.skills_acquired?.join(" • ") || null,
          issued_at: learnCert.issued_at,
          metadata: learnCert.metadata,
          status: learnCert.status,
        };
        return Response.json({
          valid: learnCert.status === "valid",
          certificate: normalized,
        });
      }

      return Response.json(
        { error: "Certificate not found or verification code is invalid." },
        { status: 404 }
      );
    } catch (err: any) {
      console.error("GET /api/shared/certificates verify error:", err);
      return Response.json({ error: "Verification failed." }, { status: 500 });
    }
  }

  // 2. Fetch certificates for a specific user (public or self)
  let userId = targetUserId;
  if (!userId) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    userId = session.user.id;
  }

  try {
    const [unifiedCerts, learnData] = await Promise.all([
      SharedCertificateService.getUserCertificates(userId),
      getUserMyLearning(userId).catch(() => ({ certificates: [] })),
    ]);

    const normalizedLearnCerts = (learnData.certificates || []).map((c) => ({
      id: c.id,
      certificate_number: c.certificate_number,
      verification_code: c.verification_code,
      user_id: c.user_id,
      recipient_name: c.metadata?.student_name || "Healthcare Professional",
      issuer_name: c.metadata?.instructor_name || "MedGlobalNetwork Faculty",
      entity_type: "course" as const,
      entity_id: c.course_id,
      title: c.course?.title || c.metadata?.course_title || "Course Certificate",
      subtitle: c.metadata?.skills_acquired?.join(" • ") || null,
      issued_at: c.issued_at,
      metadata: c.metadata,
      status: c.status,
    }));

    // Deduplicate by verification code
    const seenCodes = new Set<string>();
    const allCertificates = [];

    for (const uc of unifiedCerts) {
      if (!seenCodes.has(uc.verification_code)) {
        seenCodes.add(uc.verification_code);
        allCertificates.push(uc);
      }
    }

    for (const lc of normalizedLearnCerts) {
      if (!seenCodes.has(lc.verification_code)) {
        seenCodes.add(lc.verification_code);
        allCertificates.push(lc);
      }
    }

    return Response.json({ certificates: allCertificates });
  } catch (err: any) {
    console.error("GET /api/shared/certificates error:", err);
    return Response.json(
      { error: err.message || "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
