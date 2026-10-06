// app/api/learn/resources/route.ts
import { getSafeSession } from "@/lib/auth";
import { headers } from "next/headers";
import {
  listResources,
  createResource,
  CreateResourceInput,
} from "@/modules/learn/lib/resource-service";

export async function GET(request: Request) {
  try {
    const session = await getSafeSession(await headers());
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || undefined;
    const moduleId = searchParams.get("moduleId") || undefined;
    const lessonId = searchParams.get("lessonId") || undefined;
    const resourceType = (searchParams.get("resourceType") as any) || undefined;
    const query = searchParams.get("query") || undefined;
    const category = searchParams.get("category") || undefined;
    const instructorId = searchParams.get("instructorId") || undefined;
    const isPinned = searchParams.has("isPinned")
      ? searchParams.get("isPinned") === "true"
      : undefined;

    const resources = await listResources({
      courseId,
      moduleId,
      lessonId,
      resourceType,
      query,
      category,
      instructorId,
      isPinned,
      userId: currentUserId,
    });

    return Response.json({ resources: resources || [], count: resources ? resources.length : 0 });
  } catch (err: any) {
    console.error("GET /api/learn/resources error:", err);
    return Response.json({ resources: [], count: 0 }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSafeSession(await headers());
    if (!session?.user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title?.trim()) {
      return Response.json({ error: "Resource title is required" }, { status: 400 });
    }
    if (!body.resourceType) {
      return Response.json({ error: "Resource type is required" }, { status: 400 });
    }

    const input: CreateResourceInput = {
      instructorId: session.user.id,
      courseId: body.courseId || null,
      moduleId: body.moduleId || null,
      lessonId: body.lessonId || null,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      resourceType: body.resourceType,
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
    console.error("POST /api/learn/resources error:", err);
    return Response.json(
      { error: err.message || "Failed to create resource" },
      { status: 500 }
    );
  }
}
