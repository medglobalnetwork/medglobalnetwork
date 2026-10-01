// app/api/learn/lessons/[lessonId]/resources/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  listResources,
  createResource,
  CreateResourceInput,
} from "@/modules/learn/lib/resource-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;

  try {
    const resources = await listResources({
      lessonId,
      userId: currentUserId,
    });

    return Response.json({ resources, count: resources.length });
  } catch (err: any) {
    console.error(`GET /api/learn/lessons/${lessonId}/resources error:`, err);
    return Response.json(
      { error: err.message || "Failed to fetch lesson resources", resources: [] },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.title?.trim()) {
      return Response.json({ error: "Resource title is required" }, { status: 400 });
    }

    const input: CreateResourceInput = {
      instructorId: session.user.id,
      courseId: body.courseId || null,
      moduleId: body.moduleId || null,
      lessonId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      resourceType: body.resourceType || "pdf",
      category: body.category || "Medical",
      tags: Array.isArray(body.tags) ? body.tags : [],
      status: body.status || "PUBLISHED",
      fileUrl: body.fileUrl || null,
      storageKey: body.storageKey || null,
      fileSizeBytes: body.fileSizeBytes || null,
      mimeType: body.mimeType || null,
      originalFilename: body.originalFilename || null,
      pageCount: body.pageCount || null,
      durationSeconds: body.durationSeconds || null,
      dimensions: body.dimensions || null,
      thumbnailUrl: body.thumbnailUrl || null,
      isPinned: !!body.isPinned,
      isPublic: !!body.isPublic,
      copyrightDeclared: body.copyrightDeclared ?? true,
      nativeContent: body.nativeContent || null,
      availableFrom: body.availableFrom || null,
      availableUntil: body.availableUntil || null,
      permissions: body.permissions || {
        allow_view: true,
        allow_download: false,
        allow_print: false,
        allow_copy: false,
        allow_offline: false,
        access_duration_type: "while_enrolled",
      },
    };

    const resource = await createResource(input);
    return Response.json({ resource }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/learn/lessons/${lessonId}/resources error:`, err);
    return Response.json(
      { error: err.message || "Failed to create resource" },
      { status: 500 }
    );
  }
}
