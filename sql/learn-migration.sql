-- ============================================================
-- MGN.life Phase 4: Learn Ecosystem — Database Migration
-- sql/learn-migration.sql
-- ============================================================

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  instructor_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  organization_id TEXT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  thumbnail TEXT,
  category VARCHAR(64) NOT NULL,
  subcategory VARCHAR(64),
  profession VARCHAR(64),
  specialization VARCHAR(64),
  level VARCHAR(32) DEFAULT 'all_levels',
  language VARCHAR(32) DEFAULT 'English',
  duration_minutes INTEGER DEFAULT 0,
  price NUMERIC(10, 2) DEFAULT 0,
  currency VARCHAR(8) DEFAULT 'INR',
  is_free BOOLEAN DEFAULT true,
  certificate_enabled BOOLEAN DEFAULT true,
  status VARCHAR(32) DEFAULT 'published',
  enrollment_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_profession ON courses(profession);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- 2. Course Modules Table
CREATE TABLE IF NOT EXISTS course_modules (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);

-- 3. Course Lessons Table
CREATE TABLE IF NOT EXISTS course_lessons (
  id VARCHAR(64) PRIMARY KEY,
  module_id VARCHAR(64) NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lesson_type VARCHAR(32) NOT NULL DEFAULT 'video', -- 'video' | 'article' | 'pdf' | 'resource' | 'quiz'
  content TEXT,
  media_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);

-- 4. Course Resources Table
CREATE TABLE IF NOT EXISTS course_resources (
  id VARCHAR(64) PRIMARY KEY,
  lesson_id VARCHAR(64) REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(32),
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_resources_lesson_id ON course_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);

-- 5. Course Enrollments Table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(32) DEFAULT 'active', -- 'active' | 'completed' | 'cancelled'
  progress_percentage INTEGER DEFAULT 0,
  last_lesson_id VARCHAR(64),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_course_user_enrollment UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

-- 6. Lesson Progress Table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id VARCHAR(64) PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  lesson_id VARCHAR(64) NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);

-- 7. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(64) PRIMARY KEY,
  lesson_id VARCHAR(64) REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  status VARCHAR(32) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);

-- 8. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(64) PRIMARY KEY,
  quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type VARCHAR(32) DEFAULT 'single', -- 'single' | 'multiple'
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- 9. Quiz Options Table
CREATE TABLE IF NOT EXISTS quiz_options (
  id VARCHAR(64) PRIMARY KEY,
  question_id VARCHAR(64) NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);

-- 10. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id VARCHAR(64) PRIMARY KEY,
  quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  passed BOOLEAN NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_user ON quiz_attempts(quiz_id, user_id);

-- 11. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(64) PRIMARY KEY,
  certificate_number VARCHAR(64) NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  completion_date TIMESTAMPTZ DEFAULT NOW(),
  verification_code VARCHAR(64) NOT NULL UNIQUE,
  metadata JSONB,
  status VARCHAR(32) DEFAULT 'valid',
  CONSTRAINT uq_user_course_certificate UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);
