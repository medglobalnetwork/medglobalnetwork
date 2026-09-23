-- ============================================================
-- MGN Communication Engine — Complete Database Migration
-- sql/communication-migration.sql
--
-- One Professional Communication Layer for the entire MGN ecosystem:
-- Direct, Groups, Communities, Organizations, Events, Camps, Research,
-- Jobs, Marketplace, Meetings, Calls & Moderation.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CENTRAL CONVERSATIONS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id                      VARCHAR(64) PRIMARY KEY,
  type                    VARCHAR(32) NOT NULL DEFAULT 'DIRECT',
  -- 'DIRECT' | 'GROUP' | 'COMMUNITY' | 'ORGANIZATION' | 'EVENT' | 'CAMP' | 'RESEARCH' | 'JOB' | 'MARKETPLACE' | 'SUPPORT' | 'SYSTEM'
  name                    VARCHAR(255),
  avatar_url              TEXT,
  created_by              TEXT REFERENCES "user"(id) ON DELETE SET NULL,

  -- Context Links (Nullable references)
  event_id                VARCHAR(64),
  camp_id                 VARCHAR(64),
  research_project_id     VARCHAR(64),
  job_id                  TEXT,
  organization_id         TEXT,
  marketplace_order_id    TEXT,
  community_id            TEXT,

  -- Lifecycle and Privacy
  status                  VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  -- 'ACTIVE' | 'ARCHIVED' | 'MUTED' | 'LOCKED' | 'SUSPENDED' | 'DELETED' | 'READ_ONLY'
  privacy                 VARCHAR(32) NOT NULL DEFAULT 'PRIVATE',
  -- 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE'
  settings                JSONB DEFAULT '{}'::jsonb,

  -- Cached state for fast listing
  last_message_content    TEXT,
  last_message_at         TIMESTAMPTZ,
  last_sender_id          TEXT,

  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_event ON conversations(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_camp ON conversations(camp_id) WHERE camp_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_research ON conversations(research_project_id) WHERE research_project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_job ON conversations(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_community ON conversations(community_id) WHERE community_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg_at ON conversations(last_message_at DESC NULLS LAST);

-- ─────────────────────────────────────────────────────────────
-- 2. CONVERSATION MEMBERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_members (
  id                      VARCHAR(64) PRIMARY KEY,
  conversation_id         VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role                    VARCHAR(32) NOT NULL DEFAULT 'MEMBER',
  -- 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER'
  joined_at               TIMESTAMPTZ DEFAULT now(),
  last_read_at            TIMESTAMPTZ DEFAULT now(),
  last_read_message_id    VARCHAR(64),
  is_muted                BOOLEAN DEFAULT false,
  muted_until             TIMESTAMPTZ,

  CONSTRAINT unique_conv_user UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_role ON conversation_members(role);

-- ─────────────────────────────────────────────────────────────
-- 3. COMMUNICATION MESSAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_messages (
  id                      VARCHAR(64) PRIMARY KEY,
  conversation_id         VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  client_message_id       VARCHAR(128),
  sequence_number         BIGINT NOT NULL DEFAULT 1,
  type                    VARCHAR(32) NOT NULL DEFAULT 'TEXT',
  -- 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'VOICE' | 'DOCUMENT' | 'LINK' | 'PROFILE' | 'POST' | 'COURSE' | 'JOB' | 'EVENT' | 'CAMP' | 'RESEARCH' | 'PRODUCT' | 'POLL' | 'SYSTEM' | 'MEETING'
  content                 TEXT,
  reply_to_id             VARCHAR(64) REFERENCES communication_messages(id) ON DELETE SET NULL,
  forwarded_from_id       VARCHAR(64),
  media_urls              TEXT[],
  metadata                JSONB DEFAULT '{}'::jsonb,
  status                  VARCHAR(32) NOT NULL DEFAULT 'SENT',
  -- 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  is_pinned               BOOLEAN DEFAULT false,
  edited_at               TIMESTAMPTZ,
  edit_version            INTEGER DEFAULT 0,
  deleted_at              TIMESTAMPTZ,
  deleted_for_all         BOOLEAN DEFAULT false,
  deleted_for_user_ids    TEXT[] DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_messages_conv_seq ON communication_messages(conversation_id, sequence_number ASC);
CREATE INDEX IF NOT EXISTS idx_comm_messages_conv_created ON communication_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_comm_messages_sender ON communication_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_comm_messages_client_id ON communication_messages(client_message_id) WHERE client_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comm_messages_pinned ON communication_messages(conversation_id) WHERE is_pinned = true;

-- ─────────────────────────────────────────────────────────────
-- 3B. COMMUNICATION MENTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_mentions (
  id                      VARCHAR(64) PRIMARY KEY,
  message_id              VARCHAR(64) NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
  user_id                 TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  mention_type            VARCHAR(32) NOT NULL DEFAULT 'USER',
  created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_mentions_msg ON communication_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_comm_mentions_user ON communication_mentions(user_id);

-- ─────────────────────────────────────────────────────────────
-- 4. MESSAGE REACTIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_reactions (
  id                      VARCHAR(64) PRIMARY KEY,
  message_id              VARCHAR(64) NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
  user_id                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reaction                VARCHAR(32) NOT NULL,
  created_at              TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_msg_reaction UNIQUE (message_id, user_id, reaction)
);

CREATE INDEX IF NOT EXISTS idx_comm_reactions_msg ON communication_reactions(message_id);

-- ─────────────────────────────────────────────────────────────
-- 5. MESSAGE REQUESTS (Non-connected users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_message_requests (
  id                      VARCHAR(64) PRIMARY KEY,
  sender_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  receiver_id             TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  initial_message         TEXT,
  status                  VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  -- 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED'
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_comm_msg_request UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_comm_msg_req_receiver ON communication_message_requests(receiver_id, status);

-- ─────────────────────────────────────────────────────────────
-- 6. PINNED MESSAGES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_pins (
  id                      VARCHAR(64) PRIMARY KEY,
  conversation_id         VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id              VARCHAR(64) NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
  pinned_by               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  pinned_at               TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_conv_pin UNIQUE (conversation_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_comm_pins_conv ON communication_pins(conversation_id);

-- ─────────────────────────────────────────────────────────────
-- 7. CALLS & SESSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_calls (
  id                      VARCHAR(64) PRIMARY KEY,
  conversation_id         VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  caller_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  call_type               VARCHAR(32) NOT NULL DEFAULT 'VOICE',
  -- 'VOICE' | 'VIDEO' | 'MEETING'
  status                  VARCHAR(32) NOT NULL DEFAULT 'INITIATED',
  -- 'INITIATED' | 'RINGING' | 'ACTIVE' | 'ENDED' | 'REJECTED' | 'MISSED'
  started_at              TIMESTAMPTZ DEFAULT now(),
  ended_at                TIMESTAMPTZ,
  duration_seconds        INTEGER DEFAULT 0,
  meeting_id              VARCHAR(64),
  metadata                JSONB DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_calls_conv ON communication_calls(conversation_id);

CREATE TABLE IF NOT EXISTS communication_call_participants (
  id                      VARCHAR(64) PRIMARY KEY,
  call_id                 VARCHAR(64) NOT NULL REFERENCES communication_calls(id) ON DELETE CASCADE,
  user_id                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status                  VARCHAR(32) NOT NULL DEFAULT 'INVITED',
  -- 'INVITED' | 'CONNECTED' | 'LEFT' | 'DECLINED'
  joined_at               TIMESTAMPTZ,
  left_at                 TIMESTAMPTZ,

  CONSTRAINT unique_call_participant UNIQUE (call_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- 8. SAFETY & MODERATION (Reports, Blocks, Audit Logs)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_reports (
  id                      VARCHAR(64) PRIMARY KEY,
  reporter_id             TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reported_user_id        TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  conversation_id         VARCHAR(64) REFERENCES conversations(id) ON DELETE SET NULL,
  message_id              VARCHAR(64) REFERENCES communication_messages(id) ON DELETE SET NULL,
  reason                  VARCHAR(64) NOT NULL,
  -- 'spam' | 'harassment' | 'scam' | 'impersonation' | 'inappropriate' | 'misconduct' | 'other'
  details                 TEXT,
  status                  VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  -- 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
  resolution_action       VARCHAR(64),
  resolved_by             TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT now(),
  resolved_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comm_reports_status ON communication_reports(status);

CREATE TABLE IF NOT EXISTS communication_user_blocks (
  id                      VARCHAR(64) PRIMARY KEY,
  blocker_id              TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  blocked_id              TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at              TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_comm_block UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_comm_blocks_lookup ON communication_user_blocks(blocker_id, blocked_id);

CREATE TABLE IF NOT EXISTS communication_audit_logs (
  id                      VARCHAR(64) PRIMARY KEY,
  actor_id                TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  action                  VARCHAR(64) NOT NULL,
  target_type             VARCHAR(64) NOT NULL,
  target_id               VARCHAR(64) NOT NULL,
  reason                  TEXT,
  metadata                JSONB DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comm_audit_actor ON communication_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_comm_audit_created ON communication_audit_logs(created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- 9. USER COMMUNICATION SETTINGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communication_settings (
  user_id                 TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  show_online_status      BOOLEAN DEFAULT true,
  show_last_active        BOOLEAN DEFAULT true,
  show_read_receipts      BOOLEAN DEFAULT true,
  show_typing_status      BOOLEAN DEFAULT true,
  allow_messages_from     VARCHAR(32) DEFAULT 'EVERYONE',
  -- 'EVERYONE' | 'CONNECTIONS_ONLY'
  notifications_enabled   BOOLEAN DEFAULT true,
  push_enabled            BOOLEAN DEFAULT true,
  email_enabled           BOOLEAN DEFAULT false,
  updated_at              TIMESTAMPTZ DEFAULT now()
);
