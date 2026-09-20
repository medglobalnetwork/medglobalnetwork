// app/api/learn/courses/[courseId]/enroll/route.ts
import { auth } from "@/lib/auth";
import { enrollUser } from "@/modules/learn/lib/learn-db";
import { createNotification } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { courseId } = await params;
  if (!courseId) {
    return Response.json({ error: "Invalid course ID" }, { status: 400 });
  }

  try {
    const enrollmentId = await enrollUser(courseId, session.user.id);

    // Notify user of enrollment
    await createNotification({
      userId: session.user.id,
      type: "course_enrollment",
      entityType: "course",
      entityId: courseId,
      message: "You have successfully enrolled in the course. Start your lessons now!",
    });

    return Response.json({ success: true, enrollmentId });
  } catch (err) {
    console.error("POST /api/learn/courses/[courseId]/enroll error:", err);
    return Response.json({ error: "Failed to enroll in course" }, { status: 500 });
  }
}
