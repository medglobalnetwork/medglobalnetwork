const { Pool } = require('pg');
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

const fs = require('fs');
const path = require('path');

async function migrate() {
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  console.log("Connecting with DATABASE_URL:", connectionString ? "Set" : "Not set");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const sqlContent = fs.readFileSync(path.join(__dirname, '../sql/learn-migration.sql'), 'utf-8');

  try {
    await pool.query(sqlContent);
    console.log("Learn migration executed successfully!");
  } catch (e) {
    console.error("Migration error:", e.message);
  }

  const res = await pool.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'courses', 'course_modules', 'course_lessons', 'course_resources', 
      'course_enrollments', 'lesson_progress', 'quizzes', 'quiz_questions', 
      'quiz_options', 'quiz_attempts', 'certificates'
    );
  `);
  console.log('Confirmed created Learn tables:', res.rows.map(r => r.table_name));

  await pool.end();
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
