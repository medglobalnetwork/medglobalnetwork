// app/api/learn/certificates/[code]/route.ts
import { getCertificateByCode } from "@/modules/learn/lib/learn-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    return Response.json({ error: "Certificate code is required" }, { status: 400 });
  }

  try {
    const certificate = await getCertificateByCode(code);
    if (!certificate) {
      return Response.json({ error: "Certificate not found or invalid" }, { status: 404 });
    }
    return Response.json({ certificate });
  } catch (err) {
    console.error("GET /api/learn/certificates/[code] error:", err);
    return Response.json({ error: "Failed to verify certificate" }, { status: 500 });
  }
}
