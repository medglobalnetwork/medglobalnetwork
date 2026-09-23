// app/api/shared/certificates/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SharedCertificateService } from "@/modules/shared/certificates/certificate-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const verifyCode = searchParams.get("code");

  // Public certificate verification
  if (verifyCode) {
    try {
      const cert = await SharedCertificateService.verifyCertificate(verifyCode);
      if (!cert) {
        return Response.json({ error: "Certificate not found or verification code is invalid." }, { status: 404 });
      }
      return Response.json({ valid: cert.status === "valid", certificate: cert });
    } catch (err: any) {
      console.error("GET /api/shared/certificates verify error:", err);
      return Response.json({ error: "Verification failed." }, { status: 500 });
    }
  }

  // User's own certificates
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const certificates = await SharedCertificateService.getUserCertificates(session.user.id);
    return Response.json({ certificates });
  } catch (err: any) {
    console.error("GET /api/shared/certificates error:", err);
    return Response.json({ error: err.message || "Failed to fetch certificates" }, { status: 500 });
  }
}
