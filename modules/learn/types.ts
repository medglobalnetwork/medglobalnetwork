// ============================================================
// MGN.life Phase 4: Learn Ecosystem — Type Definitions
// modules/learn/types.ts
// ============================================================

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all_levels";
export type CourseStatus = "draft" | "review" | "published" | "archived";
export type LessonType = "video" | "article" | "pdf" | "resource" | "quiz";
export type EnrollmentStatus = "active" | "completed" | "cancelled";
export type CertificateStatus = "valid" | "revoked";
export type QuestionType = "single" | "multiple" | "case_study" | "subjective";
export type LiveSessionStatus =
  | "draft"
  | "scheduled"
  | "registration_open"
  | "upcoming"
  | "live"
  | "ended"
  | "processing_recording"
  | "recording_ready"
  | "completed"
  | "cancelled";

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
  discount_price?: number | null;
  currency: string;
  is_free: boolean;
  certificate_enabled: boolean;
  accreditation?: string | null;
  subscription_tier?: "standard" | "premium" | "all_access" | null;
  bundle_access?: boolean;
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
  is_correct?: boolean; // Stripped on client side when taking quiz
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_type: QuestionType;
  case_vignette?: string | null;
  explanation?: string | null;
  order_index: number;
  points?: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lesson_id?: string | null;
  course_id: string;
  title: string;
  description?: string | null;
  test_type?: "quiz" | "exam" | "clinical_case_study";
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
  time_taken_seconds?: number | null;
  submitted_at: string;
  evaluated_at?: string | null;
  evaluated_by?: string | null;
  instructor_feedback?: string | null;
  status?: "evaluated" | "pending_manual_evaluation";
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
  discount_price?: number;
  is_free?: boolean;
  certificate_enabled?: boolean;
  accreditation?: string;
  subscription_tier?: "standard" | "premium" | "all_access";
  bundle_access?: boolean;
  status?: CourseStatus;
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

export type {
  LiveSessionLifecycle,
  LiveParticipantRole,
  LivePresenceStatus,
  HandRaiseStatus,
  VoiceDoubtStatus,
  PollStatus,
  LiveSessionRecord,
  LiveSessionSettingsRecord,
  LiveChatMessageRecord,
  LiveHandRaiseRecord,
  LiveSpeakerRecord,
  LiveVoiceDoubtRecord,
  LiveQuestionRecord,
  LivePollRecord,
  LivePollOptionRecord,
  LivePresenceRecord,
  LiveAttendanceRecord,
  LiveResourceRecord,
  LiveNoteRecord,
  LiveWhiteboardRecord,
  LiveRecordingRecord,
} from "./lib/live-classroom-db";

// ─────────────────────────────────────────────
// MGN LEARNING CONTENT & RESOURCE PLATFORM TYPES
// ─────────────────────────────────────────────

export type ResourceType =
  | "pdf"
  | "image"
  | "notes"
  | "presentation"
  | "document"
  | "case_study"
  | "infographic"
  | "audio"
  | "link";

export type ResourceLifecycleStatus =
  | "UPLOAD"
  | "VALIDATING"
  | "SCANNING"
  | "PROCESSING"
  | "READY"
  | "DRAFT"
  | "PUBLISHED"
  | "ACTIVE"
  | "UPDATED"
  | "ARCHIVED"
  | "PROCESSING_FAILED"
  | "SCAN_FAILED"
  | "REJECTED"
  | "QUARANTINED";

export type ResourceAccessDurationType =
  | "lifetime"
  | "while_enrolled"
  | "until_date"
  | "custom_days";

export interface ResourcePermission {
  id?: string;
  resource_id?: string | null;
  course_id?: string | null;
  module_id?: string | null;
  lesson_id?: string | null;
  allow_view: boolean;
  allow_download: boolean;
  allow_print: boolean;
  allow_copy: boolean;
  allow_offline: boolean;
  access_duration_type: ResourceAccessDurationType;
  access_valid_until?: string | null;
  access_days?: number | null;
}

export interface ResourceVersion {
  id: string;
  resource_id: string;
  version_number: number;
  storage_key?: string | null;
  file_url?: string | null;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  change_note?: string | null;
  native_content?: string | null;
  created_by: string;
  status: "draft" | "published" | "archived";
  created_at: string;
}

export interface ResourceNativeNoteSection {
  id: string;
  type:
    | "heading"
    | "paragraph"
    | "clinical_callout"
    | "warning"
    | "protocol_table"
    | "reference"
    | "key_takeaway"
    | "diagram";
  title?: string;
  content: string;
  meta?: any;
}

export interface ResourceNativeNotePayload {
  title: string;
  subtitle?: string;
  author?: string;
  lastEdited?: string;
  sections: ResourceNativeNoteSection[];
}

export interface LearningResource {
  id: string;
  instructor_id: string;
  course_id?: string | null;
  module_id?: string | null;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  resource_type: ResourceType;
  category: string;
  tags?: string[];
  status: ResourceLifecycleStatus;
  current_version: number;
  file_url?: string | null;
  storage_key?: string | null;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  original_filename?: string | null;
  page_count?: number | null;
  duration_seconds?: number | null;
  dimensions?: { width: number; height: number } | null;
  thumbnail_url?: string | null;
  is_pinned: boolean;
  is_public: boolean;
  copyright_declared: boolean;
  native_content?: ResourceNativeNotePayload | null;
  available_from?: string | null;
  available_until?: string | null;
  created_at: string;
  updated_at: string;
  instructor?: InstructorProfile;
  permissions?: ResourcePermission;
  effective_policy?: {
    canView: boolean;
    canDownload: boolean;
    canPrint: boolean;
    canCopy: boolean;
    canOffline: boolean;
    reason?: string;
  };
  is_bookmarked?: boolean;
}

export interface ResourceAccessSession {
  id: string;
  sessionToken: string;
  resourceId: string;
  accessType: "VIEW" | "DOWNLOAD" | "OFFLINE";
  expiresAt: string;
  signedUrl?: string | null;
  permissions: {
    allowView: boolean;
    allowDownload: boolean;
    allowPrint: boolean;
    allowCopy: boolean;
    allowOffline: boolean;
  };
}

export interface ResourceAnalyticsSummary {
  resource_id: string;
  title: string;
  resource_type: ResourceType;
  total_views: number;
  unique_viewers: number;
  avg_view_duration_seconds: number;
  total_downloads: number;
  unique_downloaders: number;
  total_bookmarks: number;
  avg_reading_depth_page: number;
  views_by_day: { date: string; count: number }[];
  downloads_by_day: { date: string; count: number }[];
}

// ─────────────────────────────────────────────
// BATCHES & LIVE CLASS TIMINGS
// ─────────────────────────────────────────────

export interface BatchStudent {
  id: string;
  batch_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_image?: string | null;
  enrolled_at: string;
  status: "active" | "completed" | "dropped";
  progress_percentage?: number;
  notes?: string | null;
}

export interface BatchAnnouncement {
  id: string;
  batch_id: string;
  instructor_id: string;
  title: string;
  content: string;
  priority: "normal" | "high" | "urgent";
  created_at: string;
}

export interface Batch {
  id: string;
  course_id: string;
  course_title?: string;
  instructor_id: string;
  name: string;
  code: string;
  description?: string | null;
  max_capacity: number;
  enrolled_count: number;
  start_date?: string | null;
  end_date?: string | null;
  schedule_info?: string | null;
  meeting_url?: string | null;
  status: "upcoming" | "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
  students?: BatchStudent[];
  announcements?: BatchAnnouncement[];
}

// ─────────────────────────────────────────────
// INSTRUCTOR PROFILE & PAYOUT SETTINGS
// ─────────────────────────────────────────────

export interface InstructorProfileSettings {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  image?: string | null;
  designation?: string | null;
  affiliation?: string | null;
  registration_number?: string | null;
  bio?: string | null;
  office_hours?: string | null;
  qualifications?: string[] | string | null;
  credentials_doc_url?: string | null;
  notify_email: boolean;
  notify_batch_activity: boolean;
  notify_test_submissions: boolean;
  payout_upi_id?: string | null;
  payout_bank_name?: string | null;
  payout_account_holder?: string | null;
  payout_account_number?: string | null;
  payout_ifsc_code?: string | null;
  payout_currency: string;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────
// TEST PAPER SUBMISSIONS & MANUAL EVALUATION
// ─────────────────────────────────────────────

export interface TestSubmissionAnswerDetail {
  id: string;
  attempt_id: string;
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  case_vignette?: string | null;
  selected_option_ids?: string[];
  text_answer?: string | null;
  correct_option_ids?: string[];
  options?: { id: string; option_text: string; is_correct: boolean }[];
  is_correct?: boolean | null;
  points_awarded?: number | null;
  max_points?: number;
  feedback?: string | null;
  explanation?: string | null;
}

export interface TestPaperSubmission {
  id: string;
  quiz_id: string;
  quiz_title: string;
  course_id: string;
  course_title: string;
  user_id: string;
  student_name: string;
  student_email: string;
  student_image?: string | null;
  score: number;
  percentage: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  attempt_number: number;
  time_taken_seconds?: number | null;
  submitted_at: string;
  evaluated_at?: string | null;
  evaluated_by?: string | null;
  instructor_feedback?: string | null;
  status: "evaluated" | "pending_manual_evaluation";
  answers?: TestSubmissionAnswerDetail[];
}

// ─────────────────────────────────────────────
// STUDENT LEARNING WORKSPACE TYPES (PHASE 5 / PRODUCTION)
// ─────────────────────────────────────────────

export type QuestionDifficulty = "easy" | "medium" | "hard" | "all";
export type StudentMCQType =
  | "single"
  | "multiple"
  | "true_false"
  | "image"
  | "case_based"
  | "clinical_scenario"
  | "assertion_reason"
  | "match_based";

export interface PracticeOption {
  id: string;
  option_text: string;
  is_correct?: boolean; // Stripped or revealed based on review mode
  explanation?: string;
  order_index: number;
}

export interface PracticeQuestion {
  id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: QuestionDifficulty;
  question_type: StudentMCQType;
  question_text: string;
  case_vignette?: string;
  image_url?: string;
  explanation: string;
  reference?: string;
  author_name?: string;
  is_verified: boolean;
  options: PracticeOption[];
}

export interface PracticeAnswer {
  question_id: string;
  selected_option_ids: string[];
  is_correct?: boolean;
  is_marked_for_review?: boolean;
  time_spent_seconds?: number;
}

export interface TopicPerformanceBreakdown {
  topic: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface DifficultyPerformanceBreakdown {
  difficulty: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface PracticeAttempt {
  id: string;
  user_id: string;
  mode: "practice" | "topic" | "weak_areas" | "mock_test" | "custom";
  subject: string;
  topic?: string;
  difficulty?: string;
  total_questions: number;
  score: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  skipped_count: number;
  time_taken_seconds: number;
  time_limit_minutes?: number;
  completed: boolean;
  submitted_at: string;
  topic_breakdown?: TopicPerformanceBreakdown[];
  difficulty_breakdown?: DifficultyPerformanceBreakdown[];
  weak_topics?: string[];
  strong_topics?: string[];
  answers?: PracticeAnswer[];
  questions?: PracticeQuestion[];
}

export interface WeakTopicRecord {
  subject: string;
  topic: string;
  total_attempted: number;
  total_correct: number;
  accuracy: number;
  last_practiced_at: string;
  is_weak: boolean;
  recommendations?: {
    revision_notes_count: number;
    mind_map_id?: string;
    mind_map_title?: string;
    lecture_id?: string;
    lecture_title?: string;
    mcq_practice_topic: string;
  };
}

export interface QuestionBankItem {
  id: string;
  title: string;
  slug: string;
  subject: string;
  topics: string[];
  question_count: number;
  difficulty: QuestionDifficulty | "mixed";
  creator_name: string;
  creator_id?: string;
  is_verified: boolean;
  access: "FREE" | "PAID";
  price?: number;
  currency?: string;
  description?: string;
  bookmark_count: number;
  is_bookmarked?: boolean;
  created_at: string;
}

export interface MockTestItem {
  id: string;
  title: string;
  description?: string;
  subject: string;
  duration_minutes: number;
  total_questions: number;
  passing_percentage: number;
  access: "FREE" | "PAID";
  attempts_count: number;
  is_active: boolean;
  created_at: string;
}

export interface SavedQuestionRecord {
  id: string;
  user_id: string;
  question_id: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  question?: PracticeQuestion;
}

// ─────────────────────────────────────────────
// MIND MAPS
// ─────────────────────────────────────────────

export type MindMapCategory =
  | "Anatomy"
  | "Physiology"
  | "Pathology"
  | "Pharmacology"
  | "Clinical Concepts"
  | "Procedures"
  | "Exam Revision"
  | "Course Specific";

export interface MindMapNodeItem {
  id: string;
  mind_map_id: string;
  parent_id?: string | null;
  label: string;
  description?: string | null;
  node_type: "root" | "branch" | "leaf" | "clinical";
  color?: string;
  icon?: string;
  order_index: number;
  linked_lecture_id?: string | null;
  linked_lecture_title?: string | null;
  linked_mcq_topic?: string | null;
  linked_note_id?: string | null;
  is_expanded?: boolean;
  children?: MindMapNodeItem[];
}

export interface MindMapEdgeItem {
  id: string;
  mind_map_id: string;
  source_id: string;
  target_id: string;
  label?: string | null;
  edge_type?: string;
}

export interface MindMapItem {
  id: string;
  title: string;
  slug: string;
  category: MindMapCategory | string;
  subject: string;
  topic: string;
  description?: string | null;
  root_nodes?: MindMapNodeItem[];
  edges?: MindMapEdgeItem[];
  creator_name: string;
  creator_role?: string;
  is_verified: boolean;
  is_public: boolean;
  access: "FREE" | "PAID";
  price?: number;
  bookmarks_count: number;
  is_bookmarked?: boolean;
  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────
// MEDICAL BOOKS & EBOOK READER
// ─────────────────────────────────────────────

export interface BookTableOfContentsItem {
  title: string;
  page: number;
  level?: number;
}

export interface BookItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  publisher?: string | null;
  cover_url?: string | null;
  file_url?: string | null;
  description?: string | null;
  category: string;
  subject: string;
  page_count: number;
  isbn?: string | null;
  access: "FREE" | "PAID" | "SUBSCRIPTION";
  price: number;
  discount_price?: number | null;
  currency: string;
  is_licensed: boolean;
  rating_avg: number;
  rating_count: number;
  reads_count: number;
  table_of_contents?: BookTableOfContentsItem[];
  user_has_access?: boolean;
  user_progress?: {
    current_page: number;
    total_pages: number;
    percentage: number;
    last_read_at: string;
  };
  is_saved?: boolean;
  created_at: string;
}

export interface BookBookmarkItem {
  id: string;
  book_id: string;
  user_id: string;
  page_number: number;
  note?: string | null;
  highlight_text?: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────
// STUDENT NOTES & SHARED NOTES FEED
// ─────────────────────────────────────────────

export type StudentNoteType =
  | "Course Notes"
  | "Lecture Notes"
  | "Subject Notes"
  | "Revision Notes"
  | "Exam Notes"
  | "Clinical Notes"
  | "Mind Map Notes"
  | "Personal Notes";

export type NoteVisibility =
  | "only_me"
  | "connections"
  | "followers"
  | "community"
  | "public";

export interface NoteAttachmentItem {
  id: string;
  name: string;
  url: string;
  file_type: string;
  size_bytes?: number;
}

export interface StudentNoteItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  note_type: StudentNoteType;
  course_id?: string | null;
  course_title?: string | null;
  lesson_id?: string | null;
  lesson_title?: string | null;
  timestamp_seconds?: number | null;
  subject?: string | null;
  topic?: string | null;
  tags: string[];
  attachments?: NoteAttachmentItem[];
  visibility: NoteVisibility;
  copyright_declared: boolean;
  moderation_status: "pending" | "approved" | "rejected";
  views_count: number;
  saves_count: number;
  shares_count: number;
  is_saved?: boolean;
  is_shared?: boolean;
  author_name?: string;
  author_profession?: string;
  author_image?: string | null;
  author_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteCommentItem {
  id: string;
  note_id: string;
  user_id: string;
  user_name: string;
  user_image?: string | null;
  user_profession?: string | null;
  content: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// STUDENT MY BOX & CUSTOM COLLECTIONS
// ─────────────────────────────────────────────

export interface CollectionItemEntry {
  id: string;
  collection_id: string;
  item_type:
    | "course"
    | "lesson"
    | "book"
    | "note"
    | "mind_map"
    | "question_bank"
    | "question";
  item_id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  added_at: string;
}

export interface StudentCollectionItem {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  color?: string;
  is_public: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
  items?: CollectionItemEntry[];
}

// ─────────────────────────────────────────────
// STUDENT DASHBOARD & RECOMMENDATION ENGINE
// ─────────────────────────────────────────────

export interface RecommendationFeedSection {
  category: string;
  title: string;
  subtitle?: string;
  reason?: string;
  items: Course[];
}

export interface StudentDashboardData {
  continue_learning: CourseEnrollment[];
  recommendations: RecommendationFeedSection[];
  upcoming_lectures: LiveSession[];
  enrolled_summary: {
    in_progress_count: number;
    completed_count: number;
    total_enrolled: number;
    average_progress: number;
    learning_streak_days: number;
  };
  weak_topics: WeakTopicRecord[];
  recent_resources: {
    notes: StudentNoteItem[];
    books: BookItem[];
    mind_maps: MindMapItem[];
  };
  community_notes: StudentNoteItem[];
}

export interface StudentCalendarEvent {
  id: string;
  title: string;
  event_type:
    | "live_lecture"
    | "live_class"
    | "workshop"
    | "webinar"
    | "exam"
    | "quiz_deadline"
    | "assignment"
    | "study_reminder";
  scheduled_at: string;
  end_at?: string;
  instructor_name?: string;
  instructor_image?: string;
  course_id?: string;
  course_title?: string;
  meeting_url?: string;
  status?: string;
}


