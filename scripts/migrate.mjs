// scripts/migrate.mjs
import fs from "fs";
import path from "path";
import pg from "pg";
const { Pool } = pg;

// Read .env.local or .env if present
const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
  const envPath = path.join(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...rest] = trimmed.split("=");
        const value = rest.join("=").replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
  }
}

const databaseUrl =
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  console.error("❌ No database connection URL found in environment variables (SUPABASE_DATABASE_URL, DATABASE_URL, or POSTGRES_URL).");
  process.exit(1);
}

const isRemoteDb =
  databaseUrl.includes("supabase") ||
  databaseUrl.includes("pooler") ||
  databaseUrl.includes("aws") ||
  databaseUrl.includes("postgres");

console.log(`🔌 Connecting to database (${databaseUrl.split("@")[1] || "configured database"})...`);

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
});

async function runMigrations() {
  const sqlDir = path.join(process.cwd(), "sql");
  const sqlFiles = [
    "admin-migration.sql",
    "network-migration.sql",
    "learn-migration.sql",
    "opportunities-migration.sql",
    "stories-migration.sql",
    "onboarding-verification-migration.sql",
  ];

  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL / Supabase database!\n");

    for (const fileName of sqlFiles) {
      const filePath = path.join(sqlDir, fileName);
      if (fs.existsSync(filePath)) {
        console.log(`⏳ Executing ${fileName}...`);
        const sqlContent = fs.readFileSync(filePath, "utf-8");
        await client.query(sqlContent);
        console.log(`✅ ${fileName} executed successfully!`);
      } else {
        console.warn(`⚠️ File ${fileName} not found in sql/ directory.`);
      }
    }

    client.release();
    console.log("\n🎉 ALL SQL MIGRATIONS COMPLETED SUCCESSFULLY IN SUPABASE!");
  } catch (err) {
    console.error("\n❌ Migration Error:", err.message);
  } finally {
    await pool.end();
  }
}

runMigrations();
