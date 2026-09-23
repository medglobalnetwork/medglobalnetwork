// ============================================================
// MGN Networking System — Kysely Database Schema
// modules/network/lib/network-db.ts
//
// Typed database interface for all networking tables.
// Reuses the same database instance from lib/auth.ts.
// ============================================================

import { database } from "@/lib/auth";
import { Kysely } from "kysely";

// ─────────────────────────────────────────────
// TABLE INTERFACES
// ─────────────────────────────────────────────

export interface ProfessionalProfileTable {
  id: string;
  user_id: string;
  username: string | null;
  member_id: string | null;
  is_founding_member: boolean;
  membership_tier: string | null;
  profession: string | null;
  specialization: string | null;
  sub_specialization: string | null;
  designation: string | null;
  primary_degree: string | null;
  additional_degrees: string[] | null;
  medical_council: string | null;
  registration_number: string | null;
  organization: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  experience_years: number | null;
  bio: string | null;
  skills: string[] | null;
  languages: string[] | null;
  identity_verified: boolean;
  education_verified: boolean;
  registration_verified: boolean;
  experience_verified: boolean;
  profile_visibility: string | null;
  cover_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ConnectionRequestTable {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface ConnectionTable {
  id: string;
  user_a_id: string;
  user_b_id: string;
  connected_at: Date;
}

export interface FollowTable {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: Date;
}

export interface NetworkPostTable {
  id: string;
  author_id: string;
  post_type: string;
  content: string;
  media_urls: string[] | null;
  poll_options: unknown | null;
  poll_ends_at: Date | null;
  community_id: string | null;
  visibility: string;
  reaction_count: number;
  comment_count: number;
  share_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface PostReactionTable {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: Date;
}

export interface PostCommentTable {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommunityTable {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  specialty: string | null;
  cover_url: string | null;
  icon_url: string | null;
  visibility: string;
  join_mode: string;
  created_by: string | null;
  member_count: number;
  post_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CommunityMemberTable {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  joined_at: Date;
}

export interface NetworkNotificationTable {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: Date;
}

// ─────────────────────────────────────────────
// DATABASE SCHEMA
// ─────────────────────────────────────────────

export interface NetworkDatabase {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  professional_profiles: ProfessionalProfileTable;
  connection_requests: ConnectionRequestTable;
  connections: ConnectionTable;
  follows: FollowTable;
  network_posts: NetworkPostTable;
  post_reactions: PostReactionTable;
  post_comments: PostCommentTable;
  communities: CommunityTable;
  community_members: CommunityMemberTable;
  network_notifications: NetworkNotificationTable;
  mgn_identities: any;
}

// ─────────────────────────────────────────────
// TYPED DB INSTANCE
// Reuses the same Kysely connection from Better Auth
// ─────────────────────────────────────────────

export const networkDb = database as unknown as Kysely<NetworkDatabase>;

// ─────────────────────────────────────────────
// HELPER: Generate a UUID-like ID on the server
// ─────────────────────────────────────────────
export function generateId(): string {
  // crypto.randomUUID() is available in Node 14.17+ and all modern browsers
  return crypto.randomUUID();
}

// ─────────────────────────────────────────────
// HELPER: Notify a user
// ─────────────────────────────────────────────
export async function createNotification({
  userId,
  actorId,
  type,
  entityType,
  entityId,
  message,
}: {
  userId: string;
  actorId?: string;
  type: string;
  entityType?: string;
  entityId?: string;
  message?: string;
}): Promise<void> {
  try {
    await networkDb
      .insertInto("network_notifications")
      .values({
        id: generateId(),
        user_id: userId,
        actor_id: actorId ?? null,
        type,
        entity_type: entityType ?? null,
        entity_id: entityId ?? null,
        message: message ?? null,
        is_read: false,
        created_at: new Date(),
      })
      .execute();
  } catch (err) {
    // Non-blocking: log but don't fail the main operation
    console.error("Failed to create notification:", err);
  }
}

// ─────────────────────────────────────────────
// HELPER: Slugify Username
// ─────────────────────────────────────────────
export function slugifyUsername(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─────────────────────────────────────────────
// SELF-HEALING: Ensure Professional Profiles Table & Username Column
// ─────────────────────────────────────────────
let networkingTablesInitialized = false;

export async function ensureNetworkingTables(): Promise<void> {
  if (networkingTablesInitialized) return;

  try {
    const { sql } = await import("kysely");

    await sql`
      CREATE TABLE IF NOT EXISTS professional_profiles (
        id                        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id                   TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
        username                  TEXT,
        profession                TEXT,
        specialization            TEXT,
        sub_specialization        TEXT,
        designation               TEXT,
        primary_degree            TEXT,
        additional_degrees        TEXT[],
        medical_council           TEXT,
        registration_number       TEXT,
        organization              TEXT,
        city                      TEXT,
        state                     TEXT,
        country                   TEXT DEFAULT 'India',
        experience_years          INTEGER DEFAULT 0,
        bio                       TEXT,
        skills                    TEXT[],
        languages                 TEXT[],
        identity_verified         BOOLEAN DEFAULT false,
        education_verified        BOOLEAN DEFAULT false,
        registration_verified     BOOLEAN DEFAULT false,
        experience_verified       BOOLEAN DEFAULT false,
        profile_visibility        TEXT DEFAULT 'public',
        cover_image_url           TEXT,
        member_id                 TEXT,
        is_founding_member        BOOLEAN DEFAULT false,
        membership_tier           TEXT DEFAULT 'MEMBER',
        created_at                TIMESTAMPTZ DEFAULT now(),
        updated_at                TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    await sql`
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS username TEXT;
    `.execute(networkDb);

    await sql`
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS member_id TEXT;
    `.execute(networkDb);

    await sql`
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN DEFAULT false;
    `.execute(networkDb);

    await sql`
      ALTER TABLE professional_profiles ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'MEMBER';
    `.execute(networkDb);

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_profiles_username ON professional_profiles(username);
    `.execute(networkDb);

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_profiles_member_id ON professional_profiles(member_id);
    `.execute(networkDb);

    // Auto-backfill founder ID for patreshubham141@gmail.com if not already assigned
    await sql`
      UPDATE professional_profiles pp
      SET member_id = 'MGN-FOUNDER-001',
          is_founding_member = true,
          membership_tier = 'FOUNDING_MEMBER'
      FROM "user" u
      WHERE pp.user_id = u.id
        AND LOWER(u.email) = 'patreshubham141@gmail.com'
        AND (pp.member_id IS NULL OR pp.member_id = '' OR pp.is_founding_member = false);
    `.execute(networkDb);

    // Backfill any remaining profiles missing a member_id
    const unassigned: any = await sql`
      SELECT pp.id, pp.user_id, pp.is_founding_member, u.email
      FROM professional_profiles pp
      LEFT JOIN "user" u ON u.id = pp.user_id
      WHERE pp.member_id IS NULL OR pp.member_id = ''
      LIMIT 200;
    `.execute(networkDb);

    if (unassigned?.rows && unassigned.rows.length > 0) {
      const { generateRegularMemberId, generateFoundingMemberId, isDesignatedFounderEmail } = await import("./member-id");
      for (const row of unassigned.rows) {
        const isFounder = isDesignatedFounderEmail(row.email) || Boolean(row.is_founding_member);
        const newMemberId = isFounder ? generateFoundingMemberId(1) : generateRegularMemberId();
        await sql`
          UPDATE professional_profiles
          SET member_id = ${newMemberId},
              is_founding_member = ${isFounder},
              membership_tier = ${isFounder ? "FOUNDING_MEMBER" : "MEMBER"}
          WHERE id = ${row.id}
        `.execute(networkDb);
      }
    }

    // 1. Connection Requests
    await sql`
      CREATE TABLE IF NOT EXISTS connection_requests (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        sender_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        receiver_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        message         TEXT,
        status          TEXT NOT NULL DEFAULT 'pending',
        created_at      TIMESTAMPTZ DEFAULT now(),
        updated_at      TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 2. Connections
    await sql`
      CREATE TABLE IF NOT EXISTS connections (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_a_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        user_b_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        connected_at    TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 3. Follows
    await sql`
      CREATE TABLE IF NOT EXISTS follows (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        follower_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        following_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 4. Communities
    await sql`
      CREATE TABLE IF NOT EXISTS communities (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        slug            TEXT NOT NULL UNIQUE,
        name            TEXT NOT NULL,
        description     TEXT,
        specialty       TEXT,
        cover_url       TEXT,
        icon_url        TEXT,
        visibility      TEXT DEFAULT 'public',
        join_mode       TEXT DEFAULT 'open',
        created_by      TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        member_count    INTEGER DEFAULT 0,
        post_count      INTEGER DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT now(),
        updated_at      TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 5. Community Members
    await sql`
      CREATE TABLE IF NOT EXISTS community_members (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        community_id    TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        user_id         TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        role            TEXT DEFAULT 'member',
        joined_at       TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 6. Network Posts
    await sql`
      CREATE TABLE IF NOT EXISTS network_posts (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        author_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        post_type       TEXT NOT NULL DEFAULT 'text',
        content         TEXT NOT NULL,
        media_urls      TEXT[],
        poll_options    JSONB,
        poll_ends_at    TIMESTAMPTZ,
        community_id    TEXT,
        visibility      TEXT DEFAULT 'public',
        reaction_count  INTEGER DEFAULT 0,
        comment_count   INTEGER DEFAULT 0,
        share_count     INTEGER DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT now(),
        updated_at      TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 7. Post Reactions
    await sql`
      CREATE TABLE IF NOT EXISTS post_reactions (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        post_id         TEXT NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
        user_id         TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        reaction_type   TEXT NOT NULL DEFAULT 'like',
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 8. Post Comments
    await sql`
      CREATE TABLE IF NOT EXISTS post_comments (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        post_id         TEXT NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
        author_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        parent_id       TEXT REFERENCES post_comments(id) ON DELETE CASCADE,
        content         TEXT NOT NULL,
        created_at      TIMESTAMPTZ DEFAULT now(),
        updated_at      TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 9. Network Notifications
    await sql`
      CREATE TABLE IF NOT EXISTS network_notifications (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id         TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        actor_id        TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        type            TEXT NOT NULL,
        entity_type     TEXT,
        entity_id       TEXT,
        message         TEXT,
        is_read         BOOLEAN DEFAULT false,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    // 10. Direct Messages
    await sql`
      CREATE TABLE IF NOT EXISTS direct_messages (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        sender_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        receiver_id     TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        content         TEXT NOT NULL,
        media_urls      TEXT[],
        is_read         BOOLEAN DEFAULT false,
        created_at      TIMESTAMPTZ DEFAULT now()
      );
    `.execute(networkDb);

    await sql`
      CREATE INDEX IF NOT EXISTS idx_direct_messages_participants 
      ON direct_messages(sender_id, receiver_id);
    `.execute(networkDb);

    networkingTablesInitialized = true;
  } catch (err) {
    console.warn("ensureNetworkingTables warning:", err);
  }
}



