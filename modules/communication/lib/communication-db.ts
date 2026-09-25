// ============================================================
// MGN Communication Engine — Database Interface & Schema
// modules/communication/lib/communication-db.ts
//
// Typed Kysely interface for conversations, messages, reactions,
// calls, requests, moderation, and settings.
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";

let tablesInitialized = false;

export function generateCommId(prefix = "comm"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }
  return `${prefix}_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
}

/**
 * Ensures all communication engine tables and indexes exist.
 * Idempotent: safe to invoke on every route call.
 */
export async function ensureCommunicationTables(): Promise<void> {
  if (tablesInitialized) return;

  try {
    // 1. Conversations
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id                      VARCHAR(64) PRIMARY KEY,
        type                    VARCHAR(32) NOT NULL DEFAULT 'DIRECT',
        name                    VARCHAR(255),
        avatar_url              TEXT,
        created_by              TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        event_id                VARCHAR(64),
        camp_id                 VARCHAR(64),
        research_project_id     VARCHAR(64),
        job_id                  TEXT,
        organization_id         TEXT,
        marketplace_order_id    TEXT,
        community_id            TEXT,
        status                  VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
        privacy                 VARCHAR(32) NOT NULL DEFAULT 'PRIVATE',
        settings                JSONB DEFAULT '{}'::jsonb,
        last_message_content    TEXT,
        last_message_at         TIMESTAMPTZ,
        last_sender_id          TEXT,
        created_at              TIMESTAMPTZ DEFAULT now(),
        updated_at              TIMESTAMPTZ DEFAULT now()
      );
    `.execute(database);

    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_event ON conversations(event_id) WHERE event_id IS NOT NULL;`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_camp ON conversations(camp_id) WHERE camp_id IS NOT NULL;`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_research ON conversations(research_project_id) WHERE research_project_id IS NOT NULL;`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_job ON conversations(job_id) WHERE job_id IS NOT NULL;`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id) WHERE organization_id IS NOT NULL;`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_community ON conversations(community_id) WHERE community_id IS NOT NULL;`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_last_msg_at ON conversations(last_message_at DESC NULLS LAST);`.execute(database);

    // 2. Conversation Members
    await sql`
      CREATE TABLE IF NOT EXISTS conversation_members (
        id                      VARCHAR(64) PRIMARY KEY,
        conversation_id         VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        role                    VARCHAR(32) NOT NULL DEFAULT 'MEMBER',
        joined_at               TIMESTAMPTZ DEFAULT now(),
        last_read_at            TIMESTAMPTZ DEFAULT now(),
        last_read_message_id    VARCHAR(64),
        is_muted                BOOLEAN DEFAULT false,
        muted_until             TIMESTAMPTZ,
        CONSTRAINT unique_conv_user UNIQUE (conversation_id, user_id)
      );
    `.execute(database);

    await sql`CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id);`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON conversation_members(conversation_id);`.execute(database);

    // 3. Communication Messages
    await sql`
      CREATE TABLE IF NOT EXISTS communication_messages (
        id                      VARCHAR(64) PRIMARY KEY,
        conversation_id         VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        client_message_id       VARCHAR(128),
        sequence_number         BIGINT NOT NULL DEFAULT 1,
        type                    VARCHAR(32) NOT NULL DEFAULT 'TEXT',
        content                 TEXT,
        reply_to_id             VARCHAR(64) REFERENCES communication_messages(id) ON DELETE SET NULL,
        forwarded_from_id       VARCHAR(64),
        media_urls              TEXT[],
        metadata                JSONB DEFAULT '{}'::jsonb,
        status                  VARCHAR(32) NOT NULL DEFAULT 'SENT',
        is_pinned               BOOLEAN DEFAULT false,
        edited_at               TIMESTAMPTZ,
        edit_version            INTEGER DEFAULT 0,
        deleted_at              TIMESTAMPTZ,
        deleted_for_all         BOOLEAN DEFAULT false,
        deleted_for_user_ids    TEXT[] DEFAULT '{}',
        created_at              TIMESTAMPTZ DEFAULT now(),
        updated_at              TIMESTAMPTZ DEFAULT now()
      );
    `.execute(database);

    await sql`
      ALTER TABLE communication_messages ADD COLUMN IF NOT EXISTS deleted_for_user_ids TEXT[] DEFAULT '{}';
    `.execute(database);

    await sql`CREATE INDEX IF NOT EXISTS idx_comm_messages_conv_seq ON communication_messages(conversation_id, sequence_number ASC);`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_comm_messages_conv_created ON communication_messages(conversation_id, created_at ASC);`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_comm_messages_sender ON communication_messages(sender_id);`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_comm_messages_client_id ON communication_messages(client_message_id) WHERE client_message_id IS NOT NULL;`.execute(database);

    // Mentions
    await sql`
      CREATE TABLE IF NOT EXISTS communication_mentions (
        id                      VARCHAR(64) PRIMARY KEY,
        message_id              VARCHAR(64) NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
        user_id                 TEXT REFERENCES "user"(id) ON DELETE CASCADE,
        mention_type            VARCHAR(32) NOT NULL DEFAULT 'USER',
        created_at              TIMESTAMPTZ DEFAULT now()
      );
    `.execute(database);

    await sql`CREATE INDEX IF NOT EXISTS idx_comm_mentions_msg ON communication_mentions(message_id);`.execute(database);
    await sql`CREATE INDEX IF NOT EXISTS idx_comm_mentions_user ON communication_mentions(user_id);`.execute(database);

    // 4. Reactions
    await sql`
      CREATE TABLE IF NOT EXISTS communication_reactions (
        id                      VARCHAR(64) PRIMARY KEY,
        message_id              VARCHAR(64) NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
        user_id                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        reaction                VARCHAR(32) NOT NULL,
        created_at              TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT unique_comm_reaction UNIQUE (message_id, user_id, reaction)
      );
    `.execute(database);

    await sql`
      CREATE INDEX IF NOT EXISTS idx_comm_reactions_msg ON communication_reactions(message_id);
    `.execute(database);

    // 5. Message Requests
    await sql`
      CREATE TABLE IF NOT EXISTS communication_message_requests (
        id                      VARCHAR(64) PRIMARY KEY,
        sender_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        receiver_id             TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        initial_message         TEXT,
        status                  VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        created_at              TIMESTAMPTZ DEFAULT now(),
        updated_at              TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT unique_comm_msg_request UNIQUE (sender_id, receiver_id)
      );
    `.execute(database);

    await sql`
      CREATE INDEX IF NOT EXISTS idx_comm_msg_req_receiver ON communication_message_requests(receiver_id, status);
    `.execute(database);

    // 6. Pins
    await sql`
      CREATE TABLE IF NOT EXISTS communication_pins (
        id                      VARCHAR(64) PRIMARY KEY,
        conversation_id         VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        message_id              VARCHAR(64) NOT NULL REFERENCES communication_messages(id) ON DELETE CASCADE,
        pinned_by               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        pinned_at               TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT unique_comm_pin UNIQUE (conversation_id, message_id)
      );
    `.execute(database);

    // 7. Calls & Participants
    await sql`
      CREATE TABLE IF NOT EXISTS communication_calls (
        id                      VARCHAR(64) PRIMARY KEY,
        conversation_id         VARCHAR(64) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        caller_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        call_type               VARCHAR(32) NOT NULL DEFAULT 'VOICE',
        status                  VARCHAR(32) NOT NULL DEFAULT 'INITIATED',
        started_at              TIMESTAMPTZ DEFAULT now(),
        ended_at                TIMESTAMPTZ,
        duration_seconds        INTEGER DEFAULT 0,
        meeting_id              VARCHAR(64),
        metadata                JSONB DEFAULT '{}'::jsonb,
        created_at              TIMESTAMPTZ DEFAULT now()
      );
    `.execute(database);

    await sql`
      CREATE TABLE IF NOT EXISTS communication_call_participants (
        id                      VARCHAR(64) PRIMARY KEY,
        call_id                 VARCHAR(64) NOT NULL REFERENCES communication_calls(id) ON DELETE CASCADE,
        user_id                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        status                  VARCHAR(32) NOT NULL DEFAULT 'INVITED',
        joined_at               TIMESTAMPTZ,
        left_at                 TIMESTAMPTZ,
        CONSTRAINT unique_comm_participant UNIQUE (call_id, user_id)
      );
    `.execute(database);

    // 8. Reports & User Blocks
    await sql`
      CREATE TABLE IF NOT EXISTS communication_reports (
        id                      VARCHAR(64) PRIMARY KEY,
        reporter_id             TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        reported_user_id        TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        conversation_id         VARCHAR(64) REFERENCES conversations(id) ON DELETE SET NULL,
        message_id              VARCHAR(64) REFERENCES communication_messages(id) ON DELETE SET NULL,
        reason                  VARCHAR(64) NOT NULL,
        details                 TEXT,
        status                  VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        resolution_action       VARCHAR(64),
        resolved_by             TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        created_at              TIMESTAMPTZ DEFAULT now(),
        resolved_at             TIMESTAMPTZ
      );
    `.execute(database);

    await sql`
      CREATE TABLE IF NOT EXISTS communication_user_blocks (
        id                      VARCHAR(64) PRIMARY KEY,
        blocker_id              TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        blocked_id              TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        created_at              TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT unique_comm_user_block UNIQUE (blocker_id, blocked_id)
      );
    `.execute(database);

    // 9. Audit Logs
    await sql`
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
    `.execute(database);

    // 10. Communication Settings
    await sql`
      CREATE TABLE IF NOT EXISTS communication_settings (
        user_id                 TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
        show_online_status      BOOLEAN DEFAULT true,
        show_last_active        BOOLEAN DEFAULT true,
        show_read_receipts      BOOLEAN DEFAULT true,
        show_typing_status      BOOLEAN DEFAULT true,
        allow_messages_from     VARCHAR(32) DEFAULT 'EVERYONE',
        notifications_enabled   BOOLEAN DEFAULT true,
        push_enabled            BOOLEAN DEFAULT true,
        email_enabled           BOOLEAN DEFAULT false,
        updated_at              TIMESTAMPTZ DEFAULT now()
      );
    `.execute(database);

    // 11. Legacy Data Bridge Migration (Migrates any messages in direct_messages)
    try {
      await migrateLegacyDirectMessages();
    } catch (migErr) {
      console.warn("migrateLegacyDirectMessages warning:", migErr);
    }

    tablesInitialized = true;
  } catch (err) {
    console.warn("ensureCommunicationTables warning:", err);
  }
}

/**
 * Automatically bridges legacy direct_messages into canonical conversations & communication_messages.
 */
async function migrateLegacyDirectMessages(): Promise<void> {
  try {
    const tableExistsRes: any = await sql`
      SELECT to_regclass('public.direct_messages') as exists_table;
    `.execute(database);

    if (!tableExistsRes.rows?.[0]?.exists_table) {
      return;
    }

    // Check if there are any unmigrated direct messages
    const legacyCountRes: any = await sql`
      SELECT COUNT(*)::INT as cnt FROM direct_messages;
    `.execute(database);

    const legacyCount = legacyCountRes.rows?.[0]?.cnt || 0;
    if (legacyCount === 0) return;

    // Fetch distinct peer pairs
    const pairsRes: any = await sql`
      SELECT DISTINCT 
        LEAST(sender_id, receiver_id) as user1,
        GREATEST(sender_id, receiver_id) as user2
      FROM direct_messages;
    `.execute(database);

    for (const pair of pairsRes.rows || []) {
      const u1 = pair.user1;
      const u2 = pair.user2;

      // Check if conversation already exists for this pair
      const existingConv: any = await sql`
        SELECT c.id 
        FROM conversations c
        JOIN conversation_members m1 ON m1.conversation_id = c.id AND m1.user_id = ${u1}
        JOIN conversation_members m2 ON m2.conversation_id = c.id AND m2.user_id = ${u2}
        WHERE c.type = 'DIRECT'
        LIMIT 1;
      `.execute(database);

      let convId: string;
      if (existingConv.rows?.[0]?.id) {
        convId = existingConv.rows[0].id;
      } else {
        convId = generateCommId("conv_dm");
        await sql`
          INSERT INTO conversations (id, type, status, privacy, created_at, updated_at)
          VALUES (${convId}, 'DIRECT', 'ACTIVE', 'PRIVATE', now(), now());
        `.execute(database);

        await sql`
          INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
          VALUES 
            (${generateCommId("mbr")}, ${convId}, ${u1}, 'MEMBER', now()),
            (${generateCommId("mbr")}, ${convId}, ${u2}, 'MEMBER', now())
          ON CONFLICT DO NOTHING;
        `.execute(database);
      }

      // Migrate messages for this pair if not already in communication_messages
      const unmigratedMsgs: any = await sql`
        SELECT dm.* 
        FROM direct_messages dm
        WHERE ((dm.sender_id = ${u1} AND dm.receiver_id = ${u2}) OR (dm.sender_id = ${u2} AND dm.receiver_id = ${u1}))
          AND NOT EXISTS (
            SELECT 1 FROM communication_messages cm WHERE cm.id = dm.id
          )
        ORDER BY dm.created_at ASC;
      `.execute(database);

      let seq = 1;
      for (const m of unmigratedMsgs.rows || []) {
        await sql`
          INSERT INTO communication_messages (
            id, conversation_id, sender_id, sequence_number, type, content, media_urls, status, created_at, updated_at
          ) VALUES (
            ${m.id}, ${convId}, ${m.sender_id}, ${seq++}, 'TEXT', ${m.content}, ${m.media_urls || null},
            ${m.is_read ? 'READ' : 'DELIVERED'}, ${m.created_at}, ${m.created_at}
          )
          ON CONFLICT (id) DO NOTHING;
        `.execute(database);

        // Update conversation last message
        await sql`
          UPDATE conversations
          SET 
            last_message_content = ${m.content},
            last_message_at = ${m.created_at},
            last_sender_id = ${m.sender_id}
          WHERE id = ${convId};
        `.execute(database);
      }
    }
  } catch (err) {
    console.warn("migrateLegacyDirectMessages notice:", err);
  }
}
