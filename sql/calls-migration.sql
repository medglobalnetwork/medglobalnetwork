-- ============================================================
-- MGN 1:1 Calls (WebRTC) — Database Migration
-- Run this ONCE in your Supabase SQL editor.
--
-- Signaling is stored in Postgres rather than process memory: the app
-- runs on serverless Next.js where an in-memory Map is not shared
-- between invocations and calls would never connect.
-- ============================================================

CREATE TABLE IF NOT EXISTS calls (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  caller_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  callee_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  call_type       VARCHAR(8)  NOT NULL DEFAULT 'VOICE',   -- VOICE | VIDEO
  status          VARCHAR(16) NOT NULL DEFAULT 'ringing', -- ringing | accepted | declined | ended | missed
  conversation_id VARCHAR(64),
  started_at      TIMESTAMPTZ,
  answered_at     TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  end_reason      VARCHAR(64),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_call_type   CHECK (call_type IN ('VOICE', 'VIDEO')),
  CONSTRAINT chk_call_status CHECK (status IN ('ringing', 'accepted', 'declined', 'ended', 'missed')),
  CONSTRAINT chk_call_distinct_parties CHECK (caller_id <> callee_id)
);

CREATE INDEX IF NOT EXISTS idx_calls_caller   ON calls(caller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_callee   ON calls(callee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_status   ON calls(status, created_at DESC);

-- Signaling mailbox. BIGSERIAL gives both ordering and a poll cursor.
CREATE TABLE IF NOT EXISTS call_signals (
  id         BIGSERIAL   PRIMARY KEY,
  call_id    TEXT        NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  from_user  TEXT        NOT NULL,
  to_user    TEXT        NOT NULL,
  kind       VARCHAR(24) NOT NULL, -- offer | answer | ice | hangup | mute | video
  payload    JSONB       NOT NULL,
  consumed   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_call_signal_kind CHECK (kind IN ('offer', 'answer', 'ice', 'hangup', 'mute', 'video'))
);

-- Poll reads only unconsumed rows for the callee, ordered by id.
CREATE INDEX IF NOT EXISTS idx_call_signals_pending ON call_signals(call_id, to_user, consumed, id);

-- Mark abandoned ringing calls as missed. Run on a schedule (pg_cron or an
-- external job): UPDATE calls SET status='missed', ended_at=NOW()
-- WHERE status='ringing' AND created_at < NOW() - INTERVAL '45 seconds';