// ============================================================
// MGN.life Phase 4: Learn Ecosystem — Type Definitions
// modules/learn/types.ts
// ============================================================

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all_levels";
export type CourseStatus = "draft" | "review" | "published" | "archived";
export type LessonType = "video" | "article" | "pdf" | "resource" | "quiz";
export type EnrollmentStatus = "active" | "completed" | "cancelled";
export type CertificateStatus = "valid" | "revoked";
export type QuestionType = "single" | "multiple";
export type LiveSessionStatus = "upcoming" | "live" | "completed" | "cancelled";

export interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  profession?: string | null;
  specialization?: string | null;
  designation?: string | null;
  organization?: string | null;
  identity_verified?: boolean;
  education_verified?: boolean;
  registration_verified?: boolean;
  courses_count?: number;
  students_count?: number;
}

export interface Course {
  id: string;
  instructor_id: string;
  organization_id?: string | null;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  category: string;
  subcategory?: string | null;
  profession?: string | null;
  specialization?: string | null;
  level: CourseLevel;
  language: string;
  duration_minutes: number;
  price: number;
  currency: string;
  is_free: boolean;
  certificate_enabled: boolean;
  status: CourseStatus;
  enrollment_count: number;
  rating_avg: number;
  rating_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  instructor?: InstructorProfile;
  module_count?: number;
  lesson_count?: number;
  user_enrolled?: boolean;
  user_progress?: number;
  user_bookmarked?: boolean;
  skills?: string[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  lessons?: CourseLesson[];
}

export interface CourseResource {
  id: string;
  lesson_id?: string | null;
  course_id: string;
  title: string;
  file_url: string;
  file_type?: string | null;
  file_size_bytes?: number | null;
  created_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description?: string | null;
  lesson_type: LessonType;
  content?: string | null;
  media_url?: string | null;
  duration_seconds: number;
  order_index: number;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
  resources?: CourseResource[];
  quiz?: Quiz;
  completed?: boolean;
  last_position_seconds?: number;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: string;
  completed_at?: string | null;
  status: EnrollmentStatus;
  progress_percentage: number;
  last_lesson_id?: string | null;
  last_accessed_at: string;
  course?: Course;
  certificate?: Certificate;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  progress_percentage: number;
  last_position_seconds: number;
  completed: boolean;
  completed_at?: string | null;
  updated_at: string;
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct?: boolean; // Stripped on client side
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_type: QuestionType;
  explanation?: string | null;
  order_index: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lesson_id?: string | null;
  course_id: string;
  title: string;
  description?: string | null;
  passing_score: number;
  time_limit_minutes: number;
  max_attempts: number;
  status: string;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
  user_attempts_count?: number;
  user_passed?: boolean;
}

export interface QuizAttempt {
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
  submitted_at: string;
}

export interface CertificateMetadata {
  student_name: string;
  student_email?: string;
  student_profession?: string;
  course_title: string;
  instructor_name: string;
  instructor_designation?: string;
  instructor_organization?: string;
  duration_minutes: number;
  completion_date: string;
  skills_acquired?: string[];
}

export interface Certificate {
  id: string;
  certificate_number: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  completion_date: string;
  verification_code: string;
  metadata?: CertificateMetadata | null;
  status: CertificateStatus;
  is_public_profile?: boolean;
  course?: Course;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ─────────────────────────────────────────────
// NEW ECOSYSTEM MODELS: LEARNING PATHS, LIVE SESSIONS, NOTES, COLLECTIONS
// ─────────────────────────────────────────────

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  profession?: string | null;
  level: CourseLevel;
  duration_hours: number;
  course_count: number;
  enrolled_count: number;
  thumbnail?: string | null;
  badge_title?: string | null;
  courses?: Course[];
  user_enrolled?: boolean;
  user_progress?: number;
  created_at: string;
}

export interface LiveSession {
  id: string;
  instructor_id: string;
  title: string;
  description?: string | null;
  category: string;
  specialty?: string | null;
  scheduled_at: string;
  duration_minutes: number;
  meeting_url?: string | null;
  thumbnail?: string | null;
  max_participants?: number | null;
  registered_count: number;
  status: LiveSessionStatus;
  instructor?: InstructorProfile;
  user_registered?: boolean;
  created_at: string;
}

export interface LearnNote {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  note_text: string;
  timestamp_seconds?: number | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
  course_title?: string;
  lesson_title?: string;
}

export interface LearnCollection {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  color?: string;
  item_count: number;
  created_at: string;
  updated_at: string;
  courses?: Course[];
}

export interface LearnBookmark {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string | null;
  created_at: string;
  course?: Course;
}

export interface MatchedJobRole {
  id: string;
  title: string;
  organization: string;
  location: string;
  role_type: string;
  matched_skills: string[];
  salary_range?: string;
}

// ─────────────────────────────────────────────
// FILTER & INPUT INTERFACES
// ─────────────────────────────────────────────

export interface CourseFilterParams {
  query?: string;
  category?: string;
  profession?: string;
  specialization?: string;
  level?: string;
  format?: string; // 'all' | 'video' | 'article' | 'quiz'
  duration?: string; // 'all' | 'under_1h' | '1h_3h' | '3h_6h' | 'over_6h'
  is_free?: boolean;
  certificate_enabled?: boolean;
  language?: string;
  sort?: "popular" | "newest" | "rating" | "duration";
  page?: number;
  pageSize?: number;
}

export interface CreateCourseInput {
  title: string;
  short_description?: string;
  description?: string;
  thumbnail?: string;
  category: string;
  subcategory?: string;
  profession?: string;
  specialization?: string;
  level?: CourseLevel;
  language?: string;
  price?: number;
  is_free?: boolean;
  certificate_enabled?: boolean;
}

export interface SubmitQuizAnswerInput {
  question_id: string;
  selected_option_ids: string[];
}

// ─────────────────────────────────────────────
// ASK AI CHAT ENGINE TYPES
// ─────────────────────────────────────────────

export interface AskAIContext {
  courseId?: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  lessonContent?: string;
  specialty?: string;
  timestampSeconds?: number;
  selectedText?: string;
  transcriptExcerpt?: string;
}

export interface AskAIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  action_type?: "explanation" | "notes" | "quiz" | "case_reasoning" | "general";
  quiz_payload?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

// ─────────────────────────────────────────────
// MGN PRODUCTION VIDEO LECTURE SYSTEM TYPES
// ─────────────────────────────────────────────

export type VideoProcessingStatus =
  | "UPLOADING"
  | "UPLOADED"
  | "SCANNING"
  | "PROCESSING"
  | "ENCODING"
  | "GENERATING_THUMBNAIL"
  | "GENERATING_TRANSCRIPT"
  | "READY"
  | "PROCESSING_FAILED"
  | "ENCODING_FAILED"
  | "TRANSCRIPT_FAILED";

export type VideoQuality = "auto" | "360p" | "480p" | "720p" | "1080p" | "audio";

export type VideoEventType =
  | "PLAY"
  | "PAUSE"
  | "SEEK"
  | "PROGRESS"
  | "BUFFER"
  | "COMPLETE"
  | "EXIT";

export interface VideoAsset {
  id: string;
  instructor_id: string;
  course_id?: string | null;
  lesson_id?: string | null;
  title: string;
  original_filename?: string | null;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  storage_key?: string | null;
  status: VideoProcessingStatus;
  duration_seconds: number;
  aspect_ratio: string;
  width: number;
  height: number;
  is_private: boolean;
  thumbnail_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface VideoVariant {
  id: string;
  video_asset_id: string;
  quality: VideoQuality;
  codec?: string | null;
  bitrate?: number | null;
  resolution?: string | null;
  url?: string;
  storage_key: string;
  file_size_bytes?: number | null;
  is_ready: boolean;
  created_at: string;
}

export interface VideoChapter {
  id: string;
  video_asset_id?: string | null;
  lesson_id: string;
  title: string;
  start_seconds: number;
  end_seconds?: number | null;
  order_index: number;
  created_at: string;
}

export interface VideoTranscriptCue {
  id?: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export interface VideoTranscript {
  id: string;
  video_asset_id?: string | null;
  lesson_id: string;
  language: string;
  cues: VideoTranscriptCue[];
  is_auto_generated: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoCaption {
  id: string;
  video_asset_id?: string | null;
  lesson_id: string;
  language: string;
  label: string;
  vtt_url?: string | null;
  vtt_content?: string | null;
  is_default: boolean;
  created_at: string;
}

export interface VideoDiscussion {
  id: string;
  lesson_id: string;
  course_id: string;
  user_id: string;
  parent_id?: string | null;
  timestamp_seconds?: number | null;
  message: string;
  is_instructor_answer: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    image?: string | null;
    profession?: string | null;
    specialization?: string | null;
    is_instructor?: boolean;
  };
  replies?: VideoDiscussion[];
}

export interface VideoBookmarkItem {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  timestamp_seconds: number;
  title?: string | null;
  note?: string | null;
  created_at: string;
}

export interface VideoPlaybackSession {
  playbackToken: string;
  expiresAt: string;
  asset?: VideoAsset;
  streamUrl: string;
  variants: {
    quality: VideoQuality;
    label: string;
    url: string;
    bitrate?: number;
    resolution?: string;
  }[];
  chapters: VideoChapter[];
  transcript?: VideoTranscript | null;
  captions: VideoCaption[];
  lastPositionSeconds: number;
  completionWatchRatioRequired: number; // e.g. 0.8 (80%)
  seekPolicy: "free" | "strict_unwatched";
}

export interface VideoAnalyticsRetentionPoint {
  percentile: number; // 0 to 100
  time_seconds: number;
  retention_percentage: number;
  drop_off_count: number;
}

export interface VideoAnalyticsSummary {
  lesson_id: string;
  lesson_title: string;
  duration_seconds: number;
  total_views: number;
  unique_learners: number;
  avg_watch_time_seconds: number;
  completion_rate_percentage: number;
  retention_curve: VideoAnalyticsRetentionPoint[];
  rewatch_hotspots: { start_seconds: number; end_seconds: number; intensity: number }[];
  most_bookmarked_timestamps: { timestamp_seconds: number; count: number }[];
  most_discussed_timestamps: { timestamp_seconds: number; count: number }[];
}
