// app/api/learn/collections/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getUserCollections,
  createCollection,
  addToCollection,
  removeFromCollection,
  deleteCollection,
} from "@/modules/learn/lib/learn-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const collections = await getUserCollections(session.user.id);
    return Response.json({ collections });
  } catch (err: any) {
    console.error("GET /api/learn/collections error:", err);
    return Response.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, title, description, color, collectionId, courseId } = body;

    if (action === "add_item") {
      if (!collectionId || !courseId) {
        return Response.json({ error: "collectionId and courseId are required" }, { status: 400 });
      }
      await addToCollection(session.user.id, collectionId, courseId);
      return Response.json({ success: true, message: "Course added to collection" });
    }

    if (action === "remove_item") {
      if (!collectionId || !courseId) {
        return Response.json({ error: "collectionId and courseId are required" }, { status: 400 });
      }
      await removeFromCollection(session.user.id, collectionId, courseId);
      return Response.json({ success: true, message: "Course removed from collection" });
    }

    // Default: create new collection
    if (!title?.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const newId = await createCollection(session.user.id, title, description, color);
    return Response.json({ success: true, id: newId });
  } catch (err: any) {
    console.error("POST /api/learn/collections error:", err);
    return Response.json({ error: "Failed to process collection action" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("id");

  if (!collectionId) {
    return Response.json({ error: "Collection ID is required" }, { status: 400 });
  }

  try {
    await deleteCollection(session.user.id, collectionId);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/learn/collections error:", err);
    return Response.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
