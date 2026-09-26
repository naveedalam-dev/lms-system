-- ============================================================
-- LMS Complete Schema Migration
-- ============================================================

-- ENUMS
CREATE TYPE public.user_role AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT');
CREATE TYPE public.attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE public.submission_status AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'LATE');
CREATE TYPE public.grade_tier AS ENUM ('KG_4', 'MID_5_7', 'UPPER_8_10');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Profiles (linked to Supabase Auth)
CREATE TABLE public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  role public.user_role default 'STUDENT'::public.user_role not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Academic Years
CREATE TABLE public.academic_years (
  id uuid default gen_random_uuid() primary key,
  name text not null,           -- e.g. "2024-2025"
  start_date date not null,
  end_date date not null,
  is_active boolean default false,
  created_at timestamptz default now() not null
);
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

-- Grades (Grade 1 - 10, KG1, KG2, etc.)
CREATE TABLE public.grades (
  id uuid default gen_random_uuid() primary key,
  name text not null,           -- e.g. "Grade 5", "KG1"
  tier public.grade_tier not null,
  sort_order int not null,
  created_at timestamptz default now() not null
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Sections/Classes (e.g. "Grade 5 - Section A")
CREATE TABLE public.sections (
  id uuid default gen_random_uuid() primary key,
  grade_id uuid references public.grades(id) on delete cascade not null,
  academic_year_id uuid references public.academic_years(id) on delete cascade not null,
  name text not null,           -- e.g. "Section A"
  room text,
  capacity int default 30,
  created_at timestamptz default now() not null
);
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Subjects
CREATE TABLE public.subjects (
  id uuid default gen_random_uuid() primary key,
  name text not null,           -- e.g. "Mathematics", "Science"
  code text unique not null,    -- e.g. "MATH101"
  description text,
  color text default '#3B82F6', -- for UI color coding
  created_at timestamptz default now() not null
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Student Profiles (extended info)
CREATE TABLE public.student_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  roll_number text unique,
  date_of_birth date,
  gender text,
  address text,
  guardian_name text,
  guardian_phone text,
  grade_id uuid references public.grades(id),
  section_id uuid references public.sections(id),
  academic_year_id uuid references public.academic_years(id),
  created_at timestamptz default now() not null
);
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Teacher Profiles (extended info)
CREATE TABLE public.teacher_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  employee_id text unique,
  qualification text,
  specialization text,
  date_of_joining date,
  created_at timestamptz default now() not null
);
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Teacher-Subject-Section assignments
CREATE TABLE public.teacher_assignments (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  section_id uuid references public.sections(id) on delete cascade not null,
  academic_year_id uuid references public.academic_years(id) on delete cascade not null,
  is_class_teacher boolean default false,
  created_at timestamptz default now() not null,
  UNIQUE(teacher_id, subject_id, section_id, academic_year_id)
);
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE public.attendance (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  section_id uuid references public.sections(id) on delete cascade not null,
  subject_id uuid references public.subjects(id),
  date date not null,
  status public.attendance_status default 'PRESENT' not null,
  marked_by uuid references public.profiles(id) not null,
  remarks text,
  created_at timestamptz default now() not null,
  UNIQUE(student_id, section_id, date, subject_id)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- COURSES & MATERIALS
-- ============================================================
CREATE TABLE public.course_materials (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  section_id uuid references public.sections(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  description text,
  file_url text,
  material_type text default 'document', -- 'document', 'video', 'link', 'image'
  is_published boolean default true,
  created_at timestamptz default now() not null
);
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ASSIGNMENTS & SUBMISSIONS
-- ============================================================
CREATE TABLE public.assignments (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  section_id uuid references public.sections(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  title text not null,
  description text,
  due_date timestamptz not null,
  total_marks int default 100,
  is_published boolean default true,
  created_at timestamptz default now() not null
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.submissions (
  id uuid default gen_random_uuid() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  file_url text,
  remarks text,
  status public.submission_status default 'PENDING' not null,
  marks_obtained numeric(5,2),
  feedback text,
  submitted_at timestamptz,
  graded_at timestamptz,
  graded_by uuid references public.profiles(id),
  created_at timestamptz default now() not null,
  UNIQUE(assignment_id, student_id)
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- GRADEBOOK
-- ============================================================
CREATE TABLE public.exam_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,           -- e.g. "Mid-Term", "Final", "Quiz"
  weight numeric(5,2) default 100, -- percentage weight
  created_at timestamptz default now() not null
);
ALTER TABLE public.exam_types ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.grades_records (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  section_id uuid references public.sections(id) on delete cascade not null,
  exam_type_id uuid references public.exam_types(id) on delete cascade not null,
  academic_year_id uuid references public.academic_years(id) on delete cascade not null,
  marks_obtained numeric(5,2) not null,
  total_marks numeric(5,2) default 100,
  remarks text,
  recorded_by uuid references public.profiles(id) not null,
  created_at timestamptz default now() not null,
  UNIQUE(student_id, subject_id, section_id, exam_type_id, academic_year_id)
);
ALTER TABLE public.grades_records ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE public.announcements (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  target_role public.user_role,  -- null = all, or specific role
  section_id uuid references public.sections(id), -- null = school-wide
  is_published boolean default true,
  created_at timestamptz default now() not null
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info',     -- 'info', 'warning', 'success', 'error'
  is_read boolean default false,
  link text,
  created_at timestamptz default now() not null
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TIMETABLE
-- ============================================================
CREATE TABLE public.timetable (
  id uuid default gen_random_uuid() primary key,
  section_id uuid references public.sections(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  day_of_week int not null,     -- 0=Mon, 1=Tue ... 4=Fri
  start_time time not null,
  end_time time not null,
  room text,
  academic_year_id uuid references public.academic_years(id) not null,
  created_at timestamptz default now() not null
);
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- profiles: users can read all, update own
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','SCHOOL_ADMIN'))
);

-- academic_years: all authenticated can read
CREATE POLICY "Authenticated read academic years" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage academic years" ON public.academic_years FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','SCHOOL_ADMIN'))
);

-- grades: all authenticated can read
CREATE POLICY "Authenticated read grades" ON public.grades FOR SELECT TO authenticated USING (true);

-- sections: all authenticated can read
CREATE POLICY "Authenticated read sections" ON public.sections FOR SELECT TO authenticated USING (true);

-- subjects: all authenticated can read
CREATE POLICY "Authenticated read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);

-- student_profiles: own data + teachers + admins
CREATE POLICY "Students read own profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Teachers read student profiles" ON public.student_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'TEACHER')
);
CREATE POLICY "Admins manage student profiles" ON public.student_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','SCHOOL_ADMIN'))
);

-- teacher_profiles
CREATE POLICY "Authenticated read teacher profiles" ON public.teacher_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage teacher profiles" ON public.teacher_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','SCHOOL_ADMIN'))
);

-- attendance: teachers mark, students view own
CREATE POLICY "Teachers manage attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN'))
);
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);

-- assignments: teachers manage, students view published
CREATE POLICY "Teachers manage assignments" ON public.assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN'))
);
CREATE POLICY "Students view assignments" ON public.assignments FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.student_profiles WHERE section_id = assignments.section_id)
);

-- submissions: students manage own, teachers view/grade
CREATE POLICY "Students manage own submissions" ON public.submissions FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Teachers view submissions" ON public.submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN'))
);
CREATE POLICY "Teachers grade submissions" ON public.submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN'))
);

-- grades_records
CREATE POLICY "Students view own grades" ON public.grades_records FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers manage grades" ON public.grades_records FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN'))
);

-- course_materials
CREATE POLICY "Teachers manage materials" ON public.course_materials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN'))
);
CREATE POLICY "Students view materials" ON public.course_materials FOR SELECT USING (
  is_published = true AND
  auth.uid() IN (SELECT user_id FROM public.student_profiles WHERE section_id = course_materials.section_id)
);

-- announcements
CREATE POLICY "Authenticated view announcements" ON public.announcements FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Staff manage announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('TEACHER','SCHOOL_ADMIN','SUPER_ADMIN'))
);

-- notifications: own only
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- timetable
CREATE POLICY "Authenticated view timetable" ON public.timetable FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage timetable" ON public.timetable FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SCHOOL_ADMIN','SUPER_ADMIN'))
);

-- exam_types
CREATE POLICY "Authenticated view exam types" ON public.exam_types FOR SELECT TO authenticated USING (true);

-- ============================================================
-- AUTO-UPDATED updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- NEW USER TRIGGER (creates profile on signup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Default Academic Year
INSERT INTO public.academic_years (name, start_date, end_date, is_active)
VALUES ('2024-2025', '2024-04-01', '2025-03-31', true);

-- Grade Tiers
INSERT INTO public.grades (name, tier, sort_order) VALUES
('KG 1', 'KG_4', 1),
('KG 2', 'KG_4', 2),
('Grade 1', 'KG_4', 3),
('Grade 2', 'KG_4', 4),
('Grade 3', 'KG_4', 5),
('Grade 4', 'KG_4', 6),
('Grade 5', 'MID_5_7', 7),
('Grade 6', 'MID_5_7', 8),
('Grade 7', 'MID_5_7', 9),
('Grade 8', 'UPPER_8_10', 10),
('Grade 9', 'UPPER_8_10', 11),
('Grade 10', 'UPPER_8_10', 12);

-- Core Subjects
INSERT INTO public.subjects (name, code, color) VALUES
('Mathematics',    'MATH',    '#3B82F6'),
('Science',        'SCI',     '#10B981'),
('English',        'ENG',     '#8B5CF6'),
('Social Studies', 'SS',      '#F59E0B'),
('Urdu',           'URDU',    '#EF4444'),
('Islamiat',       'ISL',     '#06B6D4'),
('Computer',       'COMP',    '#6366F1'),
('Art & Craft',    'ART',     '#EC4899'),
('Physical Ed.',   'PE',      '#14B8A6');

-- Default Exam Types
INSERT INTO public.exam_types (name, weight) VALUES
('Quiz',       10),
('Mid-Term',   30),
('Final Exam', 60);
