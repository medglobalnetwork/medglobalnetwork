import { auth, database } from "@/lib/auth";
import { Kysely } from "kysely";
import { headers } from "next/headers";
import { getAdminSession, AdminSessionContext } from "@/modules/admin/lib/rbac";

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

export async function requireAdmin(): Promise<AdminSessionContext | null> {
  const session = await getAdminSession(await headers());
  return session;
}

export const adminDatabase = database as unknown as Kysely<AdminDatabase>;
export { getAdminSession, hasPermission, requireAdminPermission } from "@/modules/admin/lib/rbac";
export { recordAuditLog } from "@/modules/admin/lib/audit";
