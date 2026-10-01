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
