-- ============================================================
-- LMS Demo Users Seed Script
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================
-- This creates 6 demo users with proper auth + profiles + roles

DO $$
DECLARE
  admin_lms_id uuid := gen_random_uuid();
  admin_id    uuid := gen_random_uuid();
  teacher1_id uuid := gen_random_uuid();
  teacher2_id uuid := gen_random_uuid();
  student1_id uuid := gen_random_uuid();
  student2_id uuid := gen_random_uuid();
  student3_id uuid := gen_random_uuid();
BEGIN

-- ============================================================
-- 1. INSERT INTO auth.users
-- ============================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change_token_new, email_change
) VALUES
  -- 👑 Admin LMS
  ('00000000-0000-0000-0000-000000000000', admin_lms_id, 'authenticated', 'authenticated',
   'admin@lms.com',       crypt('admin123',     gen_salt('bf')), now(),
   '{"first_name":"System","last_name":"Admin"}'::jsonb,
   now(), now(), '', '', '', ''),
  -- 👑 Admin
  ('00000000-0000-0000-0000-000000000000', admin_id,    'authenticated', 'authenticated',
   'admin@school.edu',    crypt('Admin@1234',   gen_salt('bf')), now(),
   '{"first_name":"Super","last_name":"Admin"}'::jsonb,
   now(), now(), '', '', '', ''),
  -- 👩‍🏫 Teacher 1
  ('00000000-0000-0000-0000-000000000000', teacher1_id, 'authenticated', 'authenticated',
   'teacher1@school.edu', crypt('Teacher@1234', gen_salt('bf')), now(),
   '{"first_name":"Sarah","last_name":"Johnson"}'::jsonb,
   now(), now(), '', '', '', ''),
  -- 👨‍🏫 Teacher 2
  ('00000000-0000-0000-0000-000000000000', teacher2_id, 'authenticated', 'authenticated',
   'teacher2@school.edu', crypt('Teacher@1234', gen_salt('bf')), now(),
   '{"first_name":"Ahmed","last_name":"Khan"}'::jsonb,
   now(), now(), '', '', '', ''),
  -- 👦 Student 1
  ('00000000-0000-0000-0000-000000000000', student1_id, 'authenticated', 'authenticated',
   'student1@school.edu', crypt('Student@1234', gen_salt('bf')), now(),
   '{"first_name":"Ali","last_name":"Hassan"}'::jsonb,
   now(), now(), '', '', '', ''),
  -- 👧 Student 2
  ('00000000-0000-0000-0000-000000000000', student2_id, 'authenticated', 'authenticated',
   'student2@school.edu', crypt('Student@1234', gen_salt('bf')), now(),
   '{"first_name":"Fatima","last_name":"Malik"}'::jsonb,
   now(), now(), '', '', '', ''),
  -- 👦 Student 3
  ('00000000-0000-0000-0000-000000000000', student3_id, 'authenticated', 'authenticated',
   'student3@school.edu', crypt('Student@1234', gen_salt('bf')), now(),
   '{"first_name":"Omar","last_name":"Sheikh"}'::jsonb,
   now(), now(), '', '', '', '');

-- ============================================================
-- 2. INSERT INTO auth.identities (required for login)
-- ============================================================

INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES
  (gen_random_uuid(), admin_lms_id::text, admin_lms_id, jsonb_build_object('sub', admin_lms_id::text, 'email', 'admin@lms.com'), 'email', now(), now(), now()),
  (gen_random_uuid(), admin_id::text,    admin_id,    jsonb_build_object('sub', admin_id::text,    'email', 'admin@school.edu'),    'email', now(), now(), now()),
  (gen_random_uuid(), teacher1_id::text, teacher1_id, jsonb_build_object('sub', teacher1_id::text, 'email', 'teacher1@school.edu'), 'email', now(), now(), now()),
  (gen_random_uuid(), teacher2_id::text, teacher2_id, jsonb_build_object('sub', teacher2_id::text, 'email', 'teacher2@school.edu'), 'email', now(), now(), now()),
  (gen_random_uuid(), student1_id::text, student1_id, jsonb_build_object('sub', student1_id::text, 'email', 'student1@school.edu'), 'email', now(), now(), now()),
  (gen_random_uuid(), student2_id::text, student2_id, jsonb_build_object('sub', student2_id::text, 'email', 'student2@school.edu'), 'email', now(), now(), now()),
  (gen_random_uuid(), student3_id::text, student3_id, jsonb_build_object('sub', student3_id::text, 'email', 'student3@school.edu'), 'email', now(), now(), now());

-- ============================================================
-- 3. UPDATE profiles (trigger creates them; we update roles)
-- ============================================================

UPDATE public.profiles SET
  role        = 'SUPER_ADMIN',
  first_name  = 'System',
  last_name   = 'Admin'
WHERE id = admin_lms_id;

UPDATE public.profiles SET
  role        = 'SUPER_ADMIN',
  first_name  = 'Super',
  last_name   = 'Admin'
WHERE id = admin_id;

UPDATE public.profiles SET
  role        = 'TEACHER',
  first_name  = 'Sarah',
  last_name   = 'Johnson'
WHERE id = teacher1_id;

UPDATE public.profiles SET
  role        = 'TEACHER',
  first_name  = 'Ahmed',
  last_name   = 'Khan'
WHERE id = teacher2_id;

UPDATE public.profiles SET
  role        = 'STUDENT',
  first_name  = 'Ali',
  last_name   = 'Hassan'
WHERE id = student1_id;

UPDATE public.profiles SET
  role        = 'STUDENT',
  first_name  = 'Fatima',
  last_name   = 'Malik'
WHERE id = student2_id;

UPDATE public.profiles SET
  role        = 'STUDENT',
  first_name  = 'Omar',
  last_name   = 'Sheikh'
WHERE id = student3_id;

-- ============================================================
-- 4. Teacher Profiles
-- ============================================================

INSERT INTO public.teacher_profiles (user_id, employee_id, qualification, specialization, date_of_joining)
VALUES
  (teacher1_id, 'EMP-001', 'M.Ed', 'Mathematics', CURRENT_DATE),
  (teacher2_id, 'EMP-002', 'B.Ed', 'Science',      CURRENT_DATE);

-- ============================================================
-- 5. Student Profiles (linked to Grade 8 once grades exist)
-- ============================================================

INSERT INTO public.student_profiles (user_id, roll_number, gender, date_of_birth)
VALUES
  (student1_id, 'G8-001', 'Male',   '2010-03-15'),
  (student2_id, 'G8-002', 'Female', '2010-07-22'),
  (student3_id, 'G5-001', 'Male',   '2013-11-05');

-- ============================================================
-- 6. Sample Announcements
-- ============================================================

INSERT INTO public.announcements (author_id, title, content, is_published)
VALUES
  (admin_id,
   '🎉 Welcome to EduPortal LMS!',
   'Dear students and teachers, welcome to our new Learning Management System. Please log in and explore your dashboards. For any assistance, contact the admin office.',
   true),
  (admin_id,
   '📅 Mid-Term Exams Schedule',
   'Mid-term examinations will be held from October 15–22. Timetable will be shared class-wise by your respective class teachers. Please prepare accordingly.',
   true),
  (admin_id,
   '🏫 School Holiday Notice',
   'The school will remain closed on September 25 on account of a public holiday. Classes will resume normally on September 26.',
   true);

END $$;

-- Verify
SELECT p.email, p.first_name, p.last_name, p.role
FROM public.profiles p
ORDER BY p.role, p.first_name;
