import { auth, database } from "@/lib/auth";
import { Kysely } from "kysely";
import { headers } from "next/headers";

interface AccountDatabase {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    updatedAt: Date;
    ip: string | null;
    userAgent: string | null;
  };
}

const db = database as unknown as Kysely<AccountDatabase>;

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { password } = (await request.json()) as { password?: string };
  if (!password) {
    return Response.json({ error: "Password is required" }, { status: 400 });
  }

  // Verify password by attempting to sign in
  try {
    const verify = await auth.api.verifyPassword({
      body: { password },
      headers: await headers(),
    });
    if (!verify) {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  // Delete user and their sessions
  await db.deleteFrom("session").where("userId", "=", session.user.id).execute();
  await db.deleteFrom("user").where("id", "=", session.user.id).execute();

  return Response.json({ success: true });
}
