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
  const { pool } = await import("../lib/auth");
  const { ensureAdminTables } = await import("../modules/admin/lib/admin-db");
  const { ensureVerificationTables } = await import("../modules/onboarding/lib/verification-db");
  const { ensurePhoneAuthTables } = await import("../lib/phone-auth");

  await ensureAdminTables();
  await ensureVerificationTables();
  await ensurePhoneAuthTables();

  const phone = "6263585180";
  const normalizedPhone = "+916263585180";
  const adminEmail = "patreshubham141@gmail.com";
  const adminName = "Shubham Patre (Super Admin)";

  console.log(`Checking if user exists for email: ${adminEmail} or phone: ${phone}...`);

  const existingRes = await pool.query(
    `SELECT id, name, email, phone FROM "user" 
     WHERE LOWER(email) = LOWER($1) OR phone = $2 OR phone = $3
     LIMIT 1`,
    [adminEmail, phone, normalizedPhone]
  );

  let userId: string;

  if (existingRes.rows.length > 0) {
    const user = existingRes.rows[0];
    userId = user.id;
    console.log(`User exists with id: ${userId}. Updating phone to ${normalizedPhone}...`);

    await pool.query(
      `UPDATE "user" 
       SET phone = $1, "emailVerified" = TRUE, name = COALESCE(NULLIF(name, ''), $2), "updatedAt" = NOW()
       WHERE id = $3`,
      [normalizedPhone, adminName, userId]
    );
  } else {
    userId = `usr_admin_${Date.now()}`;
    console.log(`Creating new user with id: ${userId}...`);

    await pool.query(
      `INSERT INTO "user" (id, name, email, "emailVerified", phone, username, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, TRUE, $4, $5, NOW(), NOW())`,
      [userId, adminName, adminEmail, normalizedPhone, "admin_shubham"]
    );
  }

  // 1. Ensure professional_profiles
  await pool.query(
    `INSERT INTO professional_profiles (id, user_id, username, member_id, designation, identity_verified, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'Super Administrator', TRUE, NOW(), NOW())
     ON CONFLICT (user_id) DO UPDATE SET 
       username = COALESCE(professional_profiles.username, EXCLUDED.username),
       identity_verified = TRUE,
       updated_at = NOW()`,
    [`pp_${userId}`, userId, "admin_shubham", "MGN-ADMIN-01"]
  );

  // 2. Ensure mgn_identities
  await pool.query(
    `INSERT INTO mgn_identities (
       id, user_id, account_type, category, profession_or_type, 
       legal_first_name, legal_last_name, display_name, phone, official_email, 
       verification_status, created_at, updated_at
     )
     VALUES (
       $1, $2, 'INDIVIDUAL', 'healthcare_professional', 'administrator',
       'Shubham', 'Patre', $3, $4, $5,
       'APPROVED', NOW(), NOW()
     )
     ON CONFLICT (user_id) DO UPDATE SET 
       phone = EXCLUDED.phone,
       verification_status = 'APPROVED',
       updated_at = NOW()`,
    [`id_${userId}`, userId, adminName, normalizedPhone, adminEmail]
  );

  // 3. Ensure SUPER_ADMIN role in admin_user_roles
  await pool.query(
    `INSERT INTO admin_user_roles (id, user_id, user_email, role, granted_by, notes, created_at, updated_at)
     VALUES (gen_random_uuid()::text, $1, $2, 'SUPER_ADMIN', 'SYSTEM', 'Permanent Super Admin Provision', NOW(), NOW())
     ON CONFLICT (user_id, role) DO UPDATE SET updated_at = NOW()`,
    [userId, adminEmail]
  );

  console.log(`\n✅ Account for ${normalizedPhone} (${adminEmail}) successfully provisioned as SUPER_ADMIN!`);
  console.log(`You can now log in using Phone OTP on ${phone} or ${normalizedPhone}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creating admin user:", err);
  process.exit(1);
});
