const { Pool } = require('pg');
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const fs = require('fs');
const path = require('path');

async function migrate() {
  const connectionString =
    process.env.SUPABASE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres.odebrozvkajmmuilutsa:Shubham2002%40@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

  console.log("Connecting to PostgreSQL database...");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const sqlContent = fs.readFileSync(path.join(__dirname, '../sql/opportunities-migration.sql'), 'utf-8');

  try {
    await pool.query(sqlContent);
    console.log("Opportunities migration executed successfully!");
  } catch (e) {
    console.error("Migration error:", e.message);
  }

  const res = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'organizations', 'organization_members', 'jobs', 
      'job_applications', 'job_application_status_history', 
      'saved_jobs', 'job_alerts'
    )
    ORDER BY table_name;
  `);
  console.log('Confirmed created Opportunities tables:', res.rows.map(r => r.table_name));

  const jobCount = await pool.query('SELECT COUNT(*) FROM jobs;');
  console.log('Total seeded jobs:', jobCount.rows[0].count);

  await pool.end();
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
