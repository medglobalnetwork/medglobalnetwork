// app/api/learn/resources/[resourceId]/versions/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getResourceVersions,
  createNewVersion,
} from "@/modules/learn/lib/resource-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;

  try {
    const versions = await getResourceVersions(resourceId);
    return Response.json({ versions });
  } catch (err: any) {
    console.error(`GET /api/learn/resources/${resourceId}/versions error:`, err);
    return Response.json(
      { error: err.message || "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  const { resourceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.changeNote?.trim()) {
      return Response.json(
        { error: "Change note is required for new versions" },
        { status: 400 }
      );
    }

    const version = await createNewVersion(
      resourceId,
      {
        fileUrl: body.fileUrl || null,
        storageKey: body.storageKey || null,
        fileSizeBytes: body.fileSizeBytes || null,
        mimeType: body.mimeType || null,
        changeNote: body.changeNote.trim(),
        nativeContent: body.nativeContent || null,
        pageCount: body.pageCount || null,
        durationSeconds: body.durationSeconds || null,
      },
      session.user.id
    );

    return Response.json({ version }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/learn/resources/${resourceId}/versions error:`, err);
    return Response.json(
      { error: err.message || "Failed to create new version" },
      { status: 500 }
    );
  }
}
