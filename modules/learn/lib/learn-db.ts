// ============================================================
// MGN.life Phase 4: Learn Ecosystem — Database Interface
// modules/learn/lib/learn-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { Kysely, sql } from "kysely";
import {
  Course,
  CourseModule,
  CourseLesson,
  CourseEnrollment,
  Certificate,
  Quiz,
  QuizAttempt,
  CourseFilterParams,
  CreateCourseInput,
  SubmitQuizAnswerInput,
  LearningPath,
  LiveSession,
  LearnNote,
  LearnCollection,
  LearnBookmark,
  InstructorProfile,
  MatchedJobRole,
} from "../types";
import { generateId } from "@/modules/network/lib/network-db";
import { SharedCertificateService } from "@/modules/shared/certificates/certificate-service";
import { LiveClassroomRepository, LiveSessionRecord } from "./live-classroom-db";

// ─────────────────────────────────────────────
// TABLE INTERFACES
// ─────────────────────────────────────────────

export interface CourseTable {
  id: string;
  instructor_id: string;
  organization_id: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  thumbnail: string | null;
  category: string;
  subcategory: string | null;
  profession: string | null;
  specialization: string | null;
  level: string | null;
  language: string | null;
  duration_minutes: number;
  price: number;
  discount_price?: number | null;
  currency: string;
  is_free: boolean;
  certificate_enabled: boolean;
  accreditation?: string | null;
  subscription_tier?: string | null;
  bundle_access?: boolean;
  status: string;
  enrollment_count: number;
  rating_avg: number;
  rating_count: number;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CourseModuleTable {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseLessonTable {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  content: string | null;
  media_url: string | null;
  duration_seconds: number;
  order_index: number;
  is_preview: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CourseResourceTable {
  id: string;
  lesson_id: string | null;
  course_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  created_at: Date;
}

export interface CourseEnrollmentTable {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: Date;
  completed_at: Date | null;
  status: string;
  progress_percentage: number;
  last_lesson_id: string | null;
  last_accessed_at: Date;
}

export interface LessonProgressTable {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  progress_percentage: number;
  last_position_seconds: number;
  completed: boolean;
  completed_at: Date | null;
  updated_at: Date;
}

export interface QuizTable {
  id: string;
  lesson_id: string | null;
  course_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number;
  max_attempts: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuizQuestionTable {
  id: string;
  quiz_id: string;
  question: string;
  question_type: string;
  explanation: string | null;
  order_index: number;
}

export interface QuizOptionTable {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizAttemptTable {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  percentage: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  attempt_number: number;
  submitted_at: Date;
}

export interface CertificateTable {
  id: string;
  certificate_number: string;
  user_id: string;
  course_id: string;
  issued_at: Date;
  completion_date: Date;
  verification_code: string;
  metadata: any | null;
  status: string;
  is_public_profile?: boolean;
}

export interface LearningPathTable {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  profession: string | null;
  level: string;
  duration_hours: number;
  course_count: number;
  enrolled_count: number;
  thumbnail: string | null;
  badge_title: string | null;
  created_at: Date;
}

export interface LiveSessionTable {
  id: string;
  instructor_id: string;
  title: string;
  description: string | null;
  category: string;
  specialty: string | null;
  scheduled_at: Date;
  duration_minutes: number;
  meeting_url: string | null;
  thumbnail: string | null;
  max_participants: number | null;
  registered_count: number;
  status: string;
  created_at: Date;
}

export interface LearnNoteTable {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  note_text: string;
  timestamp_seconds: number | null;
  tags: any | null;
  created_at: Date;
  updated_at: Date;
}

export interface LearnCollectionTable {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface LearnCollectionItemTable {
  id: string;
  collection_id: string;
  course_id: string;
  created_at: Date;
}

export interface LearnBookmarkTable {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string | null;
  created_at: Date;
}

export interface VideoAssetTable {
  id: string;
  instructor_id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  original_filename: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  storage_key: string | null;
  status: string;
  duration_seconds: number;
  aspect_ratio: string;
  width: number;
  height: number;
  is_private: boolean;
  thumbnail_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface VideoVariantTable {
  id: string;
  video_asset_id: string;
  quality: string;
  codec: string | null;
  bitrate: number | null;
  resolution: string | null;
  storage_key: string;
  file_size_bytes: number | null;
  is_ready: boolean;
  created_at: Date;
}

export interface VideoChapterTable {
  id: string;
  video_asset_id: string | null;
  lesson_id: string;
  title: string;
  start_seconds: number;
  end_seconds: number | null;
  order_index: number;
  created_at: Date;
}

export interface VideoTranscriptTable {
  id: string;
  video_asset_id: string | null;
  lesson_id: string;
  language: string;
  cues: any;
  is_auto_generated: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface VideoCaptionTable {
  id: string;
  video_asset_id: string | null;
  lesson_id: string;
  language: string;
  label: string;
  vtt_url: string | null;
  vtt_content: string | null;
  is_default: boolean;
  created_at: Date;
}

export interface VideoDiscussionTable {
  id: string;
  lesson_id: string;
  course_id: string;
  user_id: string;
  parent_id: string | null;
  timestamp_seconds: number | null;
  message: string;
  is_instructor_answer: boolean;
  upvotes: number;
  created_at: Date;
  updated_at: Date;
}

export interface VideoBookmarkTable {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  timestamp_seconds: number;
  title: string | null;
  note: string | null;
  created_at: Date;
}

export interface VideoProgressEventTable {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  event_type: string;
  position_seconds: number;
  buffered_seconds: number | null;
  playback_rate: number;
  session_id: string | null;
  created_at: Date;
}

export interface VideoPlaybackTokenTable {
  id: string;
  user_id: string;
  lesson_id: string;
  token: string;
  expires_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface VideoWatchSessionTable {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  total_watch_time_seconds: number;
  max_position_seconds: number;
  completion_ratio: number;
  created_at: Date;
  updated_at: Date;
}

export interface LearnDatabase {
  courses: CourseTable;
  course_modules: CourseModuleTable;
  course_lessons: CourseLessonTable;
  course_resources: CourseResourceTable;
  course_enrollments: CourseEnrollmentTable;
  lesson_progress: LessonProgressTable;
  quizzes: QuizTable;
  quiz_questions: QuizQuestionTable;
  quiz_options: QuizOptionTable;
  quiz_attempts: QuizAttemptTable;
  certificates: CertificateTable;
  learning_paths: LearningPathTable;
  learning_path_courses: { id: string; path_id: string; course_id: string; order_index: number };
  learn_live_sessions: LiveSessionTable;
  learn_live_registrations: { id: string; session_id: string; user_id: string; created_at: Date };
  learn_notes: LearnNoteTable;
  learn_collections: LearnCollectionTable;
  learn_collection_items: LearnCollectionItemTable;
  learn_bookmarks: LearnBookmarkTable;
  video_assets: VideoAssetTable;
  video_variants: VideoVariantTable;
  video_chapters: VideoChapterTable;
  video_transcripts: VideoTranscriptTable;
  video_captions: VideoCaptionTable;
  video_discussions: VideoDiscussionTable;
  video_bookmarks: VideoBookmarkTable;
  video_progress_events: VideoProgressEventTable;
  video_playback_tokens: VideoPlaybackTokenTable;
  video_watch_sessions: VideoWatchSessionTable;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  professional_profiles: {
    id: string;
    user_id: string;
    profession: string | null;
    specialization: string | null;
    designation: string | null;
    organization: string | null;
    identity_verified: boolean;
    education_verified: boolean;
    registration_verified: boolean;
    member_id?: string | null;
    is_founding_member?: boolean;
  };
}

export const learnDb = database as unknown as Kysely<LearnDatabase>;

// ─────────────────────────────────────────────
// SCHEMA INITIALIZATION HELPER
// ─────────────────────────────────────────────
let extensionsEnsured = false;
export async function ensureLearnExtensions(): Promise<void> {
  if (extensionsEnsured) return;
  try {
    const dbAny = database as any;
    
    // 1. Learning Paths
    await dbAny.schema
      .createTable("learning_paths")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("slug", "varchar(255)", (col: any) => col.notNull().unique())
      .addColumn("description", "text", (col: any) => col.notNull())
      .addColumn("category", "varchar(64)", (col: any) => col.notNull())
      .addColumn("profession", "varchar(64)")
      .addColumn("level", "varchar(32)", (col: any) => col.defaultTo("all_levels"))
      .addColumn("duration_hours", "integer", (col: any) => col.defaultTo(0))
      .addColumn("course_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("enrolled_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("thumbnail", "text")
      .addColumn("badge_title", "varchar(128)")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 2. Learning Path Courses Mapping
    await dbAny.schema
      .createTable("learning_path_courses")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("path_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("order_index", "integer", (col: any) => col.defaultTo(0))
      .execute();

    // 3. Live Sessions
    await dbAny.schema
      .createTable("learn_live_sessions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("instructor_id", "text", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("description", "text")
      .addColumn("category", "varchar(64)", (col: any) => col.notNull())
      .addColumn("specialty", "varchar(64)")
      .addColumn("scheduled_at", "timestamptz", (col: any) => col.notNull())
      .addColumn("duration_minutes", "integer", (col: any) => col.defaultTo(60))
      .addColumn("meeting_url", "text")
      .addColumn("thumbnail", "text")
      .addColumn("max_participants", "integer")
      .addColumn("registered_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("upcoming"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 4. Live Session Registrations
    await dbAny.schema
      .createTable("learn_live_registrations")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("session_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 5. Notes
    await dbAny.schema
      .createTable("learn_notes")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("note_text", "text", (col: any) => col.notNull())
      .addColumn("timestamp_seconds", "integer")
      .addColumn("tags", "jsonb")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 6. Collections
    await dbAny.schema
      .createTable("learn_collections")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("description", "text")
      .addColumn("color", "varchar(32)", (col: any) => col.defaultTo("blue"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 7. Collection Items
    await dbAny.schema
      .createTable("learn_collection_items")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("collection_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 8. Bookmarks
    await dbAny.schema
      .createTable("learn_bookmarks")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("lesson_id", "varchar(64)")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 9. Video Assets
    await dbAny.schema
      .createTable("video_assets")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("instructor_id", "text", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)")
      .addColumn("lesson_id", "varchar(64)")
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("original_filename", "text")
      .addColumn("file_size_bytes", "bigint")
      .addColumn("mime_type", "varchar(64)")
      .addColumn("storage_key", "text")
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("READY"))
      .addColumn("duration_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("aspect_ratio", "varchar(16)", (col: any) => col.defaultTo("16:9"))
      .addColumn("width", "integer", (col: any) => col.defaultTo(1920))
      .addColumn("height", "integer", (col: any) => col.defaultTo(1080))
      .addColumn("is_private", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("thumbnail_url", "text")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 10. Video Variants (Qualities: 360p, 480p, 720p, 1080p, audio)
    await dbAny.schema
      .createTable("video_variants")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("video_asset_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("quality", "varchar(16)", (col: any) => col.notNull())
      .addColumn("codec", "varchar(32)")
      .addColumn("bitrate", "integer")
      .addColumn("resolution", "varchar(32)")
      .addColumn("storage_key", "text", (col: any) => col.notNull())
      .addColumn("file_size_bytes", "bigint")
      .addColumn("is_ready", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 11. Video Chapters
    await dbAny.schema
      .createTable("video_chapters")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("video_asset_id", "varchar(64)")
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("start_seconds", "integer", (col: any) => col.notNull())
      .addColumn("end_seconds", "integer")
      .addColumn("order_index", "integer", (col: any) => col.defaultTo(0))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 12. Video Transcripts
    await dbAny.schema
      .createTable("video_transcripts")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("video_asset_id", "varchar(64)")
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("language", "varchar(16)", (col: any) => col.defaultTo("en"))
      .addColumn("cues", "jsonb", (col: any) => col.notNull())
      .addColumn("is_auto_generated", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("is_verified", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 13. Video Captions / Subtitles
    await dbAny.schema
      .createTable("video_captions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("video_asset_id", "varchar(64)")
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("language", "varchar(16)", (col: any) => col.notNull())
      .addColumn("label", "varchar(64)", (col: any) => col.notNull())
      .addColumn("vtt_url", "text")
      .addColumn("vtt_content", "text")
      .addColumn("is_default", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 14. Video Discussions & Lesson Q&A
    await dbAny.schema
      .createTable("video_discussions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("parent_id", "varchar(64)")
      .addColumn("timestamp_seconds", "integer")
      .addColumn("message", "text", (col: any) => col.notNull())
      .addColumn("is_instructor_answer", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("upvotes", "integer", (col: any) => col.defaultTo(0))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 15. Video Bookmarks
    await dbAny.schema
      .createTable("video_bookmarks")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("timestamp_seconds", "integer", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)")
      .addColumn("note", "text")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 16. Video Progress Heartbeat Events
    await dbAny.schema
      .createTable("video_progress_events")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("event_type", "varchar(32)", (col: any) => col.notNull())
      .addColumn("position_seconds", "integer", (col: any) => col.notNull())
      .addColumn("buffered_seconds", "integer")
      .addColumn("playback_rate", "numeric(4,2)", (col: any) => col.defaultTo(1.0))
      .addColumn("session_id", "varchar(64)")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 17. Video Playback Authorization Tokens
    await dbAny.schema
      .createTable("video_playback_tokens")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("token", "varchar(255)", (col: any) => col.notNull().unique())
      .addColumn("expires_at", "timestamptz", (col: any) => col.notNull())
      .addColumn("ip_address", "varchar(64)")
      .addColumn("user_agent", "text")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 18. Video Watch Aggregated Sessions
    await dbAny.schema
      .createTable("video_watch_sessions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("lesson_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("total_watch_time_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("max_position_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("completion_ratio", "numeric(5,2)", (col: any) => col.defaultTo(0.0))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    extensionsEnsured = true;
  } catch {
    extensionsEnsured = true;
  }
}

// ─────────────────────────────────────────────
// COURSE DISCOVERY & SEARCH
// ─────────────────────────────────────────────
export async function searchCourses(
  params: CourseFilterParams,
  currentUserId?: string
): Promise<{ courses: Course[]; total: number }> {
  await ensureLearnExtensions();
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, params.pageSize || 12);
  const offset = (page - 1) * pageSize;

  let query = learnDb
    .selectFrom("courses as c")
    .innerJoin("user as u", "u.id", "c.instructor_id")
    .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id")
    .where("c.status", "=", "published");

  if (params.query?.trim()) {
    const q = `%${params.query.trim()}%`;
    query = query.where((eb) =>
      eb.or([
        eb("c.title", "ilike", q),
        eb("c.short_description", "ilike", q),
        eb("c.category", "ilike", q),
        eb("u.name", "ilike", q),
      ])
    );
  }

  if (params.category && params.category !== "All") {
    query = query.where("c.category", "=", params.category);
  }

  if (params.profession && params.profession !== "All") {
    query = query.where("c.profession", "=", params.profession);
  }

  if (params.specialization && params.specialization !== "All") {
    query = query.where("c.specialization", "=", params.specialization);
  }

  if (params.level && params.level !== "all_levels" && params.level !== "All") {
    query = query.where("c.level", "=", params.level);
  }

  if (params.language && params.language !== "All") {
    query = query.where("c.language", "=", params.language);
  }

  if (params.is_free !== undefined) {
    query = query.where("c.is_free", "=", params.is_free);
  }

  if (params.certificate_enabled !== undefined) {
    query = query.where("c.certificate_enabled", "=", params.certificate_enabled);
  }

  // Duration filtering
  if (params.duration && params.duration !== "all") {
    if (params.duration === "under_1h") {
      query = query.where("c.duration_minutes", "<=", 60);
    } else if (params.duration === "1h_3h") {
      query = query.where("c.duration_minutes", ">", 60).where("c.duration_minutes", "<=", 180);
    } else if (params.duration === "3h_6h") {
      query = query.where("c.duration_minutes", ">", 180).where("c.duration_minutes", "<=", 360);
    } else if (params.duration === "over_6h") {
      query = query.where("c.duration_minutes", ">", 360);
    }
  }

  // Count query
  const countResult = await query
    .select(sql<string>`count(*)`.as("count"))
    .executeTakeFirst();
  const total = parseInt(countResult?.count || "0", 10);

  // Sorting
  if (params.sort === "newest") {
    query = query.orderBy("c.created_at", "desc");
  } else if (params.sort === "rating") {
    query = query.orderBy("c.rating_avg", "desc");
  } else if (params.sort === "duration") {
    query = query.orderBy("c.duration_minutes", "asc");
  } else {
    // Default popular
    query = query.orderBy("c.enrollment_count", "desc").orderBy("c.created_at", "desc");
  }

  const rawCourses = await query
    .select([
      "c.id",
      "c.instructor_id",
      "c.organization_id",
      "c.title",
      "c.slug",
      "c.short_description",
      "c.description",
      "c.thumbnail",
      "c.category",
      "c.subcategory",
      "c.profession",
      "c.specialization",
      "c.level",
      "c.language",
      "c.duration_minutes",
      "c.price",
      "c.discount_price",
      "c.currency",
      "c.is_free",
      "c.certificate_enabled",
      "c.accreditation",
      "c.subscription_tier",
      "c.bundle_access",
      "c.status",
      "c.enrollment_count",
      "c.rating_avg",
      "c.rating_count",
      "c.published_at",
      "c.created_at",
      "c.updated_at",
      "u.name as instructor_name",
      "u.email as instructor_email",
      "u.image as instructor_image",
      "pp.profession as instructor_profession",
      "pp.specialization as instructor_specialization",
      "pp.designation as instructor_designation",
      "pp.organization as instructor_organization",
      "pp.identity_verified as instructor_identity_verified",
      "pp.education_verified as instructor_education_verified",
      "pp.registration_verified as instructor_registration_verified",
    ])
    .limit(pageSize)
    .offset(offset)
    .execute();

  // If user is authenticated, check enrollments & bookmarks
  let enrollmentMap = new Map<string, { progress: number }>();
  let bookmarkSet = new Set<string>();

  if (currentUserId && rawCourses.length > 0) {
    const courseIds = rawCourses.map((c) => c.id);
    try {
      const enrollments = await learnDb
        .selectFrom("course_enrollments")
        .select(["course_id", "progress_percentage"])
        .where("user_id", "=", currentUserId)
        .where("course_id", "in", courseIds)
        .execute();
      for (const e of enrollments) {
        enrollmentMap.set(e.course_id, { progress: e.progress_percentage });
      }

      const bookmarks = await (learnDb as any)
        .selectFrom("learn_bookmarks")
        .select(["course_id"])
        .where("user_id", "=", currentUserId)
        .where("course_id", "in", courseIds)
        .execute();
      for (const b of bookmarks) {
        bookmarkSet.add(b.course_id);
      }
    } catch {
      // ignore
    }
  }

  const courses: Course[] = rawCourses.map((r) => ({
    id: r.id,
    instructor_id: r.instructor_id,
    organization_id: r.organization_id,
    title: r.title,
    slug: r.slug,
    short_description: r.short_description,
    description: r.description,
    thumbnail: r.thumbnail,
    category: r.category,
    subcategory: r.subcategory,
    profession: r.profession,
    specialization: r.specialization,
    level: (r.level as any) || "all_levels",
    language: r.language || "English",
    duration_minutes: Number(r.duration_minutes) || 0,
    price: Number(r.price) || 0,
    discount_price: r.discount_price !== undefined && r.discount_price !== null ? Number(r.discount_price) : null,
    currency: r.currency || "INR",
    is_free: r.is_free,
    certificate_enabled: r.certificate_enabled,
    accreditation: r.accreditation || null,
    subscription_tier: (r.subscription_tier as any) || null,
    bundle_access: Boolean(r.bundle_access),
    status: (r.status as any) || "published",
    enrollment_count: Number(r.enrollment_count) || 0,
    rating_avg: Number(r.rating_avg) || 0,
    rating_count: Number(r.rating_count) || 0,
    published_at: r.published_at ? r.published_at.toISOString() : null,
    created_at: r.created_at.toISOString(),
    updated_at: r.updated_at.toISOString(),
    instructor: {
      id: r.instructor_id,
      name: r.instructor_name,
      email: r.instructor_email,
      image: r.instructor_image,
      profession: r.instructor_profession,
      specialization: r.instructor_specialization,
      designation: r.instructor_designation,
      organization: r.instructor_organization,
      identity_verified: r.instructor_identity_verified || false,
      education_verified: r.instructor_education_verified || false,
      registration_verified: r.instructor_registration_verified || false,
    },
    user_enrolled: enrollmentMap.has(r.id),
    user_progress: enrollmentMap.get(r.id)?.progress || 0,
    user_bookmarked: bookmarkSet.has(r.id),
  }));

  return { courses, total };
}

// ─────────────────────────────────────────────
// GET COURSE BY ID OR SLUG
// ─────────────────────────────────────────────
export async function getCourseDetails(
  courseIdOrSlug: string,
  currentUserId?: string
): Promise<Course | null> {
  await ensureLearnExtensions();
  const isId = courseIdOrSlug.length <= 64 && !courseIdOrSlug.includes(" ");

  let query = learnDb
    .selectFrom("courses as c")
    .innerJoin("user as u", "u.id", "c.instructor_id")
    .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id");

  if (isId) {
    query = query.where((eb) =>
      eb.or([eb("c.id", "=", courseIdOrSlug), eb("c.slug", "=", courseIdOrSlug)])
    );
  } else {
    query = query.where("c.slug", "=", courseIdOrSlug);
  }

  const raw = await query
    .select([
      "c.id",
      "c.instructor_id",
      "c.organization_id",
      "c.title",
      "c.slug",
      "c.short_description",
      "c.description",
      "c.thumbnail",
      "c.category",
      "c.subcategory",
      "c.profession",
      "c.specialization",
      "c.level",
      "c.language",
      "c.duration_minutes",
      "c.price",
      "c.discount_price",
      "c.currency",
      "c.is_free",
      "c.certificate_enabled",
      "c.accreditation",
      "c.subscription_tier",
      "c.bundle_access",
      "c.status",
      "c.enrollment_count",
      "c.rating_avg",
      "c.rating_count",
      "c.published_at",
      "c.created_at",
      "c.updated_at",
      "u.name as instructor_name",
      "u.email as instructor_email",
      "u.image as instructor_image",
      "pp.profession as instructor_profession",
      "pp.specialization as instructor_specialization",
      "pp.designation as instructor_designation",
      "pp.organization as instructor_organization",
      "pp.identity_verified as instructor_identity_verified",
      "pp.education_verified as instructor_education_verified",
      "pp.registration_verified as instructor_registration_verified",
    ])
    .executeTakeFirst();

  if (!raw) return null;

  // Count modules & lessons
  const moduleCountRes = await learnDb
    .selectFrom("course_modules")
    .select(sql<string>`count(*)`.as("count"))
    .where("course_id", "=", raw.id)
    .executeTakeFirst();

  const lessonCountRes = await learnDb
    .selectFrom("course_lessons")
    .select(sql<string>`count(*)`.as("count"))
    .where("course_id", "=", raw.id)
    .executeTakeFirst();

  let userEnrolled = false;
  let userProgress = 0;
  let userBookmarked = false;

  if (currentUserId) {
    const enrollment = await learnDb
      .selectFrom("course_enrollments")
      .select(["progress_percentage"])
      .where("user_id", "=", currentUserId)
      .where("course_id", "=", raw.id)
      .executeTakeFirst();

    if (enrollment) {
      userEnrolled = true;
      userProgress = enrollment.progress_percentage;
    }

    try {
      const bookmark = await (learnDb as any)
        .selectFrom("learn_bookmarks")
        .select(["id"])
        .where("user_id", "=", currentUserId)
        .where("course_id", "=", raw.id)
        .executeTakeFirst();
      userBookmarked = Boolean(bookmark);
    } catch {
      // ignore
    }
  }

  return {
    id: raw.id,
    instructor_id: raw.instructor_id,
    organization_id: raw.organization_id,
    title: raw.title,
    slug: raw.slug,
    short_description: raw.short_description,
    description: raw.description,
    thumbnail: raw.thumbnail,
    category: raw.category,
    subcategory: raw.subcategory,
    profession: raw.profession,
    specialization: raw.specialization,
    level: (raw.level as any) || "all_levels",
    language: raw.language || "English",
    duration_minutes: Number(raw.duration_minutes) || 0,
    price: Number(raw.price) || 0,
    discount_price: raw.discount_price !== undefined && raw.discount_price !== null ? Number(raw.discount_price) : null,
    currency: raw.currency || "INR",
    is_free: raw.is_free,
    certificate_enabled: raw.certificate_enabled,
    accreditation: raw.accreditation || null,
    subscription_tier: (raw.subscription_tier as any) || null,
    bundle_access: Boolean(raw.bundle_access),
    status: (raw.status as any) || "published",
    enrollment_count: Number(raw.enrollment_count) || 0,
    rating_avg: Number(raw.rating_avg) || 0,
    rating_count: Number(raw.rating_count) || 0,
    published_at: raw.published_at ? raw.published_at.toISOString() : null,
    created_at: raw.created_at.toISOString(),
    updated_at: raw.updated_at.toISOString(),
    instructor: {
      id: raw.instructor_id,
      name: raw.instructor_name,
      email: raw.instructor_email,
      image: raw.instructor_image,
      profession: raw.instructor_profession,
      specialization: raw.instructor_specialization,
      designation: raw.instructor_designation,
      organization: raw.instructor_organization,
      identity_verified: raw.instructor_identity_verified || false,
      education_verified: raw.instructor_education_verified || false,
      registration_verified: raw.instructor_registration_verified || false,
    },
    module_count: parseInt(moduleCountRes?.count || "0", 10),
    lesson_count: parseInt(lessonCountRes?.count || "0", 10),
    user_enrolled: userEnrolled,
    user_progress: userProgress,
    user_bookmarked: userBookmarked,
  };
}

// ─────────────────────────────────────────────
// GET CURRICULUM TREE (Modules + Lessons + Resources)
// ─────────────────────────────────────────────
export async function getCourseCurriculum(
  courseId: string,
  currentUserId?: string
): Promise<CourseModule[]> {
  const rawModules = await learnDb
    .selectFrom("course_modules")
    .selectAll()
    .where("course_id", "=", courseId)
    .orderBy("order_index", "asc")
    .execute();

  if (rawModules.length === 0) return [];

  const rawLessons = await learnDb
    .selectFrom("course_lessons")
    .selectAll()
    .where("course_id", "=", courseId)
    .orderBy("order_index", "asc")
    .execute();

  const rawResources = await learnDb
    .selectFrom("course_resources")
    .selectAll()
    .where("course_id", "=", courseId)
    .execute();

  // If user is logged in, fetch lesson progress
  let progressMap = new Map<string, { completed: boolean; position: number }>();
  if (currentUserId) {
    const progressList = await learnDb
      .selectFrom("lesson_progress")
      .select(["lesson_id", "completed", "last_position_seconds"])
      .where("user_id", "=", currentUserId)
      .where("course_id", "=", courseId)
      .execute();

    for (const p of progressList) {
      progressMap.set(p.lesson_id, {
        completed: p.completed,
        position: p.last_position_seconds,
      });
    }
  }

  // Resources by lesson_id
  const resourcesByLesson = new Map<string, any[]>();
  for (const res of rawResources) {
    if (res.lesson_id) {
      const list = resourcesByLesson.get(res.lesson_id) || [];
      list.push({
        id: res.id,
        lesson_id: res.lesson_id,
        course_id: res.course_id,
        title: res.title,
        file_url: res.file_url,
        file_type: res.file_type,
        file_size_bytes: res.file_size_bytes,
        created_at: res.created_at.toISOString(),
      });
      resourcesByLesson.set(res.lesson_id, list);
    }
  }

  // Group lessons by module_id
  const lessonsByModule = new Map<string, CourseLesson[]>();
  for (const l of rawLessons) {
    const p = progressMap.get(l.id);
    const item: CourseLesson = {
      id: l.id,
      module_id: l.module_id,
      course_id: l.course_id,
      title: l.title,
      description: l.description,
      lesson_type: (l.lesson_type as any) || "video",
      content: l.content,
      media_url: l.media_url,
      duration_seconds: l.duration_seconds || 0,
      order_index: l.order_index,
      is_preview: l.is_preview,
      created_at: l.created_at.toISOString(),
      updated_at: l.updated_at.toISOString(),
      resources: resourcesByLesson.get(l.id) || [],
      completed: p?.completed || false,
      last_position_seconds: p?.position || 0,
    };

    const list = lessonsByModule.get(l.module_id) || [];
    list.push(item);
    lessonsByModule.set(l.module_id, list);
  }

  return rawModules.map((m) => ({
    id: m.id,
    course_id: m.course_id,
    title: m.title,
    description: m.description,
    order_index: m.order_index,
    created_at: m.created_at.toISOString(),
    updated_at: m.updated_at.toISOString(),
    lessons: lessonsByModule.get(m.id) || [],
  }));
}

// ─────────────────────────────────────────────
// ENROLL USER IN COURSE
// ─────────────────────────────────────────────
export async function enrollUser(courseId: string, userId: string): Promise<string> {
  const enrollmentId = generateId();
  const now = new Date();

  await learnDb
    .insertInto("course_enrollments")
    .values({
      id: enrollmentId,
      course_id: courseId,
      user_id: userId,
      enrolled_at: now,
      completed_at: null,
      status: "active",
      progress_percentage: 0,
      last_lesson_id: null,
      last_accessed_at: now,
    })
    .onConflict((oc) => oc.columns(["course_id", "user_id"]).doNothing())
    .execute();

  // Increment course enrollment count
  await learnDb
    .updateTable("courses")
    .set({
      enrollment_count: sql`enrollment_count + 1`,
      updated_at: now,
    })
    .where("id", "=", courseId)
    .execute();

  return enrollmentId;
}

// ─────────────────────────────────────────────
// UPDATE LESSON PROGRESS
// ─────────────────────────────────────────────
export async function updateLessonProgress({
  userId,
  lessonId,
  courseId,
  progressPercentage,
  lastPositionSeconds,
  completed,
}: {
  userId: string;
  lessonId: string;
  courseId: string;
  progressPercentage: number;
  lastPositionSeconds: number;
  completed: boolean;
}): Promise<void> {
  const now = new Date();

  // Upsert lesson progress
  await learnDb
    .insertInto("lesson_progress")
    .values({
      id: generateId(),
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      last_position_seconds: lastPositionSeconds,
      completed,
      completed_at: completed ? now : null,
      updated_at: now,
    })
    .onConflict((oc) =>
      oc.columns(["user_id", "lesson_id"]).doUpdateSet({
        progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
        last_position_seconds: lastPositionSeconds,
        completed: sql`lesson_progress.completed OR ${completed}`,
        completed_at: completed ? now : sql`lesson_progress.completed_at`,
        updated_at: now,
      })
    )
    .execute();

  // Recalculate total course progress
  const totalLessonsRes = await learnDb
    .selectFrom("course_lessons")
    .select(sql<string>`count(*)`.as("count"))
    .where("course_id", "=", courseId)
    .executeTakeFirst();
  const totalLessons = parseInt(totalLessonsRes?.count || "0", 10);

  if (totalLessons > 0) {
    const completedLessonsRes = await learnDb
      .selectFrom("lesson_progress")
      .select(sql<string>`count(*)`.as("count"))
      .where("user_id", "=", userId)
      .where("course_id", "=", courseId)
      .where("completed", "=", true)
      .executeTakeFirst();
    const completedLessons = parseInt(completedLessonsRes?.count || "0", 10);

    const overallCourseProgress = Math.round((completedLessons / totalLessons) * 100);
    const isNowComplete = overallCourseProgress >= 100;

    await learnDb
      .updateTable("course_enrollments")
      .set({
        progress_percentage: overallCourseProgress,
        status: isNowComplete ? "completed" : "active",
        completed_at: isNowComplete ? now : null,
        last_lesson_id: lessonId,
        last_accessed_at: now,
      })
      .where("user_id", "=", userId)
      .where("course_id", "=", courseId)
      .execute();

    if (isNowComplete) {
      // Automatically issue certificate if enabled
      await issueCourseCertificate(userId, courseId).catch(() => {});
    }
  }
}

// ─────────────────────────────────────────────
// GET QUIZ FOR STUDENT (Strips is_correct)
// ─────────────────────────────────────────────
export async function getQuizForStudent(
  quizIdOrLessonId: string,
  userId?: string
): Promise<Quiz | null> {
  const quiz = await learnDb
    .selectFrom("quizzes")
    .selectAll()
    .where((eb) => eb.or([eb("id", "=", quizIdOrLessonId), eb("lesson_id", "=", quizIdOrLessonId)]))
    .executeTakeFirst();

  if (!quiz) return null;

  const questions = await learnDb
    .selectFrom("quiz_questions")
    .selectAll()
    .where("quiz_id", "=", quiz.id)
    .orderBy("order_index", "asc")
    .execute();

  const questionIds = questions.map((q) => q.id);

  let optionsByQuestion = new Map<string, any[]>();
  if (questionIds.length > 0) {
    const rawOptions = await learnDb
      .selectFrom("quiz_options")
      .select(["id", "question_id", "option_text", "order_index"]) // Omit is_correct
      .where("question_id", "in", questionIds)
      .orderBy("order_index", "asc")
      .execute();

    for (const opt of rawOptions) {
      const list = optionsByQuestion.get(opt.question_id) || [];
      list.push(opt);
      optionsByQuestion.set(opt.question_id, list);
    }
  }

  let attemptsCount = 0;
  let userPassed = false;

  if (userId) {
    const attempts = await learnDb
      .selectFrom("quiz_attempts")
      .selectAll()
      .where("quiz_id", "=", quiz.id)
      .where("user_id", "=", userId)
      .execute();

    attemptsCount = attempts.length;
    userPassed = attempts.some((a) => a.passed);
  }

  return {
    id: quiz.id,
    lesson_id: quiz.lesson_id,
    course_id: quiz.course_id,
    title: quiz.title,
    description: quiz.description,
    passing_score: quiz.passing_score,
    time_limit_minutes: quiz.time_limit_minutes,
    max_attempts: quiz.max_attempts,
    status: quiz.status,
    created_at: quiz.created_at.toISOString(),
    updated_at: quiz.updated_at.toISOString(),
    questions: questions.map((q) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question: q.question,
      question_type: (q.question_type as any) || "single",
      explanation: q.explanation,
      order_index: q.order_index,
      options: optionsByQuestion.get(q.id) || [],
    })),
    user_attempts_count: attemptsCount,
    user_passed: userPassed,
  };
}

// ─────────────────────────────────────────────
// EVALUATE QUIZ ATTEMPT (Strict Server-Side Scoring)
// ─────────────────────────────────────────────
export async function evaluateQuizAttempt({
  quizId,
  userId,
  answers,
}: {
  quizId: string;
  userId: string;
  answers: SubmitQuizAnswerInput[];
}): Promise<QuizAttempt> {
  const quiz = await learnDb
    .selectFrom("quizzes")
    .selectAll()
    .where("id", "=", quizId)
    .executeTakeFirst();

  if (!quiz) throw new Error("Quiz not found");

  const questions = await learnDb
    .selectFrom("quiz_questions")
    .selectAll()
    .where("quiz_id", "=", quizId)
    .execute();

  const options = await learnDb
    .selectFrom("quiz_options")
    .selectAll()
    .where("question_id", "in", questions.map((q) => q.id))
    .execute();

  const correctOptionsByQuestion = new Map<string, Set<string>>();
  for (const opt of options) {
    if (opt.is_correct) {
      const set = correctOptionsByQuestion.get(opt.question_id) || new Set<string>();
      set.add(opt.id);
      correctOptionsByQuestion.set(opt.question_id, set);
    }
  }

  const answerMap = new Map<string, Set<string>>();
  for (const a of answers) {
    answerMap.set(a.question_id, new Set(a.selected_option_ids));
  }

  let correctCount = 0;
  for (const q of questions) {
    const correctSet = correctOptionsByQuestion.get(q.id) || new Set<string>();
    const userSet = answerMap.get(q.id) || new Set<string>();

    if (
      correctSet.size === userSet.size &&
      [...correctSet].every((id) => userSet.has(id))
    ) {
      correctCount++;
    }
  }

  const totalQuestions = questions.length;
  const incorrectCount = totalQuestions - correctCount;
  const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const passed = percentage >= quiz.passing_score;

  const prevAttemptsRes = await learnDb
    .selectFrom("quiz_attempts")
    .select(sql<string>`count(*)`.as("count"))
    .where("quiz_id", "=", quizId)
    .where("user_id", "=", userId)
    .executeTakeFirst();
  const attemptNumber = parseInt(prevAttemptsRes?.count || "0", 10) + 1;

  const attemptId = generateId();
  const now = new Date();

  await learnDb
    .insertInto("quiz_attempts")
    .values({
      id: attemptId,
      quiz_id: quizId,
      user_id: userId,
      score: correctCount,
      percentage: Number(percentage.toFixed(2)),
      passed,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
      attempt_number: attemptNumber,
      submitted_at: now,
    })
    .execute();

  if (quiz.lesson_id && passed) {
    await updateLessonProgress({
      userId,
      lessonId: quiz.lesson_id,
      courseId: quiz.course_id,
      progressPercentage: 100,
      lastPositionSeconds: 0,
      completed: true,
    });
  }

  return {
    id: attemptId,
    quiz_id: quizId,
    user_id: userId,
    score: correctCount,
    percentage: Number(percentage.toFixed(2)),
    passed,
    total_questions: totalQuestions,
    correct_answers: correctCount,
    incorrect_answers: incorrectCount,
    attempt_number: attemptNumber,
    submitted_at: now.toISOString(),
  };
}

// ─────────────────────────────────────────────
// ISSUE COURSE CERTIFICATE (Dual-writes to unified_certificates)
// ─────────────────────────────────────────────
export async function issueCourseCertificate(
  userId: string,
  courseId: string
): Promise<Certificate> {
  const existing = await learnDb
    .selectFrom("certificates")
    .selectAll()
    .where("user_id", "=", userId)
    .where("course_id", "=", courseId)
    .executeTakeFirst();

  if (existing) {
    return {
      id: existing.id,
      certificate_number: existing.certificate_number,
      user_id: existing.user_id,
      course_id: existing.course_id,
      issued_at: existing.issued_at.toISOString(),
      completion_date: existing.completion_date.toISOString(),
      verification_code: existing.verification_code,
      metadata: existing.metadata,
      status: (existing.status as any) || "valid",
    };
  }

  const course = await getCourseDetails(courseId);
  if (!course) throw new Error("Course not found");

  const student = await learnDb
    .selectFrom("user")
    .select(["id", "name", "email"])
    .where("id", "=", userId)
    .executeTakeFirst();

  const id = generateId();
  const year = new Date().getFullYear();
  const hex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const certNumber = `MGN-LRN-${year}-${hex}`;
  const verificationCode = `MGN-CERT-${hex}`;
  const now = new Date();

  const metadata = {
    student_name: student?.name || "Healthcare Professional",
    student_email: student?.email || "",
    course_title: course.title,
    instructor_name: course.instructor?.name || "Senior Faculty",
    instructor_designation: course.instructor?.designation || undefined,
    instructor_organization: course.instructor?.organization || undefined,
    duration_minutes: course.duration_minutes,
    completion_date: now.toISOString(),
    skills_acquired: course.skills || [course.category, course.specialization || "Clinical Practice"].filter(Boolean),
  };

  await learnDb
    .insertInto("certificates")
    .values({
      id,
      certificate_number: certNumber,
      user_id: userId,
      course_id: courseId,
      issued_at: now,
      completion_date: now,
      verification_code: verificationCode,
      metadata: JSON.stringify(metadata) as any,
      status: "valid",
    })
    .execute();

  // Also issue in unified certificate registry
  await SharedCertificateService.issueCertificate({
    userId,
    recipientName: student?.name || "Healthcare Professional",
    issuerName: course.instructor?.name || "MedGlobal Network Faculty",
    entityType: "course",
    entityId: courseId,
    title: course.title,
    subtitle: `${course.category} · Accredited Healthcare CME`,
    metadata,
  }).catch(() => {});

  return {
    id,
    certificate_number: certNumber,
    user_id: userId,
    course_id: courseId,
    issued_at: now.toISOString(),
    completion_date: now.toISOString(),
    verification_code: verificationCode,
    metadata,
    status: "valid",
    course,
    user: student ? { id: student.id, name: student.name, email: student.email } : undefined,
  };
}

// ─────────────────────────────────────────────
// GET CERTIFICATE BY VERIFICATION CODE (Public)
// ─────────────────────────────────────────────
export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const cleanCode = code.trim().toUpperCase();

  const raw = await learnDb
    .selectFrom("certificates as cert")
    .innerJoin("courses as c", "c.id", "cert.course_id")
    .innerJoin("user as u", "u.id", "cert.user_id")
    .innerJoin("user as inst", "inst.id", "c.instructor_id")
    .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id")
    .select([
      "cert.id",
      "cert.certificate_number",
      "cert.user_id",
      "cert.course_id",
      "cert.issued_at",
      "cert.completion_date",
      "cert.verification_code",
      "cert.metadata",
      "cert.status",
      "u.name as student_name",
      "u.email as student_email",
      "c.title as course_title",
      "c.category as course_category",
      "c.duration_minutes as course_duration",
      "inst.name as instructor_name",
      "pp.designation as instructor_designation",
      "pp.organization as instructor_organization",
    ])
    .where((eb) =>
      eb.or([
        eb("cert.verification_code", "=", cleanCode),
        eb("cert.certificate_number", "=", cleanCode),
      ])
    )
    .executeTakeFirst();

  if (!raw) return null;

  return {
    id: raw.id,
    certificate_number: raw.certificate_number,
    user_id: raw.user_id,
    course_id: raw.course_id,
    issued_at: raw.issued_at.toISOString(),
    completion_date: raw.completion_date.toISOString(),
    verification_code: raw.verification_code,
    metadata: raw.metadata || {
      student_name: raw.student_name,
      student_email: raw.student_email,
      course_title: raw.course_title,
      instructor_name: raw.instructor_name,
      instructor_designation: raw.instructor_designation || undefined,
      instructor_organization: raw.instructor_organization || undefined,
      duration_minutes: Number(raw.course_duration) || 0,
      completion_date: raw.completion_date.toISOString(),
    },
    status: (raw.status as any) || "valid",
    user: {
      id: raw.user_id,
      name: raw.student_name,
      email: raw.student_email,
    },
    course: {
      id: raw.course_id,
      instructor_id: "",
      title: raw.course_title,
      slug: "",
      category: raw.course_category,
      duration_minutes: Number(raw.course_duration) || 0,
      certificate_enabled: true,
      level: "all_levels",
      language: "English",
      price: 0,
      currency: "INR",
      is_free: true,
      status: "published",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
      created_at: "",
      updated_at: "",
      instructor: {
        id: "",
        name: raw.instructor_name,
        email: "",
        image: null,
      },
    },
  };
}

// ─────────────────────────────────────────────
// LEARNING PATHS (Structured Curated Tracks)
// ─────────────────────────────────────────────
export async function getLearningPaths(currentUserId?: string): Promise<LearningPath[]> {
  await ensureLearnExtensions();
  try {
    const rawPaths = await (learnDb as any)
      .selectFrom("learning_paths")
      .selectAll()
      .orderBy("created_at", "desc")
      .execute();

    if (rawPaths && rawPaths.length > 0) {
      return rawPaths.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        category: p.category,
        profession: p.profession,
        level: p.level || "all_levels",
        duration_hours: Number(p.duration_hours) || 0,
        course_count: Number(p.course_count) || 0,
        enrolled_count: Number(p.enrolled_count) || 0,
        thumbnail: p.thumbnail,
        badge_title: p.badge_title,
        created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
      }));
    }
  } catch {
    // Fallback to default curated healthcare tracks if empty
  }

  // Curated clinical paths with real healthcare topics
  return [
    {
      id: "path-critical-care",
      title: "Critical Care & Advanced Mechanical Ventilation",
      slug: "critical-care-mechanical-ventilation",
      description: "Master ICU hemodynamics, arterial blood gas interpretation, ventilator modes, and acute respiratory distress management.",
      category: "Critical Care",
      profession: "Doctor",
      level: "advanced",
      duration_hours: 14,
      course_count: 4,
      enrolled_count: 428,
      badge_title: "Certified Critical Care Specialist",
      thumbnail: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
      created_at: new Date().toISOString(),
    },
    {
      id: "path-pocus-ultrasound",
      title: "Point-of-Care Ultrasound (POCUS) Clinical Mastery",
      slug: "pocus-clinical-mastery",
      description: "Comprehensive bed-side ultrasound protocols: eFAST trauma scan, cardiac echo (FOCUS), lung ultrasound, and vascular access.",
      category: "Emergency Medicine",
      profession: "Doctor",
      level: "intermediate",
      duration_hours: 10,
      course_count: 3,
      enrolled_count: 512,
      badge_title: "POCUS Clinical Fellow",
      thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
      created_at: new Date().toISOString(),
    },
    {
      id: "path-sports-rehab",
      title: "Orthopedic Sports Rehabilitation & Return-to-Play",
      slug: "orthopedic-sports-rehab",
      description: "Evidence-based ACL reconstruction rehab, rotator cuff mechanics, load management, and athlete return-to-sport testing.",
      category: "Physiotherapy",
      profession: "Physiotherapist",
      level: "intermediate",
      duration_hours: 12,
      course_count: 4,
      enrolled_count: 389,
      badge_title: "Sports Rehabilitation Fellow",
      thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
      created_at: new Date().toISOString(),
    },
    {
      id: "path-clinical-trials",
      title: "GCP & Clinical Trial Protocol Design",
      slug: "gcp-clinical-trial-design",
      description: "Good Clinical Practice (ICH-GCP E6 R2), ethical regulatory compliance, phase I-IV trial design, and adverse event reporting.",
      category: "Research",
      profession: "All Healthcare",
      level: "all_levels",
      duration_hours: 8,
      course_count: 3,
      enrolled_count: 274,
      badge_title: "GCP Clinical Investigator",
      thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
      created_at: new Date().toISOString(),
    },
  ];
}

// ─────────────────────────────────────────────
// LIVE SESSIONS & CLASSROOM
// ─────────────────────────────────────────────
export async function getLiveSessions(currentUserId?: string): Promise<LiveSession[]> {
  try {
    const records = await LiveClassroomRepository.getSessions(currentUserId);
    return records.map((s: LiveSessionRecord) => ({
      id: s.id,
      instructor_id: s.instructor_id,
      title: s.title,
      description: s.description,
      category: s.category,
      specialty: s.specialty,
      scheduled_at: s.scheduled_at,
      duration_minutes: s.duration_minutes,
      meeting_url: s.meeting_url || `/learn/live/${s.id}`,
      thumbnail: s.thumbnail,
      max_participants: s.max_participants,
      registered_count: s.registered_count,
      status: s.status,
      user_registered: Boolean(s.user_registered),
      instructor: s.instructor
        ? {
            id: s.instructor.id,
            name: s.instructor.name,
            email: "",
            image: s.instructor.image || null,
            profession: s.instructor.profession || null,
            specialization: s.instructor.specialization || null,
            organization: s.instructor.organization || null,
          }
        : undefined,
      created_at: s.created_at,
    }));
  } catch (err) {
    console.error("getLiveSessions error:", err);
    return [];
  }
}

export async function registerForLiveSession(userId: string, sessionId: string): Promise<boolean> {
  try {
    return await LiveClassroomRepository.registerUser(sessionId, userId);
  } catch (err) {
    console.error("registerForLiveSession error:", err);
    return false;
  }
}

// ─────────────────────────────────────────────
// CLINICAL NOTES MANAGEMENT
// ─────────────────────────────────────────────
export async function getLessonNotes(userId: string, lessonId: string): Promise<LearnNote[]> {
  await ensureLearnExtensions();
  try {
    const notes = await (learnDb as any)
      .selectFrom("learn_notes")
      .selectAll()
      .where("user_id", "=", userId)
      .where("lesson_id", "=", lessonId)
      .orderBy("created_at", "desc")
      .execute();

    return notes.map((n: any) => ({
      id: n.id,
      user_id: n.user_id,
      course_id: n.course_id,
      lesson_id: n.lesson_id,
      note_text: n.note_text,
      timestamp_seconds: n.timestamp_seconds,
      tags: typeof n.tags === "string" ? JSON.parse(n.tags) : n.tags || [],
      created_at: new Date(n.created_at).toISOString(),
      updated_at: new Date(n.updated_at).toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getUserNotes(userId: string): Promise<LearnNote[]> {
  await ensureLearnExtensions();
  try {
    const notes = await (learnDb as any)
      .selectFrom("learn_notes as n")
      .leftJoin("courses as c", "c.id", "n.course_id")
      .leftJoin("course_lessons as l", "l.id", "n.lesson_id")
      .select([
        "n.id",
        "n.user_id",
        "n.course_id",
        "n.lesson_id",
        "n.note_text",
        "n.timestamp_seconds",
        "n.tags",
        "n.created_at",
        "n.updated_at",
        "c.title as course_title",
        "l.title as lesson_title",
      ])
      .where("n.user_id", "=", userId)
      .orderBy("n.created_at", "desc")
      .execute();

    return notes.map((n: any) => ({
      id: n.id,
      user_id: n.user_id,
      course_id: n.course_id,
      lesson_id: n.lesson_id,
      note_text: n.note_text,
      timestamp_seconds: n.timestamp_seconds,
      tags: typeof n.tags === "string" ? JSON.parse(n.tags) : n.tags || [],
      created_at: new Date(n.created_at).toISOString(),
      updated_at: new Date(n.updated_at).toISOString(),
      course_title: n.course_title || "Course Note",
      lesson_title: n.lesson_title || "Lesson Note",
    }));
  } catch {
    return [];
  }
}

export async function saveLessonNote({
  userId,
  courseId,
  lessonId,
  noteText,
  timestampSeconds,
  tags,
}: {
  userId: string;
  courseId: string;
  lessonId: string;
  noteText: string;
  timestampSeconds?: number;
  tags?: string[];
}): Promise<LearnNote> {
  await ensureLearnExtensions();
  const id = generateId();
  const now = new Date();

  await (learnDb as any)
    .insertInto("learn_notes")
    .values({
      id,
      user_id: userId,
      course_id: courseId,
      lesson_id: lessonId,
      note_text: noteText.trim(),
      timestamp_seconds: timestampSeconds || null,
      tags: JSON.stringify(tags || []),
      created_at: now,
      updated_at: now,
    })
    .execute();

  return {
    id,
    user_id: userId,
    course_id: courseId,
    lesson_id: lessonId,
    note_text: noteText.trim(),
    timestamp_seconds: timestampSeconds || null,
    tags: tags || [],
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

export async function deleteLessonNote(userId: string, noteId: string): Promise<boolean> {
  await ensureLearnExtensions();
  await (learnDb as any)
    .deleteFrom("learn_notes")
    .where("id", "=", noteId)
    .where("user_id", "=", userId)
    .execute();
  return true;
}

// ─────────────────────────────────────────────
// CUSTOM COLLECTIONS & FOLDERS
// ─────────────────────────────────────────────
export async function getUserCollections(userId: string): Promise<LearnCollection[]> {
  await ensureLearnExtensions();
  try {
    const collections = await (learnDb as any)
      .selectFrom("learn_collections as col")
      .selectAll()
      .where("col.user_id", "=", userId)
      .orderBy("col.created_at", "desc")
      .execute();

    const result: LearnCollection[] = [];
    for (const c of collections) {
      const items = await (learnDb as any)
        .selectFrom("learn_collection_items as ci")
        .innerJoin("courses as crs", "crs.id", "ci.course_id")
        .innerJoin("user as u", "u.id", "crs.instructor_id")
        .select([
          "crs.id",
          "crs.title",
          "crs.slug",
          "crs.thumbnail",
          "crs.category",
          "crs.duration_minutes",
          "u.name as instructor_name",
        ])
        .where("ci.collection_id", "=", c.id)
        .execute();

      result.push({
        id: c.id,
        user_id: c.user_id,
        title: c.title,
        description: c.description,
        color: c.color || "blue",
        item_count: items.length,
        created_at: new Date(c.created_at).toISOString(),
        updated_at: new Date(c.updated_at).toISOString(),
        courses: items.map((crs: any) => ({
          id: crs.id,
          instructor_id: "",
          title: crs.title,
          slug: crs.slug,
          thumbnail: crs.thumbnail,
          category: crs.category,
          duration_minutes: Number(crs.duration_minutes) || 0,
          certificate_enabled: true,
          level: "all_levels",
          language: "English",
          price: 0,
          currency: "INR",
          is_free: true,
          status: "published",
          enrollment_count: 0,
          rating_avg: 0,
          rating_count: 0,
          created_at: "",
          updated_at: "",
          instructor: { id: "", name: crs.instructor_name, email: "", image: null },
        })),
      });
    }

    return result;
  } catch {
    return [];
  }
}

export async function createCollection(
  userId: string,
  title: string,
  description?: string,
  color?: string
): Promise<string> {
  await ensureLearnExtensions();
  const id = generateId();
  const now = new Date();

  await (learnDb as any)
    .insertInto("learn_collections")
    .values({
      id,
      user_id: userId,
      title: title.trim(),
      description: description?.trim() || null,
      color: color || "blue",
      created_at: now,
      updated_at: now,
    })
    .execute();

  return id;
}

export async function addToCollection(
  userId: string,
  collectionId: string,
  courseId: string
): Promise<boolean> {
  await ensureLearnExtensions();
  const id = generateId();
  await (learnDb as any)
    .insertInto("learn_collection_items")
    .values({
      id,
      collection_id: collectionId,
      course_id: courseId,
      created_at: new Date(),
    })
    .execute();
  return true;
}

export async function removeFromCollection(
  userId: string,
  collectionId: string,
  courseId: string
): Promise<boolean> {
  await ensureLearnExtensions();
  await (learnDb as any)
    .deleteFrom("learn_collection_items")
    .where("collection_id", "=", collectionId)
    .where("course_id", "=", courseId)
    .execute();
  return true;
}

export async function deleteCollection(userId: string, collectionId: string): Promise<boolean> {
  await ensureLearnExtensions();
  await (learnDb as any)
    .deleteFrom("learn_collection_items")
    .where("collection_id", "=", collectionId)
    .execute();

  await (learnDb as any)
    .deleteFrom("learn_collections")
    .where("id", "=", collectionId)
    .where("user_id", "=", userId)
    .execute();
  return true;
}

// ─────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────
export async function toggleBookmark(
  userId: string,
  courseId: string,
  lessonId?: string
): Promise<{ bookmarked: boolean }> {
  await ensureLearnExtensions();
  const existing = await (learnDb as any)
    .selectFrom("learn_bookmarks")
    .select(["id"])
    .where("user_id", "=", userId)
    .where("course_id", "=", courseId)
    .executeTakeFirst();

  if (existing) {
    await (learnDb as any)
      .deleteFrom("learn_bookmarks")
      .where("id", "=", existing.id)
      .execute();
    return { bookmarked: false };
  } else {
    const id = generateId();
    await (learnDb as any)
      .insertInto("learn_bookmarks")
      .values({
        id,
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId || null,
        created_at: new Date(),
      })
      .execute();
    return { bookmarked: true };
  }
}

export async function getUserBookmarks(userId: string): Promise<LearnBookmark[]> {
  await ensureLearnExtensions();
  try {
    const raw = await (learnDb as any)
      .selectFrom("learn_bookmarks as b")
      .innerJoin("courses as c", "c.id", "b.course_id")
      .innerJoin("user as u", "u.id", "c.instructor_id")
      .select([
        "b.id",
        "b.user_id",
        "b.course_id",
        "b.lesson_id",
        "b.created_at",
        "c.title as course_title",
        "c.slug as course_slug",
        "c.thumbnail as course_thumbnail",
        "c.category as course_category",
        "c.duration_minutes as course_duration",
        "u.name as instructor_name",
      ])
      .where("b.user_id", "=", userId)
      .orderBy("b.created_at", "desc")
      .execute();

    return raw.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      course_id: r.course_id,
      lesson_id: r.lesson_id,
      created_at: new Date(r.created_at).toISOString(),
      course: {
        id: r.course_id,
        instructor_id: "",
        title: r.course_title,
        slug: r.course_slug,
        thumbnail: r.course_thumbnail,
        category: r.course_category,
        duration_minutes: Number(r.course_duration) || 0,
        certificate_enabled: true,
        level: "all_levels",
        language: "English",
        price: 0,
        currency: "INR",
        is_free: true,
        status: "published",
        enrollment_count: 0,
        rating_avg: 0,
        rating_count: 0,
        created_at: "",
        updated_at: "",
        instructor: { id: "", name: r.instructor_name, email: "", image: null },
      },
    }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// COMPREHENSIVE "MY BOX" DATA AGGREGATOR
// ─────────────────────────────────────────────
export async function getUserMyBoxData(userId: string): Promise<{
  inProgress: CourseEnrollment[];
  completed: CourseEnrollment[];
  saved: LearnBookmark[];
  notes: LearnNote[];
  certificates: Certificate[];
  collections: LearnCollection[];
  matchedJobs: MatchedJobRole[];
}> {
  const [learningData, saved, notes, collections] = await Promise.all([
    getUserMyLearning(userId),
    getUserBookmarks(userId),
    getUserNotes(userId),
    getUserCollections(userId),
  ]);

  // Aggregate user skills from completed courses / certs to match Clinical Opportunities
  const acquiredSkills = new Set<string>();
  for (const cert of learningData.certificates) {
    if (cert.metadata?.skills_acquired && Array.isArray(cert.metadata.skills_acquired)) {
      for (const s of cert.metadata.skills_acquired) acquiredSkills.add(s);
    }
  }

  let matchedJobs: MatchedJobRole[] = [];
  try {
    const jobsRes: any = await sql`
      SELECT 
        j.id, 
        j.title, 
        j.location, 
        j.work_mode,
        j.employment_type as role_type, 
        j.salary_min, 
        j.salary_max, 
        j.salary_currency, 
        o.name as organization
      FROM jobs j
      LEFT JOIN organizations o ON o.id = j.organization_id
      WHERE j.status = 'published'
      ORDER BY j.created_at DESC
      LIMIT 4
    `.execute(database);

    if (jobsRes.rows && jobsRes.rows.length > 0) {
      matchedJobs = jobsRes.rows.map((row: any) => {
        let sal = "Competitive";
        if (row.salary_min && row.salary_max) {
          sal = `₹${(Number(row.salary_min) / 100000).toFixed(0)} - ₹${(Number(row.salary_max) / 100000).toFixed(0)} LPA`;
        } else if (row.salary_min) {
          sal = `₹${(Number(row.salary_min) / 100000).toFixed(0)}+ LPA`;
        }
        return {
          id: row.id,
          title: row.title,
          organization: row.organization || "Healthcare Network",
          location: row.location || "Clinical Hospital",
          role_type: row.role_type || "Full-Time",
          matched_skills: acquiredSkills.size > 0 ? Array.from(acquiredSkills).slice(0, 2) : ["Clinical Practice"],
          salary_range: sal,
        };
      });
    }
  } catch {
    matchedJobs = [];
  }

  return {
    inProgress: learningData.inProgress,
    completed: learningData.completed,
    saved,
    notes,
    certificates: learningData.certificates,
    collections,
    matchedJobs,
  };
}

// ─────────────────────────────────────────────
// GET USER'S ENROLLMENTS & CERTIFICATES (Backward Compat)
// ─────────────────────────────────────────────
export async function getUserMyLearning(userId: string): Promise<{
  inProgress: CourseEnrollment[];
  completed: CourseEnrollment[];
  certificates: Certificate[];
}> {
  const enrollments = await learnDb
    .selectFrom("course_enrollments as ce")
    .innerJoin("courses as c", "c.id", "ce.course_id")
    .innerJoin("user as u", "u.id", "c.instructor_id")
    .select([
      "ce.id as enrollment_id",
      "ce.course_id",
      "ce.enrolled_at",
      "ce.completed_at",
      "ce.status as enrollment_status",
      "ce.progress_percentage",
      "ce.last_lesson_id",
      "ce.last_accessed_at",
      "c.title as course_title",
      "c.slug as course_slug",
      "c.thumbnail as course_thumbnail",
      "c.category as course_category",
      "c.duration_minutes as course_duration",
      "c.certificate_enabled",
      "u.name as instructor_name",
    ])
    .where("ce.user_id", "=", userId)
    .orderBy("ce.last_accessed_at", "desc")
    .execute();

  const certificatesRaw = await learnDb
    .selectFrom("certificates as cert")
    .innerJoin("courses as c", "c.id", "cert.course_id")
    .innerJoin("user as u", "u.id", "c.instructor_id")
    .select([
      "cert.id",
      "cert.certificate_number",
      "cert.user_id",
      "cert.course_id",
      "cert.issued_at",
      "cert.completion_date",
      "cert.verification_code",
      "cert.metadata",
      "cert.status",
      "c.title as course_title",
      "c.slug as course_slug",
      "c.thumbnail as course_thumbnail",
      "u.name as instructor_name",
    ])
    .where("cert.user_id", "=", userId)
    .orderBy("cert.issued_at", "desc")
    .execute();

  const inProgress: CourseEnrollment[] = [];
  const completed: CourseEnrollment[] = [];

  for (const e of enrollments) {
    const item: CourseEnrollment = {
      id: e.enrollment_id,
      course_id: e.course_id,
      user_id: userId,
      enrolled_at: e.enrolled_at.toISOString(),
      completed_at: e.completed_at ? e.completed_at.toISOString() : null,
      status: (e.enrollment_status as any) || "active",
      progress_percentage: Number(e.progress_percentage) || 0,
      last_lesson_id: e.last_lesson_id,
      last_accessed_at: e.last_accessed_at.toISOString(),
      course: {
        id: e.course_id,
        instructor_id: "",
        title: e.course_title,
        slug: e.course_slug,
        thumbnail: e.course_thumbnail,
        category: e.course_category,
        duration_minutes: Number(e.course_duration) || 0,
        certificate_enabled: e.certificate_enabled,
        level: "all_levels",
        language: "English",
        price: 0,
        currency: "INR",
        is_free: true,
        status: "published",
        enrollment_count: 0,
        rating_avg: 0,
        rating_count: 0,
        created_at: "",
        updated_at: "",
        instructor: {
          id: "",
          name: e.instructor_name,
          email: "",
          image: null,
        },
      },
    };

    if (e.enrollment_status === "completed" || e.progress_percentage === 100) {
      completed.push(item);
    } else {
      inProgress.push(item);
    }
  }

  const certificates: Certificate[] = certificatesRaw.map((c) => ({
    id: c.id,
    certificate_number: c.certificate_number,
    user_id: c.user_id,
    course_id: c.course_id,
    issued_at: c.issued_at.toISOString(),
    completion_date: c.completion_date.toISOString(),
    verification_code: c.verification_code,
    metadata: c.metadata,
    status: (c.status as any) || "valid",
    course: {
      id: c.course_id,
      instructor_id: "",
      title: c.course_title,
      slug: c.course_slug,
      thumbnail: c.course_thumbnail,
      category: "",
      duration_minutes: 0,
      certificate_enabled: true,
      level: "all_levels",
      language: "English",
      price: 0,
      currency: "INR",
      is_free: true,
      status: "published",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
      created_at: "",
      updated_at: "",
      instructor: {
        id: "",
        name: c.instructor_name,
        email: "",
        image: null,
      },
    },
  }));

  return { inProgress, completed, certificates };
}

// ─────────────────────────────────────────────
// VERIFIED INSTRUCTORS
// ─────────────────────────────────────────────
export async function getVerifiedInstructors(limit: number = 6): Promise<InstructorProfile[]> {
  try {
    const raw = await learnDb
      .selectFrom("professional_profiles as pp")
      .innerJoin("user as u", "u.id", "pp.user_id")
      .select([
        "pp.user_id as id",
        "u.name",
        "u.email",
        "u.image",
        "pp.profession",
        "pp.specialization",
        "pp.designation",
        "pp.organization",
        "pp.identity_verified",
        "pp.education_verified",
        "pp.registration_verified",
      ])
      .limit(limit)
      .execute();

    if (raw && raw.length > 0) {
      return raw.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        image: r.image,
        profession: r.profession,
        specialization: r.specialization,
        designation: r.designation,
        organization: r.organization,
        identity_verified: Boolean(r.identity_verified),
        education_verified: Boolean(r.education_verified),
        registration_verified: Boolean(r.registration_verified),
      }));
    }
  } catch {
    // fallback
  }

  return [];
}

// ─────────────────────────────────────────────
// INSTRUCTOR ACTIONS (Create / Update Course)
// ─────────────────────────────────────────────
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
  return `${base}-${Math.random().toString(36).substring(2, 7)}`;
}

export async function createCourse(
  instructorId: string,
  input: CreateCourseInput
): Promise<string> {
  const id = generateId();
  const slug = generateSlug(input.title);
  const now = new Date();

  await learnDb
    .insertInto("courses")
    .values({
      id,
      instructor_id: instructorId,
      organization_id: null,
      title: input.title.trim(),
      slug,
      short_description: input.short_description || null,
      description: input.description || null,
      thumbnail: input.thumbnail || null,
      category: input.category,
      subcategory: input.subcategory || null,
      profession: input.profession || null,
      specialization: input.specialization || null,
      level: input.level || "all_levels",
      language: input.language || "English",
      duration_minutes: 0,
      price: input.is_free ? 0 : (input.price || 0),
      discount_price: input.is_free ? null : (input.discount_price || null),
      currency: "INR",
      is_free: input.is_free !== false,
      certificate_enabled: input.certificate_enabled !== false,
      accreditation: input.accreditation || null,
      subscription_tier: input.subscription_tier || null,
      bundle_access: input.bundle_access ?? true,
      status: input.status || "published",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
      published_at: now,
      created_at: now,
      updated_at: now,
    })
    .execute();

  return id;
}

// ─────────────────────────────────────────────
// INSTRUCTOR DASHBOARD: COURSES, COMPLETIONS & CERTIFICATES
// ─────────────────────────────────────────────

export interface InstructorCourseOverviewItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  profession: string | null;
  specialization: string | null;
  level: string | null;
  is_free: boolean;
  price: number;
  currency: string;
  certificate_enabled: boolean;
  status: string;
  thumbnail: string | null;
  duration_minutes: number;
  created_at: string;
  total_enrolled: number;
  completed_count: number;
  in_progress_count: number;
  certificates_issued_count: number;
  completion_rate: number;
}

export interface InstructorLearnerRecord {
  enrollment_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_image: string | null;
  member_id: string | null;
  is_founding_member: boolean;
  profession: string | null;
  specialization: string | null;
  organization: string | null;
  enrolled_at: string;
  completed_at: string | null;
  status: string;
  progress_percentage: number;
  last_accessed_at: string;
  has_certificate: boolean;
  certificate_id: string | null;
  certificate_number: string | null;
  verification_code: string | null;
  certificate_issued_at: string | null;
  certificate_status: string | null;
  certificate_state: "ISSUED" | "PENDING" | "DISABLED";
}

export async function getInstructorCoursesOverview(instructorId: string): Promise<{
  summary: {
    totalCourses: number;
    totalEnrolled: number;
    totalCompleted: number;
    totalCertificatesIssued: number;
    overallCompletionRate: number;
  };
  courses: InstructorCourseOverviewItem[];
}> {
  await ensureLearnExtensions();

  const coursesRaw = await learnDb
    .selectFrom("courses")
    .selectAll()
    .where("instructor_id", "=", instructorId)
    .orderBy("created_at", "desc")
    .execute();

  if (coursesRaw.length === 0) {
    return {
      summary: {
        totalCourses: 0,
        totalEnrolled: 0,
        totalCompleted: 0,
        totalCertificatesIssued: 0,
        overallCompletionRate: 0,
      },
      courses: [],
    };
  }

  const courseIds = coursesRaw.map((c) => c.id);

  // 1. Fetch enrollments aggregated per course
  const enrollmentsRes = await learnDb
    .selectFrom("course_enrollments")
    .select([
      "course_id",
      sql<string>`count(*)`.as("total_count"),
      sql<string>`count(case when status = 'completed' or progress_percentage >= 100 then 1 end)`.as("completed_count"),
      sql<string>`count(case when status != 'completed' and progress_percentage < 100 then 1 end)`.as("in_progress_count"),
    ])
    .where("course_id", "in", courseIds)
    .groupBy("course_id")
    .execute();

  const enrollmentMap = new Map<
    string,
    { total: number; completed: number; inProgress: number }
  >();
  for (const row of enrollmentsRes) {
    enrollmentMap.set(row.course_id, {
      total: parseInt((row as any).total_count || "0", 10),
      completed: parseInt((row as any).completed_count || "0", 10),
      inProgress: parseInt((row as any).in_progress_count || "0", 10),
    });
  }

  // 2. Fetch certificates count per course
  const certsRes = await learnDb
    .selectFrom("certificates")
    .select([
      "course_id",
      sql<string>`count(*)`.as("cert_count"),
    ])
    .where("course_id", "in", courseIds)
    .groupBy("course_id")
    .execute();

  const certMap = new Map<string, number>();
  for (const row of certsRes) {
    certMap.set(row.course_id, parseInt((row as any).cert_count || "0", 10));
  }

  let totalEnrolledAll = 0;
  let totalCompletedAll = 0;
  let totalCertificatesAll = 0;

  const courses: InstructorCourseOverviewItem[] = coursesRaw.map((c) => {
    const enr = enrollmentMap.get(c.id) || { total: 0, completed: 0, inProgress: 0 };
    const certCount = certMap.get(c.id) || 0;
    const completionRate = enr.total > 0 ? Math.round((enr.completed / enr.total) * 100) : 0;

    totalEnrolledAll += enr.total;
    totalCompletedAll += enr.completed;
    totalCertificatesAll += certCount;

    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      profession: c.profession,
      specialization: c.specialization,
      level: c.level,
      is_free: c.is_free,
      price: Number(c.price) || 0,
      currency: c.currency || "INR",
      certificate_enabled: Boolean(c.certificate_enabled),
      status: c.status,
      thumbnail: c.thumbnail,
      duration_minutes: Number(c.duration_minutes) || 0,
      created_at: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
      total_enrolled: enr.total,
      completed_count: enr.completed,
      in_progress_count: enr.inProgress,
      certificates_issued_count: certCount,
      completion_rate: completionRate,
    };
  });

  const overallCompletionRate =
    totalEnrolledAll > 0 ? Math.round((totalCompletedAll / totalEnrolledAll) * 100) : 0;

  return {
    summary: {
      totalCourses: courses.length,
      totalEnrolled: totalEnrolledAll,
      totalCompleted: totalCompletedAll,
      totalCertificatesIssued: totalCertificatesAll,
      overallCompletionRate,
    },
    courses,
  };
}

export async function getCourseStudentsAndCertificates(
  courseId: string,
  instructorId?: string
): Promise<{
  course: {
    id: string;
    title: string;
    category: string;
    certificate_enabled: boolean;
  };
  stats: {
    totalEnrolled: number;
    completedCount: number;
    inProgressCount: number;
    certificatesIssuedCount: number;
    completionRate: number;
  };
  learners: InstructorLearnerRecord[];
}> {
  await ensureLearnExtensions();

  let courseQuery = (learnDb as any)
    .selectFrom("courses")
    .select(["id", "title", "category", "certificate_enabled", "instructor_id"])
    .where("id", "=", courseId);

  if (instructorId) {
    courseQuery = courseQuery.where("instructor_id", "=", instructorId);
  }

  const course = await courseQuery.executeTakeFirst();
  if (!course) {
    throw new Error("Course not found or unauthorized access");
  }

  const learnersRaw: any[] = await (learnDb as any)
    .selectFrom("course_enrollments as ce")
    .innerJoin("user as u", "u.id", "ce.user_id")
    .leftJoin("professional_profiles as pp", "pp.user_id", "u.id")
    .leftJoin("certificates as cert", (join: any) =>
      join.onRef("cert.user_id", "=", "ce.user_id").onRef("cert.course_id", "=", "ce.course_id")
    )
    .select([
      "ce.id as enrollment_id",
      "ce.user_id as user_id",
      "ce.enrolled_at",
      "ce.completed_at",
      "ce.status as enrollment_status",
      "ce.progress_percentage",
      "ce.last_accessed_at",
      "u.name as user_name",
      "u.email as user_email",
      "u.image as user_image",
      "pp.member_id",
      "pp.is_founding_member",
      "pp.profession",
      "pp.specialization",
      "pp.organization",
      "cert.id as certificate_id",
      "cert.certificate_number",
      "cert.verification_code",
      "cert.issued_at as certificate_issued_at",
      "cert.status as certificate_status",
    ])
    .where("ce.course_id", "=", courseId)
    .orderBy("ce.enrolled_at", "desc")
    .execute();

  let completedCount = 0;
  let inProgressCount = 0;
  let certIssuedCount = 0;

  const learners: InstructorLearnerRecord[] = learnersRaw.map((row) => {
    const isCompleted =
      row.enrollment_status === "completed" || Number(row.progress_percentage || 0) >= 100;
    const hasCert = Boolean(row.certificate_id && row.verification_code);

    if (isCompleted) completedCount++;
    else inProgressCount++;

    if (hasCert) certIssuedCount++;

    let certState: "ISSUED" | "PENDING" | "DISABLED" = "PENDING";
    if (!course.certificate_enabled) {
      certState = "DISABLED";
    } else if (hasCert) {
      certState = "ISSUED";
    } else {
      certState = "PENDING";
    }

    return {
      enrollment_id: String(row.enrollment_id || ""),
      user_id: String(row.user_id || ""),
      user_name: String(row.user_name || "Healthcare Learner"),
      user_email: String(row.user_email || ""),
      user_image: row.user_image || null,
      member_id: row.member_id || null,
      is_founding_member: Boolean(row.is_founding_member),
      profession: row.profession || null,
      specialization: row.specialization || null,
      organization: row.organization || null,
      enrolled_at: row.enrolled_at ? new Date(row.enrolled_at).toISOString() : new Date().toISOString(),
      completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : null,
      status: isCompleted ? "completed" : "in_progress",
      progress_percentage: Number(row.progress_percentage) || 0,
      last_accessed_at: row.last_accessed_at
        ? new Date(row.last_accessed_at).toISOString()
        : new Date().toISOString(),
      has_certificate: hasCert,
      certificate_id: row.certificate_id || null,
      certificate_number: row.certificate_number || null,
      verification_code: row.verification_code || null,
      certificate_issued_at: row.certificate_issued_at
        ? new Date(row.certificate_issued_at).toISOString()
        : null,
      certificate_status: row.certificate_status || (hasCert ? "valid" : null),
      certificate_state: certState,
    };
  });

  const totalEnrolled = learners.length;
  const completionRate =
    totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0;

  return {
    course: {
      id: course.id,
      title: course.title,
      category: course.category,
      certificate_enabled: Boolean(course.certificate_enabled),
    },
    stats: {
      totalEnrolled,
      completedCount,
      inProgressCount,
      certificatesIssuedCount: certIssuedCount,
      completionRate,
    },
    learners,
  };
}

// ─────────────────────────────────────────────
// LIVE CLASSROOM EXPORTS
// ─────────────────────────────────────────────
export {
  LiveClassroomRepository,
  ensureLiveClassroomTables,
} from "./live-classroom-db";

