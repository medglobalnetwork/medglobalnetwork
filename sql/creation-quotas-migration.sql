-- ============================================================
-- MGN CREATION QUOTAS & PAY-PER-POST RAZORPAY MIGRATION
-- File: sql/creation-quotas-migration.sql
--
-- Rule:
-- All creations EXCEPT normal social feed posts (i.e. Jobs, Conferences/Events,
-- CME/Courses, Health Camps, Research Projects) get 1 FREE upload per category.
-- From the 2nd upload onwards, the user or organization must pay per post via Razorpay.
-- ============================================================

-- 1. Creation Quotas table (tracks free upload consumption per owner and category)
CREATE TABLE IF NOT EXISTS creation_quotas (
    id VARCHAR(64) PRIMARY KEY,
    owner_type VARCHAR(32) NOT NULL, -- 'individual' | 'organization'
    owner_id VARCHAR(64) NOT NULL,   -- user_id or organization_id
    category VARCHAR(64) NOT NULL,   -- 'jobs', 'conferences', 'events', 'courses', 'camps', 'research'
    free_used INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_creation_quotas UNIQUE (owner_type, owner_id, category)
);

CREATE INDEX IF NOT EXISTS idx_creation_quotas_owner ON creation_quotas(owner_type, owner_id, category);

-- 2. Creation Payments table (tracks Razorpay orders & verified transactions)
CREATE TABLE IF NOT EXISTS creation_payments (
    id VARCHAR(64) PRIMARY KEY,
    owner_type VARCHAR(32) NOT NULL, -- 'individual' | 'organization'
    owner_id VARCHAR(64) NOT NULL,   -- user_id or organization_id
    category VARCHAR(64) NOT NULL,   -- 'jobs', 'conferences', 'events', 'courses', 'camps', 'research'
    order_id VARCHAR(128) NOT NULL UNIQUE,
    payment_id VARCHAR(128),
    signature VARCHAR(256),
    amount INT NOT NULL,             -- amount in INR (e.g. 499)
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(32) NOT NULL DEFAULT 'created', -- 'created' | 'paid' | 'consumed' | 'failed'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creation_payments_order ON creation_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_creation_payments_owner ON creation_payments(owner_type, owner_id, category, status);
