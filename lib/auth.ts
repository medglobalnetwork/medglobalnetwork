import { betterAuth } from "better-auth";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const databaseUrl =
  process.env.SUPABASE_DATABASE_URL || "postgresql://localhost:5432/mgn";

const globalForAuth = globalThis as typeof globalThis & {
  mgnAuthPool?: Pool;
  mgnAuthDatabase?: Kysely<unknown>;
};

const pool =
  globalForAuth.mgnAuthPool ?? new Pool({ connectionString: databaseUrl });

export const database =
  globalForAuth.mgnAuthDatabase ??
  new Kysely({
    dialect: new PostgresDialect({ pool }),
  });

globalForAuth.mgnAuthPool = pool;
globalForAuth.mgnAuthDatabase = database;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  database: {
    db: database,
    type: "postgres",
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.info(`Password reset requested for ${user.email}: ${url}`);
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      prompt: "select_account",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
});
