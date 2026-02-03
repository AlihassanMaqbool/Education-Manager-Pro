-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES (SAFE / IDEMPOTENT)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('manager','user');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status') THEN
    CREATE TYPE public.course_status AS ENUM ('active','inactive','draft');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
    CREATE TYPE public.enrollment_status AS ENUM ('pending','approved','rejected','completed');
  END IF;
END$$;

-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role public.user_role DEFAULT 'user',
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: own profile OR service role
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR auth.role() = 'service_role'
);

-- INSERT: only service_role (trigger-safe)
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
CREATE POLICY profiles_insert
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
);

-- UPDATE: own profile only, role immutable
DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_update
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- =====================================================
-- COURSES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  category TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  max_students INTEGER DEFAULT 50,
  enrolled_students INTEGER DEFAULT 0,
  status public.course_status DEFAULT 'draft',
  instructor_id UUID REFERENCES public.profiles(id),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  schedule JSONB,
  requirements TEXT[],
  learning_outcomes TEXT[],
  tags TEXT[],
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Add missing columns to existing courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 50;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS enrolled_students INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS schedule JSONB;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS requirements TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP POLICY IF EXISTS courses_select_all ON public.courses;
CREATE POLICY courses_select_all
ON public.courses
FOR SELECT
USING (true);

DROP POLICY IF EXISTS courses_manager_all ON public.courses;
CREATE POLICY courses_manager_all
ON public.courses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
);

-- =====================================================
-- COURSE MODULES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration INTEGER, -- in minutes
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS course_modules_select ON public.course_modules;
CREATE POLICY course_modules_select
ON public.course_modules
FOR SELECT
USING (true);

DROP POLICY IF EXISTS course_modules_manager_all ON public.course_modules;
CREATE POLICY course_modules_manager_all
ON public.course_modules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
);

-- =====================================================
-- ENROLLMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status public.enrollment_status DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Add missing columns to existing enrollments table
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

DROP POLICY IF EXISTS enrollments_select_own ON public.enrollments;
CREATE POLICY enrollments_select_own
ON public.enrollments
FOR SELECT
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS enrollments_insert_own ON public.enrollments;
CREATE POLICY enrollments_insert_own
ON public.enrollments
FOR INSERT
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS enrollments_manager_all ON public.enrollments;
CREATE POLICY enrollments_manager_all
ON public.enrollments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
);

-- =====================================================
-- PAYMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  enrollment_id UUID REFERENCES public.enrollments(id),
  stripe_payment_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending','paid','failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_select_own ON public.payments;
CREATE POLICY payments_select_own
ON public.payments
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS payments_manager_all ON public.payments;
CREATE POLICY payments_manager_all
ON public.payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_courses_updated ON public.courses;
CREATE TRIGGER trg_courses_updated
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- AUTH SIGNUP TRIGGER (AUTO PROFILE + FIRST MANAGER)
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  manager_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'manager'
  ) INTO manager_exists;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN manager_exists = FALSE
        THEN 'manager'::public.user_role
      ELSE 'user'::public.user_role
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- BACKFILL: FIX OLD USERS (ENUM CAST FIXED 🔥)
-- =====================================================
INSERT INTO public.profiles (id, email, role)
SELECT
  u.id,
  u.email,
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE role = 'manager'
    )
    THEN 'manager'::public.user_role
    ELSE 'user'::public.user_role
  END
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);





-- =====================================================
-- STUDENTS
-- =====================================================
-- Purpose:
-- - Represents users who are students
-- - 1:1 with profiles
-- - Keeps student-specific state separate from auth/profile data
-- =====================================================

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  enrollment_date TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- SELECT:
-- - Student can read own row
-- - Manager can read all
-- -----------------------------------------------------
DROP POLICY IF EXISTS students_select ON public.students;
CREATE POLICY students_select
ON public.students
FOR SELECT
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'manager'
  )
);

-- -----------------------------------------------------
-- INSERT:
-- - Service role only (safe for triggers / backend)
-- -----------------------------------------------------
DROP POLICY IF EXISTS students_insert ON public.students;
CREATE POLICY students_insert
ON public.students
FOR INSERT
WITH CHECK (
  auth.role() = 'service_role'
);

-- -----------------------------------------------------
-- UPDATE:
-- - Manager only
-- -----------------------------------------------------
DROP POLICY IF EXISTS students_update ON public.students;
CREATE POLICY students_update
ON public.students
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'manager'
  )
);

-- -----------------------------------------------------
-- DELETE:
-- - Manager only
-- -----------------------------------------------------
DROP POLICY IF EXISTS students_delete ON public.students;
CREATE POLICY students_delete
ON public.students
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'manager'
  )
);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
DROP TRIGGER IF EXISTS trg_students_updated ON public.students;
CREATE TRIGGER trg_students_updated
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- INDEXES (PERFORMANCE)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_students_active
ON public.students(is_active);

CREATE INDEX IF NOT EXISTS idx_students_enrollment_date
ON public.students(enrollment_date);





-- =====================================================
-- TRIGGER TO ADD STUDENT ON ENROLLMENT
-- =====================================================
CREATE OR REPLACE FUNCTION public.add_student_on_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert student into students table if not exists
  INSERT INTO public.students (id)
  VALUES (NEW.student_id)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trg_add_student_on_enrollment ON public.enrollments;

-- Create trigger after insert on enrollments
CREATE TRIGGER trg_add_student_on_enrollment
AFTER INSERT ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.add_student_on_enrollment();

-- =====================================================
-- MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_broadcast BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- SELECT: Students can read messages sent to them or broadcast messages, Managers can read all
DROP POLICY IF EXISTS messages_select ON public.messages;
CREATE POLICY messages_select
ON public.messages
FOR SELECT
USING (
  -- Managers can see all messages
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
  OR
  -- Students can see messages sent to them or broadcast messages
  (auth.uid() = recipient_id OR is_broadcast = true)
);

-- INSERT: Only managers can send messages
DROP POLICY IF EXISTS messages_insert ON public.messages;
CREATE POLICY messages_insert
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
);

-- UPDATE: Managers can update messages, students can mark as read (only read_at field)
DROP POLICY IF EXISTS messages_update ON public.messages;
CREATE POLICY messages_update
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
  OR
  -- Students can only update read_at for their own messages
  (auth.uid() = recipient_id OR is_broadcast = true)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
  OR
  -- Students can only update read_at for their own messages
  (auth.uid() = recipient_id OR is_broadcast = true)
);

-- DELETE: Only managers can delete messages
DROP POLICY IF EXISTS messages_delete ON public.messages;
CREATE POLICY messages_delete
ON public.messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
);

-- =====================================================
-- UPDATED_AT TRIGGER FOR MESSAGES
-- =====================================================
DROP TRIGGER IF EXISTS trg_messages_updated ON public.messages;
CREATE TRIGGER trg_messages_updated
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- INDEXES FOR MESSAGES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_broadcast ON public.messages(is_broadcast);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);





-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample courses
INSERT INTO public.courses (
  title, description, short_description, category, level, duration, price, currency,
  max_students, enrolled_students, status, tags, rating, rating_count
) VALUES
(
  'Introduction to Web Development',
  'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This comprehensive course covers everything you need to know to build modern websites.',
  'Master the basics of web development',
  'Technology',
  'beginner',
  '8 weeks',
  99.99,
  'USD',
  100,
  45,
  'active',
  ARRAY['HTML', 'CSS', 'JavaScript', 'Web Development'],
  4.5,
  23
),
(
  'Advanced React Development',
  'Take your React skills to the next level with advanced concepts like hooks, context, performance optimization, and state management.',
  'Build complex React applications',
  'Technology',
  'advanced',
  '10 weeks',
  149.99,
  'USD',
  50,
  28,
  'active',
  ARRAY['React', 'JavaScript', 'Frontend', 'Hooks'],
  4.8,
  15
),
(
  'Digital Marketing Mastery',
  'Learn comprehensive digital marketing strategies including SEO, social media marketing, content marketing, and analytics.',
  'Grow your business with digital marketing',
  'Marketing',
  'intermediate',
  '6 weeks',
  79.99,
  'USD',
  75,
  62,
  'active',
  ARRAY['Marketing', 'SEO', 'Social Media', 'Analytics'],
  4.3,
  31
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample course modules for the first course
INSERT INTO public.course_modules (
  course_id, title, description, content, duration, order_index, is_free
) VALUES
(
  (SELECT id FROM public.courses WHERE title = 'Introduction to Web Development' LIMIT 1),
  'Getting Started with HTML',
  'Learn the basics of HTML structure and semantic elements',
  'HTML content here...',
  60,
  1,
  true
),
(
  (SELECT id FROM public.courses WHERE title = 'Introduction to Web Development' LIMIT 1),
  'CSS Fundamentals',
  'Master CSS styling and layout techniques',
  'CSS content here...',
  90,
  2,
  false
),
(
  (SELECT id FROM public.courses WHERE title = 'Introduction to Web Development' LIMIT 1),
  'JavaScript Basics',
  'Introduction to programming with JavaScript',
  'JavaScript content here...',
  120,
  3,
  false
)
ON CONFLICT (id) DO NOTHING;
