import { auth, database } from "@/lib/auth";
import { Kysely } from "kysely";
import { headers } from "next/headers";

export interface AdminDatabase {
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
    updatedAt: Date;
  };
}

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user.email?.toLowerCase();

  if (!session || !email || !adminEmails.has(email)) {
    return null;
  }

  return session;
}

export const adminDatabase = database as unknown as Kysely<AdminDatabase>;
