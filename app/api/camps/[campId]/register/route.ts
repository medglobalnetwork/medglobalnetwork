// app/api/camps/[campId]/register/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CampsService } from "@/modules/camps/services/camps-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campId: string }> }
) {
  const { campId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const body = await request.json();
    if (!body.participantName) {
      return Response.json({ error: "Participant name is required" }, { status: 400 });
    }

    const reg = await CampsService.registerParticipant({
      campId,
      userId: session?.user?.id || null,
      participantName: body.participantName,
      participantPhone: body.participantPhone,
      participantAge: body.participantAge ? parseInt(body.participantAge, 10) : undefined,
      participantGender: body.participantGender,
      notes: body.notes,
    });

    return Response.json({ success: true, registration: reg });
  } catch (err: any) {
    console.error("POST /api/camps/[campId]/register error:", err);
    return Response.json({ error: err.message || "Failed to register for camp" }, { status: 400 });
  }
}
