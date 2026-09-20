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
  course?: Course;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CourseFilterParams {
  query?: string;
  category?: string;
  profession?: string;
  specialization?: string;
  level?: string;
  is_free?: boolean;
  certificate_enabled?: boolean;
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
