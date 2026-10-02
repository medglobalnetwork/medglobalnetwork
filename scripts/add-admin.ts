import * as fs from "node:fs";
import * as path from "node:path";

function loadEnv(file: string) {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

loadEnv(".env.local");
loadEnv(".env");

async function main() {
  const { pool, database } = await import("../lib/auth");
  const { ensureAdminTables } = await import("../modules/admin/lib/admin-db");
  const { sql } = await import("kysely");

  await ensureAdminTables();

  const phone = "6263585180";
  const normalized = "+916263585180";

  console.log(`Checking user accounts with phone: ${phone} / ${normalized}...`);

  const userRes: any = await sql`
    SELECT id, name, email, phone FROM "user" 
    WHERE phone = ${phone} 
       OR phone = ${normalized} 
       OR phone = ${'+91' + phone}
       OR email LIKE ${'%6263585180%'}
    LIMIT 10
  `.execute(database);

  console.log(`Found ${userRes?.rows?.length || 0} matching user(s):`, userRes?.rows);

  if (userRes?.rows && userRes.rows.length > 0) {
    for (const u of userRes.rows) {
      console.log(`Granting SUPER_ADMIN to user ${u.id} (${u.name}, ${u.email})...`);
      await pool.query(
        `INSERT INTO admin_user_roles (id, user_id, user_email, role, granted_by, notes, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, 'SUPER_ADMIN', 'SYSTEM', 'Assigned via system admin config', NOW(), NOW())
         ON CONFLICT (user_id, role) DO UPDATE SET updated_at = NOW()`,
        [u.id, u.email]
      );
    }
    console.log("Successfully granted SUPER_ADMIN role in database!");
  } else {
    console.log("Note: User with this phone has not signed up yet in PostgreSQL.");
    console.log("However, phone 6263585180 is permanently configured in ADMIN_PHONES in env and rbac.ts.");
    console.log("As soon as this user logs in or signs up, they will immediately have SUPER_ADMIN access to /admin.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Error adding admin:", err);
  process.exit(1);
});
