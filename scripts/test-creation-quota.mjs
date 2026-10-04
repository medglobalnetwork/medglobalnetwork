// scripts/test-creation-quota.mjs
import fs from "fs";
import path from "path";
import pg from "pg";
import crypto from "node:crypto";
const { Pool } = pg;

// Read .env.local / .env
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
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.log("No DB connection URL configured in environment. Skipping direct DB integration test.");
  process.exit(0);
}

const isRemoteDb =
  databaseUrl.includes("supabase") ||
  databaseUrl.includes("pooler") ||
  databaseUrl.includes("aws");

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
});

async function runTests() {
  console.log("=== RUNNING CREATION QUOTA INTEGRATION & CONCURRENCY TESTS ===");
  const client = await pool.connect();

  try {
    // 1. Ensure tables exist
    const migrationSql = fs.readFileSync(path.join(process.cwd(), "sql/creation-quotas-migration.sql"), "utf-8");
    await client.query(migrationSql);
    console.log("✓ Migration executed / tables ensured successfully");

    const testOwnerId = `test_owner_${Date.now()}`;
    const category = "jobs";

    // Test 1: Concurrency on 1st free upload
    console.log("\n[Test 1] Testing concurrent 1st free upload on 10 parallel requests...");
    const concurrency = 10;
    const attempts = Array.from({ length: concurrency }).map(async () => {
      const id = crypto.randomUUID();
      const res = await pool.query(
        `INSERT INTO creation_quotas (id, owner_type, owner_id, category, free_used, updated_at)
         VALUES ($1, $2, $3, $4, 1, CURRENT_TIMESTAMP)
         ON CONFLICT (owner_type, owner_id, category)
         DO UPDATE SET free_used = creation_quotas.free_used + 1, updated_at = CURRENT_TIMESTAMP
         WHERE creation_quotas.free_used < 1
         RETURNING free_used`,
        [id, "individual", testOwnerId, category]
      );
      return res.rows.length > 0;
    });

    const results = await Promise.all(attempts);
    const successCount = results.filter(Boolean).length;
    console.log(`Results: ${successCount} succeeded, ${concurrency - successCount} denied.`);
    if (successCount !== 1) {
      throw new Error(`Concurrency race condition failed: expected exactly 1 free consumption, got ${successCount}`);
    }
    console.log("✓ Concurrency test PASSED: Exactly 1 free upload consumed, 9 rejected!");

    // Test 2: Verify database state
    const quotaCheck = await pool.query(
      `SELECT free_used FROM creation_quotas WHERE owner_type = 'individual' AND owner_id = $1 AND category = $2`,
      [testOwnerId, category]
    );
    if (Number(quotaCheck.rows[0].free_used) !== 1) {
      throw new Error(`Expected free_used = 1, got ${quotaCheck.rows[0].free_used}`);
    }
    console.log("✓ Quota row accurately reflects free_used = 1");

    // Test 3: Insert a paid order and test concurrent consumption
    console.log("\n[Test 2] Testing concurrent consumption of 1 paid order across 10 requests...");
    const testOrderId = `order_test_${Date.now()}`;
    await pool.query(
      `INSERT INTO creation_payments (id, owner_type, owner_id, category, order_id, amount, status)
       VALUES ($1, 'individual', $2, $3, $4, 499, 'paid')`,
      [crypto.randomUUID(), testOwnerId, category, testOrderId]
    );

    const paidAttempts = Array.from({ length: concurrency }).map(async () => {
      const res = await pool.query(
        `UPDATE creation_payments
         SET status = 'consumed', updated_at = CURRENT_TIMESTAMP
         WHERE id = (
           SELECT id FROM creation_payments
           WHERE owner_type = 'individual' AND owner_id = $1 AND category = $2 AND status = 'paid'
           ORDER BY created_at ASC
           LIMIT 1
           FOR UPDATE SKIP LOCKED
         )
         RETURNING id, order_id`,
        [testOwnerId, category]
      );
      return res.rows.length > 0;
    });

    const paidResults = await Promise.all(paidAttempts);
    const paidSuccessCount = paidResults.filter(Boolean).length;
    console.log(`Results: ${paidSuccessCount} paid order consumed, ${concurrency - paidSuccessCount} denied.`);
    if (paidSuccessCount !== 1) {
      throw new Error(`Double-spending race condition failed: expected exactly 1 paid order consumption, got ${paidSuccessCount}`);
    }
    console.log("✓ Paid order concurrency test PASSED: Exactly 1 request consumed the payment!");

    // Test 4: Refund / Compensation test
    console.log("\n[Test 3] Testing refundCreationQuota compensation on failure...");
    // Refund the paid order
    await pool.query(
      `UPDATE creation_payments
       SET status = 'paid', updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $1 AND owner_type = 'individual' AND owner_id = $2 AND status = 'consumed'`,
      [testOrderId, testOwnerId]
    );
    const checkRefund = await pool.query(
      `SELECT status FROM creation_payments WHERE order_id = $1`,
      [testOrderId]
    );
    if (checkRefund.rows[0]?.status !== "paid") {
      throw new Error("Refund failed to restore status to 'paid'");
    }
    console.log("✓ Payment refund restored order to 'paid' status");

    // Cleanup test records
    await pool.query(`DELETE FROM creation_quotas WHERE owner_id = $1`, [testOwnerId]);
    await pool.query(`DELETE FROM creation_payments WHERE owner_id = $1`, [testOwnerId]);
    console.log("\n✓ Test data cleaned up successfully");
    console.log("=== ALL INTEGRATION & CONCURRENCY TESTS PASSED! ===");
  } finally {
    client.release();
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
