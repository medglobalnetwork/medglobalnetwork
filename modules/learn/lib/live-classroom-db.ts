// ============================================================
// MGN.life Live Classroom Ecosystem — Database Interface & Repository
// modules/learn/lib/live-classroom-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { Kysely, sql } from "kysely";
import { generateId } from "@/modules/network/lib/network-db";

const db = database as any;

// ─────────────────────────────────────────────
// TYPES & TABLE SCHEMAS
// ─────────────────────────────────────────────

export type LiveSessionLifecycle =
  | "draft"
  | "scheduled"
  | "registration_open"
  | "live"
  | "ended"
  | "processing_recording"
  | "recording_ready"
  | "completed"
  | "cancelled";

export type LiveParticipantRole =
  | "host"
  | "co_host"
  | "moderator"
  | "speaker"
  | "attendee";

export type LivePresenceStatus =
  | "online"
  | "joining"
  | "connected"
  | "reconnecting"
  | "away"
  | "left";

export type HandRaiseStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "lowered"
  | "speaking";

export type VoiceDoubtStatus =
  | "pending"
  | "reviewed"
  | "played"
  | "dismissed";

export type PollStatus =
  | "draft"
  | "active"
  | "closed"
  | "archived";

export interface LiveSessionRecord {
  id: string;
  instructor_id: string;
  course_id?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  category: string;
  specialty?: string | null;
  scheduled_at: string;
  duration_minutes: number;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
  meeting_url?: string | null;
  thumbnail?: string | null;
  max_participants?: number | null;
  registered_count: number;
  live_participant_count: number;
  status: LiveSessionLifecycle;
  cancellation_reason?: string | null;
  sfu_room_id?: string | null;
  stream_key?: string | null;
  created_at: string;
  updated_at: string;
  instructor?: {
    id: string;
    name: string;
    image?: string | null;
    profession?: string | null;
    specialization?: string | null;
    organization?: string | null;
  };
  user_registered?: boolean;
  user_role?: LiveParticipantRole;
  settings?: LiveSessionSettingsRecord;
}

export interface LiveSessionSettingsRecord {
  session_id: string;
  enable_chat: boolean;
  enable_reactions: boolean;
  enable_qa: boolean;
  enable_raise_hand: boolean;
  enable_voice_doubts: boolean;
  enable_screen_share: boolean;
  record_session: boolean;
  voice_doubt_permission: "everyone" | "verified_professionals" | "registered_learners";
  chat_permission: "everyone" | "followers" | "registered_learners";
  recording_visibility: "private" | "enrolled_learners" | "public";
  min_attendance_percentage: number;
  slow_mode_seconds: number;
  is_chat_muted: boolean;
  updated_at: string;
}

export interface LiveChatMessageRecord {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_image?: string | null;
  user_role: LiveParticipantRole;
  message: string;
  reply_to_id?: string | null;
  reply_to_text?: string | null;
  is_pinned: boolean;
  is_announcement: boolean;
  is_deleted: boolean;
  created_at: string;
  reactions?: Record<string, number>;
}

export interface LiveHandRaiseRecord {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_image?: string | null;
  raised_at: string;
  status: HandRaiseStatus;
  action_by?: string | null;
  action_at?: string | null;
}

export interface LiveSpeakerRecord {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_image?: string | null;
  role: LiveParticipantRole;
  is_mic_on: boolean;
  is_camera_on: boolean;
  is_screen_sharing: boolean;
  joined_at: string;
  left_at?: string | null;
}

export interface LiveVoiceDoubtRecord {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_image?: string | null;
  audio_url: string;
  duration_seconds: number;
  transcript?: string | null;
  status: VoiceDoubtStatus;
  created_at: string;
}

export interface LiveQuestionRecord {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_image?: string | null;
  question: string;
  upvotes: number;
  has_upvoted?: boolean;
  is_answered: boolean;
  answer_text?: string | null;
  answered_by_name?: string | null;
  answered_at?: string | null;
  is_pinned: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface LivePollRecord {
  id: string;
  session_id: string;
  creator_id: string;
  question: string;
  status: PollStatus;
  total_votes: number;
  options: LivePollOptionRecord[];
  user_voted_option_id?: string | null;
  created_at: string;
  closed_at?: string | null;
}

export interface LivePollOptionRecord {
  id: string;
  poll_id: string;
  option_text: string;
  order_index: number;
  vote_count: number;
  percentage?: number;
}

export interface LivePresenceRecord {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_image?: string | null;
  role: LiveParticipantRole;
  status: LivePresenceStatus;
  last_heartbeat: string;
  client_ip?: string | null;
  user_agent?: string | null;
}

export interface LiveAttendanceRecord {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  user_email?: string | null;
  first_join_at: string;
  last_leave_at?: string | null;
  total_active_seconds: number;
  attendance_percentage: number;
  is_eligible: boolean;
  reconnect_count: number;
  updated_at: string;
}

export interface LiveResourceRecord {
  id: string;
  session_id: string;
  title: string;
  resource_type: "pdf" | "case_study" | "presentation" | "reference" | "link";
  file_url: string;
  resource_id?: string | null;
  file_size_bytes?: number | null;
  download_count: number;
  created_at: string;
}

export interface LiveNoteRecord {
  id: string;
  session_id: string;
  user_id: string;
  timestamp_seconds: number;
  formatted_time: string;
  note_text: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface LiveWhiteboardRecord {
  id: string;
  session_id: string;
  data_json: any;
  current_tool: string;
  slide_index: number;
  updated_by: string;
  updated_at: string;
}

export interface LiveRecordingRecord {
  id: string;
  session_id: string;
  title: string;
  duration_seconds: number;
  stream_url?: string | null;
  hls_url?: string | null;
  thumbnail_url?: string | null;
  transcript_json?: any;
  chapters_json?: any;
  status: "processing" | "ready" | "failed";
  visibility: "private" | "enrolled_learners" | "public";
  created_at: string;
}

// ─────────────────────────────────────────────
// SCHEMA INITIALIZATION
// ─────────────────────────────────────────────

let tablesInitialized = false;

export async function ensureLiveClassroomTables(): Promise<void> {
  if (tablesInitialized) return;
  try {
    // 1. Sessions Table
    await db.schema
      .createTable("learn_live_sessions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("instructor_id", "text", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)")
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("slug", "varchar(255)", (col: any) => col.notNull().unique())
      .addColumn("description", "text")
      .addColumn("category", "varchar(64)", (col: any) => col.notNull())
      .addColumn("specialty", "varchar(64)")
      .addColumn("scheduled_at", "timestamptz", (col: any) => col.notNull())
      .addColumn("duration_minutes", "integer", (col: any) => col.defaultTo(60))
      .addColumn("actual_start_time", "timestamptz")
      .addColumn("actual_end_time", "timestamptz")
      .addColumn("meeting_url", "text")
      .addColumn("thumbnail", "text")
      .addColumn("max_participants", "integer")
      .addColumn("registered_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("live_participant_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("scheduled"))
      .addColumn("cancellation_reason", "text")
      .addColumn("sfu_room_id", "varchar(64)")
      .addColumn("stream_key", "varchar(128)")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 2. Settings Table
    await db.schema
      .createTable("live_session_settings")
      .ifNotExists()
      .addColumn("session_id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("enable_chat", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("enable_reactions", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("enable_qa", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("enable_raise_hand", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("enable_voice_doubts", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("enable_screen_share", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("record_session", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("voice_doubt_permission", "varchar(32)", (col: any) => col.defaultTo("everyone"))
      .addColumn("chat_permission", "varchar(32)", (col: any) => col.defaultTo("everyone"))
      .addColumn("recording_visibility", "varchar(32)", (col: any) => col.defaultTo("enrolled_learners"))
      .addColumn("min_attendance_percentage", "integer", (col: any) => col.defaultTo(75))
      .addColumn("slow_mode_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("is_chat_muted", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 3. Registrations / Participants
    await db.schema
      .createTable("learn_live_registrations")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("role", "varchar(32)", (col: any) => col.defaultTo("attendee"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 4. Chat Messages
    await db.schema
      .createTable("live_chat_messages")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("user_name", "varchar(128)", (col: any) => col.notNull())
      .addColumn("user_image", "text")
      .addColumn("user_role", "varchar(32)", (col: any) => col.defaultTo("attendee"))
      .addColumn("message", "text", (col: any) => col.notNull())
      .addColumn("reply_to_id", "varchar(64)")
      .addColumn("reply_to_text", "text")
      .addColumn("is_pinned", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("is_announcement", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("is_deleted", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 5. Chat Reactions
    await db.schema
      .createTable("live_chat_reactions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("message_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("emoji", "varchar(16)", (col: any) => col.notNull())
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 6. Ephemeral Floating Reactions
    await db.schema
      .createTable("live_reaction_events")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("emoji", "varchar(16)", (col: any) => col.notNull())
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 7. Raised Hands
    await db.schema
      .createTable("live_hand_raises")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("user_name", "varchar(128)", (col: any) => col.notNull())
      .addColumn("user_image", "text")
      .addColumn("raised_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("pending"))
      .addColumn("action_by", "text")
      .addColumn("action_at", "timestamptz")
      .execute();

    // 8. Stage Speakers
    await db.schema
      .createTable("live_speakers")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("user_name", "varchar(128)", (col: any) => col.notNull())
      .addColumn("user_image", "text")
      .addColumn("role", "varchar(32)", (col: any) => col.defaultTo("speaker"))
      .addColumn("is_mic_on", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("is_camera_on", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("is_screen_sharing", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("joined_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("left_at", "timestamptz")
      .execute();

    // 9. Voice Doubts
    await db.schema
      .createTable("live_voice_doubts")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("user_name", "varchar(128)", (col: any) => col.notNull())
      .addColumn("user_image", "text")
      .addColumn("audio_url", "text", (col: any) => col.notNull())
      .addColumn("duration_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("transcript", "text")
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("pending"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 10. Q&A Questions
    await db.schema
      .createTable("live_questions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("user_name", "varchar(128)", (col: any) => col.notNull())
      .addColumn("user_image", "text")
      .addColumn("question", "text", (col: any) => col.notNull())
      .addColumn("upvotes", "integer", (col: any) => col.defaultTo(0))
      .addColumn("is_answered", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("answer_text", "text")
      .addColumn("answered_by_name", "varchar(128)")
      .addColumn("answered_at", "timestamptz")
      .addColumn("is_pinned", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("is_dismissed", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 11. Q&A Votes
    await db.schema
      .createTable("live_question_votes")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("question_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 12. Polls
    await db.schema
      .createTable("live_polls")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("creator_id", "text", (col: any) => col.notNull())
      .addColumn("question", "text", (col: any) => col.notNull())
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("draft"))
      .addColumn("total_votes", "integer", (col: any) => col.defaultTo(0))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("closed_at", "timestamptz")
      .execute();

    // 13. Poll Options
    await db.schema
      .createTable("live_poll_options")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("poll_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("option_text", "varchar(255)", (col: any) => col.notNull())
      .addColumn("order_index", "integer", (col: any) => col.defaultTo(0))
      .addColumn("vote_count", "integer", (col: any) => col.defaultTo(0))
      .execute();

    // 14. Poll Votes
    await db.schema
      .createTable("live_poll_votes")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("poll_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("option_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 15. Presence & Heartbeat
    await db.schema
      .createTable("live_presence")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("user_name", "varchar(128)", (col: any) => col.notNull())
      .addColumn("user_image", "text")
      .addColumn("role", "varchar(32)", (col: any) => col.defaultTo("attendee"))
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("online"))
      .addColumn("last_heartbeat", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("client_ip", "varchar(64)")
      .addColumn("user_agent", "text")
      .execute();

    // 16. Attendance Tracking
    await db.schema
      .createTable("live_attendance")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("user_name", "varchar(128)", (col: any) => col.notNull())
      .addColumn("user_email", "varchar(255)")
      .addColumn("first_join_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("last_leave_at", "timestamptz")
      .addColumn("total_active_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("attendance_percentage", "numeric(5,2)", (col: any) => col.defaultTo(0))
      .addColumn("is_eligible", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("reconnect_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 17. Handouts & Resources
    await db.schema
      .createTable("live_resources")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("resource_type", "varchar(32)", (col: any) => col.defaultTo("pdf"))
      .addColumn("file_url", "text", (col: any) => col.notNull())
      .addColumn("file_size_bytes", "integer")
      .addColumn("download_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 18. Notes
    await db.schema
      .createTable("live_notes")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("timestamp_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("formatted_time", "varchar(32)", (col: any) => col.defaultTo("00:00"))
      .addColumn("note_text", "text", (col: any) => col.notNull())
      .addColumn("tags", "jsonb")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 19. Whiteboard
    await db.schema
      .createTable("live_whiteboard_states")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull().unique())
      .addColumn("data_json", "jsonb", (col: any) => col.notNull())
      .addColumn("current_tool", "varchar(32)", (col: any) => col.defaultTo("pen"))
      .addColumn("slide_index", "integer", (col: any) => col.defaultTo(0))
      .addColumn("updated_by", "text", (col: any) => col.notNull())
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 20. Recordings
    await db.schema
      .createTable("live_recordings")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("duration_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("stream_url", "text")
      .addColumn("hls_url", "text")
      .addColumn("thumbnail_url", "text")
      .addColumn("transcript_json", "jsonb")
      .addColumn("chapters_json", "jsonb")
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("processing"))
      .addColumn("visibility", "varchar(32)", (col: any) => col.defaultTo("enrolled_learners"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 21. Moderation & Reports
    await db.schema
      .createTable("live_moderation_actions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("moderator_id", "text", (col: any) => col.notNull())
      .addColumn("target_user_id", "text", (col: any) => col.notNull())
      .addColumn("action_type", "varchar(32)", (col: any) => col.notNull())
      .addColumn("reason", "text")
      .addColumn("duration_seconds", "integer")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    await db.schema
      .createTable("live_reports")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("reporter_id", "text", (col: any) => col.notNull())
      .addColumn("reported_user_id", "text")
      .addColumn("message_id", "varchar(64)")
      .addColumn("reason", "varchar(64)", (col: any) => col.notNull())
      .addColumn("details", "text")
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("pending"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    tablesInitialized = true;
  } catch (err) {
    console.error("ensureLiveClassroomTables error:", err);
  }
}

// ─────────────────────────────────────────────
// REPOSITORY METHODS
// ─────────────────────────────────────────────

export class LiveClassroomRepository {
  /**
   * Fetch all live sessions with optional user context and status filtering.
   */
  static async getSessions(userId?: string, statusFilter?: string): Promise<LiveSessionRecord[]> {
    await ensureLiveClassroomTables();
    try {
      let query = db
        .selectFrom("learn_live_sessions as s")
        .leftJoin("user as u", "u.id", "s.instructor_id")
        .leftJoin("professional_profiles as p", "p.user_id", "s.instructor_id")
        .select([
          "s.id",
          "s.instructor_id",
          "s.course_id",
          "s.title",
          "s.slug",
          "s.description",
          "s.category",
          "s.specialty",
          "s.scheduled_at",
          "s.duration_minutes",
          "s.actual_start_time",
          "s.actual_end_time",
          "s.meeting_url",
          "s.thumbnail",
          "s.max_participants",
          "s.registered_count",
          "s.live_participant_count",
          "s.status",
          "s.cancellation_reason",
          "s.sfu_room_id",
          "s.created_at",
          "s.updated_at",
          "u.name as instructor_name",
          "u.image as instructor_image",
          "p.profession as instructor_profession",
          "p.specialization as instructor_specialization",
          "p.organization as instructor_organization",
        ])
        .orderBy("s.scheduled_at", "asc");

      if (statusFilter && statusFilter !== "all") {
        query = query.where("s.status", "=", statusFilter);
      }

      const rows = await query.execute();

      // Check registration status if userId provided
      let registeredSessionIds = new Set<string>();
      if (userId && rows.length > 0) {
        const regRows = await db
          .selectFrom("learn_live_registrations")
          .select(["session_id"])
          .where("user_id", "=", userId)
          .execute();
        regRows.forEach((r: any) => registeredSessionIds.add(r.session_id));
      }

      return rows.map((r: any) => ({
        id: r.id,
        instructor_id: r.instructor_id,
        course_id: r.course_id,
        title: r.title,
        slug: r.slug,
        description: r.description,
        category: r.category,
        specialty: r.specialty,
        scheduled_at: r.scheduled_at ? new Date(r.scheduled_at).toISOString() : new Date().toISOString(),
        duration_minutes: Number(r.duration_minutes || 60),
        actual_start_time: r.actual_start_time ? new Date(r.actual_start_time).toISOString() : null,
        actual_end_time: r.actual_end_time ? new Date(r.actual_end_time).toISOString() : null,
        meeting_url: r.meeting_url,
        thumbnail: r.thumbnail,
        max_participants: r.max_participants ? Number(r.max_participants) : null,
        registered_count: Number(r.registered_count || 0),
        live_participant_count: Number(r.live_participant_count || 0),
        status: (r.status || "scheduled") as LiveSessionLifecycle,
        cancellation_reason: r.cancellation_reason,
        sfu_room_id: r.sfu_room_id,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        instructor: {
          id: r.instructor_id,
          name: r.instructor_name || "Faculty Physician",
          image: r.instructor_image || null,
          profession: r.instructor_profession || null,
          specialization: r.instructor_specialization || null,
          organization: r.instructor_organization || null,
        },
        user_registered: registeredSessionIds.has(r.id),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getSessions error:", err);
      return [];
    }
  }

  /**
   * Get single live session by ID with settings & user role.
   */
  static async getSessionById(sessionId: string, userId?: string): Promise<LiveSessionRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const r = await db
        .selectFrom("learn_live_sessions as s")
        .leftJoin("user as u", "u.id", "s.instructor_id")
        .leftJoin("professional_profiles as p", "p.user_id", "s.instructor_id")
        .select([
          "s.id",
          "s.instructor_id",
          "s.course_id",
          "s.title",
          "s.slug",
          "s.description",
          "s.category",
          "s.specialty",
          "s.scheduled_at",
          "s.duration_minutes",
          "s.actual_start_time",
          "s.actual_end_time",
          "s.meeting_url",
          "s.thumbnail",
          "s.max_participants",
          "s.registered_count",
          "s.live_participant_count",
          "s.status",
          "s.cancellation_reason",
          "s.sfu_room_id",
          "s.stream_key",
          "s.created_at",
          "s.updated_at",
          "u.name as instructor_name",
          "u.image as instructor_image",
          "p.profession as instructor_profession",
          "p.specialization as instructor_specialization",
          "p.organization as instructor_organization",
        ])
        .where("s.id", "=", sessionId)
        .executeTakeFirst();

      if (!r) return null;

      // Settings
      const settingsRow = await db
        .selectFrom("live_session_settings")
        .selectAll()
        .where("session_id", "=", sessionId)
        .executeTakeFirst();

      let userRole: LiveParticipantRole = "attendee";
      let userRegistered = false;

      if (userId) {
        if (userId === r.instructor_id) {
          userRole = "host";
          userRegistered = true;
        } else {
          const reg = await db
            .selectFrom("learn_live_registrations")
            .selectAll()
            .where("session_id", "=", sessionId)
            .where("user_id", "=", userId)
            .executeTakeFirst();

          if (reg) {
            userRegistered = true;
            userRole = (reg.role as LiveParticipantRole) || "attendee";
          }
        }
      }

      return {
        id: r.id,
        instructor_id: r.instructor_id,
        course_id: r.course_id,
        title: r.title,
        slug: r.slug,
        description: r.description,
        category: r.category,
        specialty: r.specialty,
        scheduled_at: r.scheduled_at ? new Date(r.scheduled_at).toISOString() : new Date().toISOString(),
        duration_minutes: Number(r.duration_minutes || 60),
        actual_start_time: r.actual_start_time ? new Date(r.actual_start_time).toISOString() : null,
        actual_end_time: r.actual_end_time ? new Date(r.actual_end_time).toISOString() : null,
        meeting_url: r.meeting_url,
        thumbnail: r.thumbnail,
        max_participants: r.max_participants ? Number(r.max_participants) : null,
        registered_count: Number(r.registered_count || 0),
        live_participant_count: Number(r.live_participant_count || 0),
        status: (r.status || "scheduled") as LiveSessionLifecycle,
        cancellation_reason: r.cancellation_reason,
        sfu_room_id: r.sfu_room_id,
        stream_key: r.stream_key,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        instructor: {
          id: r.instructor_id,
          name: r.instructor_name || "Faculty Physician",
          image: r.instructor_image || null,
          profession: r.instructor_profession || null,
          specialization: r.instructor_specialization || null,
          organization: r.instructor_organization || null,
        },
        user_registered: userRegistered,
        user_role: userRole,
        settings: settingsRow
          ? {
              session_id: settingsRow.session_id,
              enable_chat: Boolean(settingsRow.enable_chat),
              enable_reactions: Boolean(settingsRow.enable_reactions),
              enable_qa: Boolean(settingsRow.enable_qa),
              enable_raise_hand: Boolean(settingsRow.enable_raise_hand),
              enable_voice_doubts: Boolean(settingsRow.enable_voice_doubts),
              enable_screen_share: Boolean(settingsRow.enable_screen_share),
              record_session: Boolean(settingsRow.record_session),
              voice_doubt_permission: settingsRow.voice_doubt_permission || "everyone",
              chat_permission: settingsRow.chat_permission || "everyone",
              recording_visibility: settingsRow.recording_visibility || "enrolled_learners",
              min_attendance_percentage: Number(settingsRow.min_attendance_percentage || 75),
              slow_mode_seconds: Number(settingsRow.slow_mode_seconds || 0),
              is_chat_muted: Boolean(settingsRow.is_chat_muted),
              updated_at: settingsRow.updated_at ? new Date(settingsRow.updated_at).toISOString() : new Date().toISOString(),
            }
          : undefined,
      };
    } catch (err) {
      console.error("LiveClassroomRepository.getSessionById error:", err);
      return null;
    }
  }

  /**
   * Create a new live session with default classroom settings.
   */
  static async createSession(data: {
    instructor_id: string;
    title: string;
    description?: string;
    category: string;
    specialty?: string;
    scheduled_at: string;
    duration_minutes?: number;
    thumbnail?: string;
    course_id?: string;
    settings?: Partial<LiveSessionSettingsRecord>;
  }): Promise<string> {
    await ensureLiveClassroomTables();
    const id = generateId();
    const slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random().toString(36).substring(2, 7)}`;
    const sfuRoomId = `mgn-room-${id}`;
    const streamKey = `sk_live_${Math.random().toString(36).substring(2, 15)}`;
    const now = new Date();

    await db
      .insertInto("learn_live_sessions")
      .values({
        id,
        instructor_id: data.instructor_id,
        course_id: data.course_id || null,
        title: data.title.trim(),
        slug,
        description: data.description || null,
        category: data.category,
        specialty: data.specialty || null,
        scheduled_at: new Date(data.scheduled_at),
        duration_minutes: data.duration_minutes || 60,
        thumbnail: data.thumbnail || null,
        status: "scheduled",
        sfu_room_id: sfuRoomId,
        stream_key: streamKey,
        registered_count: 0,
        live_participant_count: 0,
        created_at: now,
        updated_at: now,
      })
      .execute();

    // Insert Default Settings
    await db
      .insertInto("live_session_settings")
      .values({
        session_id: id,
        enable_chat: data.settings?.enable_chat !== false,
        enable_reactions: data.settings?.enable_reactions !== false,
        enable_qa: data.settings?.enable_qa !== false,
        enable_raise_hand: data.settings?.enable_raise_hand !== false,
        enable_voice_doubts: data.settings?.enable_voice_doubts !== false,
        enable_screen_share: data.settings?.enable_screen_share !== false,
        record_session: data.settings?.record_session !== false,
        voice_doubt_permission: data.settings?.voice_doubt_permission || "everyone",
        chat_permission: data.settings?.chat_permission || "everyone",
        recording_visibility: data.settings?.recording_visibility || "enrolled_learners",
        min_attendance_percentage: data.settings?.min_attendance_percentage || 75,
        slow_mode_seconds: data.settings?.slow_mode_seconds || 0,
        is_chat_muted: false,
        updated_at: now,
      })
      .execute();

    // Auto-register instructor as host
    await db
      .insertInto("learn_live_registrations")
      .values({
        id: generateId(),
        session_id: id,
        user_id: data.instructor_id,
        role: "host",
        created_at: now,
      })
      .execute();

    return id;
  }

  /**
   * Register user for session.
   */
  static async registerUser(sessionId: string, userId: string, role: LiveParticipantRole = "attendee"): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      const existing = await db
        .selectFrom("learn_live_registrations")
        .select(["id"])
        .where("session_id", "=", sessionId)
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existing) return true;

      await db
        .insertInto("learn_live_registrations")
        .values({
          id: generateId(),
          session_id: sessionId,
          user_id: userId,
          role,
          created_at: new Date(),
        })
        .execute();

      await db
        .updateTable("learn_live_sessions")
        .set({
          registered_count: sql`registered_count + 1`,
          updated_at: new Date(),
        })
        .where("id", "=", sessionId)
        .execute();

      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.registerUser error:", err);
      return false;
    }
  }

  /**
   * Update session lifecycle status (e.g. SCHEDULED -> LIVE -> ENDED).
   */
  static async updateSessionStatus(
    sessionId: string,
    status: LiveSessionLifecycle,
    cancellationReason?: string
  ): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      const updates: any = {
        status,
        updated_at: new Date(),
      };

      if (status === "live") {
        updates.actual_start_time = new Date();
      } else if (status === "ended" || status === "completed") {
        updates.actual_end_time = new Date();
      }

      if (cancellationReason) {
        updates.cancellation_reason = cancellationReason;
      }

      await db
        .updateTable("learn_live_sessions")
        .set(updates)
        .where("id", "=", sessionId)
        .execute();

      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.updateSessionStatus error:", err);
      return false;
    }
  }

  /**
   * Update session settings.
   */
  static async updateSettings(
    sessionId: string,
    settings: Partial<LiveSessionSettingsRecord>
  ): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_session_settings")
        .set({
          ...settings,
          updated_at: new Date(),
        })
        .where("session_id", "=", sessionId)
        .execute();

      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.updateSettings error:", err);
      return false;
    }
  }

  /**
   * Chat Messages with cursor pagination.
   */
  static async getChatMessages(sessionId: string, limit = 50, before?: string): Promise<LiveChatMessageRecord[]> {
    await ensureLiveClassroomTables();
    try {
      let query = db
        .selectFrom("live_chat_messages")
        .selectAll()
        .where("session_id", "=", sessionId)
        .where("is_deleted", "=", false)
        .orderBy("created_at", "asc")
        .limit(limit);

      if (before) {
        query = query.where("created_at", "<", new Date(before));
      }

      const rows = await query.execute();
      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_image: r.user_image,
        user_role: (r.user_role || "attendee") as LiveParticipantRole,
        message: r.message,
        reply_to_id: r.reply_to_id,
        reply_to_text: r.reply_to_text,
        is_pinned: Boolean(r.is_pinned),
        is_announcement: Boolean(r.is_announcement),
        is_deleted: Boolean(r.is_deleted),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getChatMessages error:", err);
      return [];
    }
  }

  static async sendChatMessage(data: {
    session_id: string;
    user_id: string;
    user_name: string;
    user_image?: string | null;
    user_role?: LiveParticipantRole;
    message: string;
    reply_to_id?: string | null;
    reply_to_text?: string | null;
    is_pinned?: boolean;
    is_announcement?: boolean;
  }): Promise<LiveChatMessageRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const id = generateId();
      const now = new Date();

      await db
        .insertInto("live_chat_messages")
        .values({
          id,
          session_id: data.session_id,
          user_id: data.user_id,
          user_name: data.user_name,
          user_image: data.user_image || null,
          user_role: data.user_role || "attendee",
          message: data.message.trim(),
          reply_to_id: data.reply_to_id || null,
          reply_to_text: data.reply_to_text || null,
          is_pinned: data.is_pinned || false,
          is_announcement: data.is_announcement || false,
          is_deleted: false,
          created_at: now,
        })
        .execute();

      return {
        id,
        session_id: data.session_id,
        user_id: data.user_id,
        user_name: data.user_name,
        user_image: data.user_image,
        user_role: data.user_role || "attendee",
        message: data.message.trim(),
        reply_to_id: data.reply_to_id,
        reply_to_text: data.reply_to_text,
        is_pinned: Boolean(data.is_pinned),
        is_announcement: Boolean(data.is_announcement),
        is_deleted: false,
        created_at: now.toISOString(),
      };
    } catch (err) {
      console.error("LiveClassroomRepository.sendChatMessage error:", err);
      return null;
    }
  }

  static async deleteChatMessage(messageId: string, sessionId: string): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_chat_messages")
        .set({ is_deleted: true })
        .where("id", "=", messageId)
        .where("session_id", "=", sessionId)
        .execute();
      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.deleteChatMessage error:", err);
      return false;
    }
  }

  /**
   * Ephemeral Reactions
   */
  static async recordReaction(sessionId: string, userId: string, emoji: string): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .insertInto("live_reaction_events")
        .values({
          id: generateId(),
          session_id: sessionId,
          user_id: userId,
          emoji,
          created_at: new Date(),
        })
        .execute();
      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.recordReaction error:", err);
      return false;
    }
  }

  static async getRecentReactions(sessionId: string, secondsAgo = 10): Promise<{ emoji: string; count: number }[]> {
    await ensureLiveClassroomTables();
    try {
      const since = new Date(Date.now() - secondsAgo * 1000);
      const rows = await db
        .selectFrom("live_reaction_events")
        .select(["emoji", sql`count(*)`.as("count")])
        .where("session_id", "=", sessionId)
        .where("created_at", ">=", since)
        .groupBy("emoji")
        .execute();

      return rows.map((r: any) => ({
        emoji: r.emoji,
        count: Number(r.count || 0),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getRecentReactions error:", err);
      return [];
    }
  }

  /**
   * Hand Raises & Stage Speakers
   */
  static async raiseHand(sessionId: string, userId: string, userName: string, userImage?: string | null): Promise<LiveHandRaiseRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const existing = await db
        .selectFrom("live_hand_raises")
        .selectAll()
        .where("session_id", "=", sessionId)
        .where("user_id", "=", userId)
        .where("status", "in", ["pending", "approved", "speaking"])
        .executeTakeFirst();

      if (existing) {
        return {
          id: existing.id,
          session_id: existing.session_id,
          user_id: existing.user_id,
          user_name: existing.user_name,
          user_image: existing.user_image,
          raised_at: new Date(existing.raised_at).toISOString(),
          status: existing.status,
          action_by: existing.action_by,
          action_at: existing.action_at ? new Date(existing.action_at).toISOString() : null,
        };
      }

      const id = generateId();
      const now = new Date();

      await db
        .insertInto("live_hand_raises")
        .values({
          id,
          session_id: sessionId,
          user_id: userId,
          user_name: userName,
          user_image: userImage || null,
          raised_at: now,
          status: "pending",
        })
        .execute();

      return {
        id,
        session_id: sessionId,
        user_id: userId,
        user_name: userName,
        user_image: userImage,
        raised_at: now.toISOString(),
        status: "pending",
      };
    } catch (err) {
      console.error("LiveClassroomRepository.raiseHand error:", err);
      return null;
    }
  }

  static async lowerHand(sessionId: string, userId: string): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_hand_raises")
        .set({ status: "lowered", action_at: new Date() })
        .where("session_id", "=", sessionId)
        .where("user_id", "=", userId)
        .where("status", "in", ["pending", "approved", "speaking"])
        .execute();
      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.lowerHand error:", err);
      return false;
    }
  }

  static async updateHandRaiseStatus(
    handRaiseId: string,
    sessionId: string,
    status: HandRaiseStatus,
    actionBy: string
  ): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_hand_raises")
        .set({
          status,
          action_by: actionBy,
          action_at: new Date(),
        })
        .where("id", "=", handRaiseId)
        .where("session_id", "=", sessionId)
        .execute();

      // If approved/speaking, add to live_speakers table
      if (status === "approved" || status === "speaking") {
        const hand = await db
          .selectFrom("live_hand_raises")
          .selectAll()
          .where("id", "=", handRaiseId)
          .executeTakeFirst();

        if (hand) {
          const speakerId = generateId();
          await db
            .insertInto("live_speakers")
            .values({
              id: speakerId,
              session_id: sessionId,
              user_id: hand.user_id,
              user_name: hand.user_name,
              user_image: hand.user_image || null,
              role: "speaker",
              is_mic_on: true,
              is_camera_on: false,
              is_screen_sharing: false,
              joined_at: new Date(),
            })
            .execute();
        }
      } else if (status === "rejected" || status === "lowered") {
        // Remove from stage speakers if present
        const hand = await db
          .selectFrom("live_hand_raises")
          .selectAll()
          .where("id", "=", handRaiseId)
          .executeTakeFirst();

        if (hand) {
          await db
            .updateTable("live_speakers")
            .set({ left_at: new Date() })
            .where("session_id", "=", sessionId)
            .where("user_id", "=", hand.user_id)
            .where("left_at", "is", null)
            .execute();
        }
      }

      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.updateHandRaiseStatus error:", err);
      return false;
    }
  }

  static async getHandRaises(sessionId: string): Promise<LiveHandRaiseRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const rows = await db
        .selectFrom("live_hand_raises")
        .selectAll()
        .where("session_id", "=", sessionId)
        .where("status", "in", ["pending", "approved", "speaking"])
        .orderBy("raised_at", "asc")
        .execute();

      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_image: r.user_image,
        raised_at: r.raised_at ? new Date(r.raised_at).toISOString() : new Date().toISOString(),
        status: r.status as HandRaiseStatus,
        action_by: r.action_by,
        action_at: r.action_at ? new Date(r.action_at).toISOString() : null,
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getHandRaises error:", err);
      return [];
    }
  }

  static async getStageSpeakers(sessionId: string): Promise<LiveSpeakerRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const rows = await db
        .selectFrom("live_speakers")
        .selectAll()
        .where("session_id", "=", sessionId)
        .where("left_at", "is", null)
        .orderBy("joined_at", "asc")
        .execute();

      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_image: r.user_image,
        role: (r.role || "speaker") as LiveParticipantRole,
        is_mic_on: Boolean(r.is_mic_on),
        is_camera_on: Boolean(r.is_camera_on),
        is_screen_sharing: Boolean(r.is_screen_sharing),
        joined_at: r.joined_at ? new Date(r.joined_at).toISOString() : new Date().toISOString(),
        left_at: r.left_at ? new Date(r.left_at).toISOString() : null,
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getStageSpeakers error:", err);
      return [];
    }
  }

  static async updateSpeakerMedia(
    sessionId: string,
    userId: string,
    updates: { is_mic_on?: boolean; is_camera_on?: boolean; is_screen_sharing?: boolean }
  ): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_speakers")
        .set(updates)
        .where("session_id", "=", sessionId)
        .where("user_id", "=", userId)
        .where("left_at", "is", null)
        .execute();
      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.updateSpeakerMedia error:", err);
      return false;
    }
  }

  static async removeSpeaker(sessionId: string, userId: string): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_speakers")
        .set({ left_at: new Date() })
        .where("session_id", "=", sessionId)
        .where("user_id", "=", userId)
        .where("left_at", "is", null)
        .execute();

      await db
        .updateTable("live_hand_raises")
        .set({ status: "lowered", action_at: new Date() })
        .where("session_id", "=", sessionId)
        .where("user_id", "=", userId)
        .where("status", "in", ["approved", "speaking"])
        .execute();

      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.removeSpeaker error:", err);
      return false;
    }
  }

  /**
   * Voice Doubts
   */
  static async submitVoiceDoubt(data: {
    session_id: string;
    user_id: string;
    user_name: string;
    user_image?: string | null;
    audio_url: string;
    duration_seconds: number;
    transcript?: string;
  }): Promise<LiveVoiceDoubtRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const id = generateId();
      const now = new Date();

      await db
        .insertInto("live_voice_doubts")
        .values({
          id,
          session_id: data.session_id,
          user_id: data.user_id,
          user_name: data.user_name,
          user_image: data.user_image || null,
          audio_url: data.audio_url,
          duration_seconds: data.duration_seconds,
          transcript: data.transcript || null,
          status: "pending",
          created_at: now,
        })
        .execute();

      return {
        id,
        session_id: data.session_id,
        user_id: data.user_id,
        user_name: data.user_name,
        user_image: data.user_image,
        audio_url: data.audio_url,
        duration_seconds: data.duration_seconds,
        transcript: data.transcript,
        status: "pending",
        created_at: now.toISOString(),
      };
    } catch (err) {
      console.error("LiveClassroomRepository.submitVoiceDoubt error:", err);
      return null;
    }
  }

  static async getVoiceDoubts(sessionId: string): Promise<LiveVoiceDoubtRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const rows = await db
        .selectFrom("live_voice_doubts")
        .selectAll()
        .where("session_id", "=", sessionId)
        .orderBy("created_at", "desc")
        .execute();

      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_image: r.user_image,
        audio_url: r.audio_url,
        duration_seconds: Number(r.duration_seconds || 0),
        transcript: r.transcript,
        status: r.status as VoiceDoubtStatus,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getVoiceDoubts error:", err);
      return [];
    }
  }

  static async updateVoiceDoubtStatus(
    doubtId: string,
    sessionId: string,
    status: VoiceDoubtStatus
  ): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_voice_doubts")
        .set({ status })
        .where("id", "=", doubtId)
        .where("session_id", "=", sessionId)
        .execute();
      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.updateVoiceDoubtStatus error:", err);
      return false;
    }
  }

  /**
   * Q&A Questions
   */
  static async createQuestion(data: {
    session_id: string;
    user_id: string;
    user_name: string;
    user_image?: string | null;
    question: string;
  }): Promise<LiveQuestionRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const id = generateId();
      const now = new Date();

      await db
        .insertInto("live_questions")
        .values({
          id,
          session_id: data.session_id,
          user_id: data.user_id,
          user_name: data.user_name,
          user_image: data.user_image || null,
          question: data.question.trim(),
          upvotes: 1,
          is_answered: false,
          is_pinned: false,
          is_dismissed: false,
          created_at: now,
        })
        .execute();

      // Automatically vote by creator
      await db
        .insertInto("live_question_votes")
        .values({
          id: generateId(),
          question_id: id,
          user_id: data.user_id,
          created_at: now,
        })
        .execute();

      return {
        id,
        session_id: data.session_id,
        user_id: data.user_id,
        user_name: data.user_name,
        user_image: data.user_image,
        question: data.question.trim(),
        upvotes: 1,
        has_upvoted: true,
        is_answered: false,
        is_pinned: false,
        is_dismissed: false,
        created_at: now.toISOString(),
      };
    } catch (err) {
      console.error("LiveClassroomRepository.createQuestion error:", err);
      return null;
    }
  }

  static async getQuestions(sessionId: string, userId?: string): Promise<LiveQuestionRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const rows = await db
        .selectFrom("live_questions")
        .selectAll()
        .where("session_id", "=", sessionId)
        .where("is_dismissed", "=", false)
        .orderBy("is_pinned", "desc")
        .orderBy("upvotes", "desc")
        .orderBy("created_at", "asc")
        .execute();

      let votedQuestionIds = new Set<string>();
      if (userId && rows.length > 0) {
        const votes = await db
          .selectFrom("live_question_votes")
          .select(["question_id"])
          .where("user_id", "=", userId)
          .execute();
        votes.forEach((v: any) => votedQuestionIds.add(v.question_id));
      }

      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_image: r.user_image,
        question: r.question,
        upvotes: Number(r.upvotes || 0),
        has_upvoted: votedQuestionIds.has(r.id),
        is_answered: Boolean(r.is_answered),
        answer_text: r.answer_text,
        answered_by_name: r.answered_by_name,
        answered_at: r.answered_at ? new Date(r.answered_at).toISOString() : null,
        is_pinned: Boolean(r.is_pinned),
        is_dismissed: Boolean(r.is_dismissed),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getQuestions error:", err);
      return [];
    }
  }

  static async voteQuestion(questionId: string, userId: string): Promise<{ upvotes: number; has_upvoted: boolean }> {
    await ensureLiveClassroomTables();
    try {
      const existing = await db
        .selectFrom("live_question_votes")
        .selectAll()
        .where("question_id", "=", questionId)
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existing) {
        await db
          .deleteFrom("live_question_votes")
          .where("id", "=", existing.id)
          .execute();

        await db
          .updateTable("live_questions")
          .set({ upvotes: sql`GREATEST(0, upvotes - 1)` })
          .where("id", "=", questionId)
          .execute();

        const q = await db
          .selectFrom("live_questions")
          .select(["upvotes"])
          .where("id", "=", questionId)
          .executeTakeFirst();

        return { upvotes: Number(q?.upvotes || 0), has_upvoted: false };
      } else {
        await db
          .insertInto("live_question_votes")
          .values({
            id: generateId(),
            question_id: questionId,
            user_id: userId,
            created_at: new Date(),
          })
          .execute();

        await db
          .updateTable("live_questions")
          .set({ upvotes: sql`upvotes + 1` })
          .where("id", "=", questionId)
          .execute();

        const q = await db
          .selectFrom("live_questions")
          .select(["upvotes"])
          .where("id", "=", questionId)
          .executeTakeFirst();

        return { upvotes: Number(q?.upvotes || 1), has_upvoted: true };
      }
    } catch (err) {
      console.error("LiveClassroomRepository.voteQuestion error:", err);
      return { upvotes: 0, has_upvoted: false };
    }
  }

  static async answerQuestion(
    questionId: string,
    sessionId: string,
    answerText: string,
    answeredByName: string
  ): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_questions")
        .set({
          is_answered: true,
          answer_text: answerText,
          answered_by_name: answeredByName,
          answered_at: new Date(),
        })
        .where("id", "=", questionId)
        .where("session_id", "=", sessionId)
        .execute();
      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.answerQuestion error:", err);
      return false;
    }
  }

  /**
   * Polls
   */
  static async createPoll(data: {
    session_id: string;
    creator_id: string;
    question: string;
    options: string[];
  }): Promise<LivePollRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const pollId = generateId();
      const now = new Date();

      await db
        .insertInto("live_polls")
        .values({
          id: pollId,
          session_id: data.session_id,
          creator_id: data.creator_id,
          question: data.question.trim(),
          status: "active",
          total_votes: 0,
          created_at: now,
        })
        .execute();

      const optionsRecords: LivePollOptionRecord[] = [];
      for (let i = 0; i < data.options.length; i++) {
        const optionId = generateId();
        await db
          .insertInto("live_poll_options")
          .values({
            id: optionId,
            poll_id: pollId,
            option_text: data.options[i].trim(),
            order_index: i,
            vote_count: 0,
          })
          .execute();

        optionsRecords.push({
          id: optionId,
          poll_id: pollId,
          option_text: data.options[i].trim(),
          order_index: i,
          vote_count: 0,
          percentage: 0,
        });
      }

      return {
        id: pollId,
        session_id: data.session_id,
        creator_id: data.creator_id,
        question: data.question.trim(),
        status: "active",
        total_votes: 0,
        options: optionsRecords,
        created_at: now.toISOString(),
      };
    } catch (err) {
      console.error("LiveClassroomRepository.createPoll error:", err);
      return null;
    }
  }

  static async getPolls(sessionId: string, userId?: string): Promise<LivePollRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const pollRows = await db
        .selectFrom("live_polls")
        .selectAll()
        .where("session_id", "=", sessionId)
        .orderBy("created_at", "desc")
        .execute();

      if (pollRows.length === 0) return [];

      const pollIds = pollRows.map((p: any) => p.id);
      const optionRows = await db
        .selectFrom("live_poll_options")
        .selectAll()
        .where("poll_id", "in", pollIds)
        .orderBy("order_index", "asc")
        .execute();

      let userVotesMap: Record<string, string> = {};
      if (userId) {
        const userVotes = await db
          .selectFrom("live_poll_votes")
          .select(["poll_id", "option_id"])
          .where("poll_id", "in", pollIds)
          .where("user_id", "=", userId)
          .execute();

        userVotes.forEach((uv: any) => {
          userVotesMap[uv.poll_id] = uv.option_id;
        });
      }

      return pollRows.map((poll: any) => {
        const options = optionRows
          .filter((opt: any) => opt.poll_id === poll.id)
          .map((opt: any) => {
            const voteCount = Number(opt.vote_count || 0);
            const totalVotes = Number(poll.total_votes || 0);
            const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
            return {
              id: opt.id,
              poll_id: opt.poll_id,
              option_text: opt.option_text,
              order_index: Number(opt.order_index || 0),
              vote_count: voteCount,
              percentage,
            };
          });

        return {
          id: poll.id,
          session_id: poll.session_id,
          creator_id: poll.creator_id,
          question: poll.question,
          status: poll.status as PollStatus,
          total_votes: Number(poll.total_votes || 0),
          options,
          user_voted_option_id: userVotesMap[poll.id] || null,
          created_at: poll.created_at ? new Date(poll.created_at).toISOString() : new Date().toISOString(),
          closed_at: poll.closed_at ? new Date(poll.closed_at).toISOString() : null,
        };
      });
    } catch (err) {
      console.error("LiveClassroomRepository.getPolls error:", err);
      return [];
    }
  }

  static async votePoll(pollId: string, optionId: string, userId: string): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      const existing = await db
        .selectFrom("live_poll_votes")
        .selectAll()
        .where("poll_id", "=", pollId)
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existing) {
        // Change vote
        if (existing.option_id === optionId) return true;

        await db
          .updateTable("live_poll_options")
          .set({ vote_count: sql`GREATEST(0, vote_count - 1)` })
          .where("id", "=", existing.option_id)
          .execute();

        await db
          .updateTable("live_poll_options")
          .set({ vote_count: sql`vote_count + 1` })
          .where("id", "=", optionId)
          .execute();

        await db
          .updateTable("live_poll_votes")
          .set({ option_id: optionId })
          .where("id", "=", existing.id)
          .execute();
      } else {
        await db
          .insertInto("live_poll_votes")
          .values({
            id: generateId(),
            poll_id: pollId,
            option_id: optionId,
            user_id: userId,
            created_at: new Date(),
          })
          .execute();

        await db
          .updateTable("live_poll_options")
          .set({ vote_count: sql`vote_count + 1` })
          .where("id", "=", optionId)
          .execute();

        await db
          .updateTable("live_polls")
          .set({ total_votes: sql`total_votes + 1` })
          .where("id", "=", pollId)
          .execute();
      }

      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.votePoll error:", err);
      return false;
    }
  }

  static async closePoll(pollId: string, sessionId: string): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      await db
        .updateTable("live_polls")
        .set({ status: "closed", closed_at: new Date() })
        .where("id", "=", pollId)
        .where("session_id", "=", sessionId)
        .execute();
      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.closePoll error:", err);
      return false;
    }
  }

  /**
   * Presence & Attendance Tracking
   */
  static async updatePresenceHeartbeat(data: {
    session_id: string;
    user_id: string;
    user_name: string;
    user_image?: string | null;
    role?: LiveParticipantRole;
    client_ip?: string;
    user_agent?: string;
  }): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      const now = new Date();
      const existingPresence = await db
        .selectFrom("live_presence")
        .selectAll()
        .where("session_id", "=", data.session_id)
        .where("user_id", "=", data.user_id)
        .executeTakeFirst();

      if (existingPresence) {
        await db
          .updateTable("live_presence")
          .set({
            status: "connected",
            last_heartbeat: now,
            client_ip: data.client_ip || existingPresence.client_ip,
            user_agent: data.user_agent || existingPresence.user_agent,
          })
          .where("id", "=", existingPresence.id)
          .execute();
      } else {
        await db
          .insertInto("live_presence")
          .values({
            id: generateId(),
            session_id: data.session_id,
            user_id: data.user_id,
            user_name: data.user_name,
            user_image: data.user_image || null,
            role: data.role || "attendee",
            status: "connected",
            last_heartbeat: now,
            client_ip: data.client_ip || null,
            user_agent: data.user_agent || null,
          })
          .execute();
      }

      // Update Attendance Accumulator (every 30s heartbeat adds ~30s active duration)
      const existingAttendance = await db
        .selectFrom("live_attendance")
        .selectAll()
        .where("session_id", "=", data.session_id)
        .where("user_id", "=", data.user_id)
        .executeTakeFirst();

      const session = await db
        .selectFrom("learn_live_sessions")
        .select(["duration_minutes", "actual_start_time"])
        .where("id", "=", data.session_id)
        .executeTakeFirst();

      const totalExpectedSeconds = (session?.duration_minutes || 60) * 60;
      const settings = await db
        .selectFrom("live_session_settings")
        .select(["min_attendance_percentage"])
        .where("session_id", "=", data.session_id)
        .executeTakeFirst();

      const minPercentage = Number(settings?.min_attendance_percentage || 75);

      if (existingAttendance) {
        const newActiveSeconds = Number(existingAttendance.total_active_seconds || 0) + 30;
        const percentage = Math.min(100, Math.round((newActiveSeconds / totalExpectedSeconds) * 100 * 100) / 100);
        const isEligible = percentage >= minPercentage;

        await db
          .updateTable("live_attendance")
          .set({
            total_active_seconds: newActiveSeconds,
            attendance_percentage: percentage,
            is_eligible: isEligible,
            updated_at: now,
          })
          .where("id", "=", existingAttendance.id)
          .execute();
      } else {
        const activeSeconds = 30;
        const percentage = Math.min(100, Math.round((activeSeconds / totalExpectedSeconds) * 100 * 100) / 100);
        const isEligible = percentage >= minPercentage;

        await db
          .insertInto("live_attendance")
          .values({
            id: generateId(),
            session_id: data.session_id,
            user_id: data.user_id,
            user_name: data.user_name,
            first_join_at: now,
            total_active_seconds: activeSeconds,
            attendance_percentage: percentage,
            is_eligible: isEligible,
            reconnect_count: 0,
            updated_at: now,
          })
          .execute();
      }

      // Update Session Active Count
      const activeCount = await db
        .selectFrom("live_presence")
        .select([sql`count(*)`.as("cnt")])
        .where("session_id", "=", data.session_id)
        .where("status", "=", "connected")
        .where("last_heartbeat", ">=", new Date(Date.now() - 60000))
        .executeTakeFirst();

      await db
        .updateTable("learn_live_sessions")
        .set({ live_participant_count: Number(activeCount?.cnt || 1) })
        .where("id", "=", data.session_id)
        .execute();

      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.updatePresenceHeartbeat error:", err);
      return false;
    }
  }

  static async getAttendanceList(sessionId: string): Promise<LiveAttendanceRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const rows = await db
        .selectFrom("live_attendance")
        .selectAll()
        .where("session_id", "=", sessionId)
        .orderBy("attendance_percentage", "desc")
        .execute();

      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_email: r.user_email,
        first_join_at: r.first_join_at ? new Date(r.first_join_at).toISOString() : new Date().toISOString(),
        last_leave_at: r.last_leave_at ? new Date(r.last_leave_at).toISOString() : null,
        total_active_seconds: Number(r.total_active_seconds || 0),
        attendance_percentage: Number(r.attendance_percentage || 0),
        is_eligible: Boolean(r.is_eligible),
        reconnect_count: Number(r.reconnect_count || 0),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getAttendanceList error:", err);
      return [];
    }
  }

  static async getActivePresence(sessionId: string): Promise<LivePresenceRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const activeSince = new Date(Date.now() - 60000);
      const rows = await db
        .selectFrom("live_presence")
        .selectAll()
        .where("session_id", "=", sessionId)
        .where("last_heartbeat", ">=", activeSince)
        .orderBy("role", "asc")
        .orderBy("last_heartbeat", "desc")
        .execute();

      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        user_id: r.user_id,
        user_name: r.user_name,
        user_image: r.user_image,
        role: (r.role || "attendee") as LiveParticipantRole,
        status: (r.status || "online") as LivePresenceStatus,
        last_heartbeat: r.last_heartbeat ? new Date(r.last_heartbeat).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getActivePresence error:", err);
      return [];
    }
  }

  /**
   * Resources / Handouts
   */
  static async addResource(data: {
    session_id: string;
    title: string;
    resource_type: "pdf" | "case_study" | "presentation" | "reference" | "link";
    file_url: string;
    file_size_bytes?: number;
  }): Promise<LiveResourceRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const id = generateId();
      const now = new Date();

      await db
        .insertInto("live_resources")
        .values({
          id,
          session_id: data.session_id,
          title: data.title.trim(),
          resource_type: data.resource_type,
          file_url: data.file_url,
          file_size_bytes: data.file_size_bytes || null,
          download_count: 0,
          created_at: now,
        })
        .execute();

      return {
        id,
        session_id: data.session_id,
        title: data.title.trim(),
        resource_type: data.resource_type,
        file_url: data.file_url,
        file_size_bytes: data.file_size_bytes,
        download_count: 0,
        created_at: now.toISOString(),
      };
    } catch (err) {
      console.error("LiveClassroomRepository.addResource error:", err);
      return null;
    }
  }

  static async getResources(sessionId: string): Promise<LiveResourceRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const rows = await db
        .selectFrom("live_resources")
        .selectAll()
        .where("session_id", "=", sessionId)
        .orderBy("created_at", "asc")
        .execute();

      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        title: r.title,
        resource_type: r.resource_type,
        file_url: r.file_url,
        file_size_bytes: r.file_size_bytes ? Number(r.file_size_bytes) : null,
        download_count: Number(r.download_count || 0),
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getResources error:", err);
      return [];
    }
  }

  /**
   * Notes with timestamps
   */
  static async saveNote(data: {
    session_id: string;
    user_id: string;
    timestamp_seconds: number;
    formatted_time: string;
    note_text: string;
    tags?: string[];
  }): Promise<LiveNoteRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const id = generateId();
      const now = new Date();

      await db
        .insertInto("live_notes")
        .values({
          id,
          session_id: data.session_id,
          user_id: data.user_id,
          timestamp_seconds: data.timestamp_seconds,
          formatted_time: data.formatted_time,
          note_text: data.note_text.trim(),
          tags: data.tags ? JSON.stringify(data.tags) : null,
          created_at: now,
          updated_at: now,
        })
        .execute();

      return {
        id,
        session_id: data.session_id,
        user_id: data.user_id,
        timestamp_seconds: data.timestamp_seconds,
        formatted_time: data.formatted_time,
        note_text: data.note_text.trim(),
        tags: data.tags,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };
    } catch (err) {
      console.error("LiveClassroomRepository.saveNote error:", err);
      return null;
    }
  }

  static async getNotes(sessionId: string, userId: string): Promise<LiveNoteRecord[]> {
    await ensureLiveClassroomTables();
    try {
      const rows = await db
        .selectFrom("live_notes")
        .selectAll()
        .where("session_id", "=", sessionId)
        .where("user_id", "=", userId)
        .orderBy("timestamp_seconds", "asc")
        .execute();

      return rows.map((r: any) => ({
        id: r.id,
        session_id: r.session_id,
        user_id: r.user_id,
        timestamp_seconds: Number(r.timestamp_seconds || 0),
        formatted_time: r.formatted_time || "00:00",
        note_text: r.note_text,
        tags: typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags || [],
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("LiveClassroomRepository.getNotes error:", err);
      return [];
    }
  }

  /**
   * Whiteboard Sync
   */
  static async getWhiteboardState(sessionId: string): Promise<LiveWhiteboardRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const row = await db
        .selectFrom("live_whiteboard_states")
        .selectAll()
        .where("session_id", "=", sessionId)
        .executeTakeFirst();

      if (!row) return null;

      return {
        id: row.id,
        session_id: row.session_id,
        data_json: typeof row.data_json === "string" ? JSON.parse(row.data_json) : row.data_json,
        current_tool: row.current_tool,
        slide_index: Number(row.slide_index || 0),
        updated_by: row.updated_by,
        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      };
    } catch (err) {
      console.error("LiveClassroomRepository.getWhiteboardState error:", err);
      return null;
    }
  }

  static async updateWhiteboardState(data: {
    session_id: string;
    data_json: any;
    current_tool?: string;
    slide_index?: number;
    updated_by: string;
  }): Promise<boolean> {
    await ensureLiveClassroomTables();
    try {
      const now = new Date();
      const existing = await db
        .selectFrom("live_whiteboard_states")
        .select(["id"])
        .where("session_id", "=", data.session_id)
        .executeTakeFirst();

      const jsonData = typeof data.data_json === "string" ? data.data_json : JSON.stringify(data.data_json);

      if (existing) {
        await db
          .updateTable("live_whiteboard_states")
          .set({
            data_json: jsonData,
            current_tool: data.current_tool || "pen",
            slide_index: data.slide_index ?? 0,
            updated_by: data.updated_by,
            updated_at: now,
          })
          .where("id", "=", existing.id)
          .execute();
      } else {
        await db
          .insertInto("live_whiteboard_states")
          .values({
            id: generateId(),
            session_id: data.session_id,
            data_json: jsonData,
            current_tool: data.current_tool || "pen",
            slide_index: data.slide_index ?? 0,
            updated_by: data.updated_by,
            updated_at: now,
          })
          .execute();
      }
      return true;
    } catch (err) {
      console.error("LiveClassroomRepository.updateWhiteboardState error:", err);
      return false;
    }
  }

  /**
   * Recording Management
   */
  static async getRecording(sessionId: string): Promise<LiveRecordingRecord | null> {
    await ensureLiveClassroomTables();
    try {
      const row = await db
        .selectFrom("live_recordings")
        .selectAll()
        .where("session_id", "=", sessionId)
        .executeTakeFirst();

      if (!row) return null;

      return {
        id: row.id,
        session_id: row.session_id,
        title: row.title,
        duration_seconds: Number(row.duration_seconds || 0),
        stream_url: row.stream_url,
        hls_url: row.hls_url,
        thumbnail_url: row.thumbnail_url,
        transcript_json: typeof row.transcript_json === "string" ? JSON.parse(row.transcript_json) : row.transcript_json,
        chapters_json: typeof row.chapters_json === "string" ? JSON.parse(row.chapters_json) : row.chapters_json,
        status: row.status,
        visibility: row.visibility,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      };
    } catch (err) {
      console.error("LiveClassroomRepository.getRecording error:", err);
      return null;
    }
  }
}

// Backward compatibility exports for existing routes
export async function getLiveSessions(userId?: string): Promise<LiveSessionRecord[]> {
  return LiveClassroomRepository.getSessions(userId);
}

export async function registerForLiveSession(userId: string, sessionId: string): Promise<boolean> {
  return LiveClassroomRepository.registerUser(sessionId, userId);
}
