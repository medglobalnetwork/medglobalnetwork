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
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  account: {
    id: string;
    userId: string;
    accountId: string;
    providerId: string;
    password?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

const db = database as unknown as Kysely<AccountDatabase>;

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const credentialAccount = await db
      .selectFrom("account")
      .where("userId", "=", session.user.id)
      .where("providerId", "=", "credential")
      .selectAll()
      .executeTakeFirst();

    return Response.json({
      hasPassword: Boolean(credentialAccount?.password),
    });
  } catch (err) {
    console.error("Failed to check user account status:", err);
    return Response.json({ hasPassword: false });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  let hasPassword = false;
  try {
    const credentialAccount = await db
      .selectFrom("account")
      .where("userId", "=", session.user.id)
      .where("providerId", "=", "credential")
      .selectAll()
      .executeTakeFirst();

    hasPassword = Boolean(credentialAccount?.password);
  } catch (err) {
    console.error("Failed to check credential account:", err);
  }

  const body = (await request.json().catch(() => ({}))) as {
    password?: string;
    confirmation?: string;
  };

  if (hasPassword) {
    if (!body.password) {
      return Response.json({ error: "Password is required" }, { status: 400 });
    }

    try {
      const verify = await auth.api.verifyPassword({
        body: { password: body.password },
        headers: await headers(),
      });
      if (!verify) {
        return Response.json({ error: "Invalid password" }, { status: 401 });
      }
    } catch {
      return Response.json({ error: "Invalid password" }, { status: 401 });
    }
  } else {
    if (body.confirmation?.trim().toUpperCase() !== "DELETE") {
      return Response.json(
        { error: "Please type DELETE to confirm deletion" },
        { status: 400 }
      );
    }
  }

  // Delete all user related records cleanly
  try {
    await db.deleteFrom("account").where("userId", "=", session.user.id).execute();
  } catch (err) {
    console.warn("Failed to delete from account table:", err);
  }

  try {
    await db.deleteFrom("session").where("userId", "=", session.user.id).execute();
  } catch (err) {
    console.warn("Failed to delete from session table:", err);
  }

  try {
    await db.deleteFrom("user").where("id", "=", session.user.id).execute();
  } catch (err) {
    console.error("Failed to delete user:", err);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }

  return Response.json({ success: true });
}
