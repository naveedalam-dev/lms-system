-- ============================================================
-- Fix RLS Infinite Recursion: Security Definer Helper Functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('SUPER_ADMIN'::public.user_role, 'SCHOOL_ADMIN'::public.user_role)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('TEACHER'::public.user_role, 'SCHOOL_ADMIN'::public.user_role, 'SUPER_ADMIN'::public.user_role)
  );
$$;

-- Drop all problematic existing policies
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by all" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated read academic years" ON public.academic_years;
DROP POLICY IF EXISTS "Admins manage academic years" ON public.academic_years;

DROP POLICY IF EXISTS "Authenticated read grades" ON public.grades;
DROP POLICY IF EXISTS "Admins manage grades" ON public.grades;

DROP POLICY IF EXISTS "Authenticated read sections" ON public.sections;
DROP POLICY IF EXISTS "Admins manage sections" ON public.sections;

DROP POLICY IF EXISTS "Authenticated read subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins manage subjects" ON public.subjects;

DROP POLICY IF EXISTS "Students read own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Teachers read student profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Admins manage student profiles" ON public.student_profiles;

DROP POLICY IF EXISTS "Authenticated read teacher profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Admins manage teacher profiles" ON public.teacher_profiles;

DROP POLICY IF EXISTS "Teachers manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Students view own attendance" ON public.attendance;

DROP POLICY IF EXISTS "Teachers manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Students view assignments" ON public.assignments;

DROP POLICY IF EXISTS "Students manage own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Teachers view submissions" ON public.submissions;
DROP POLICY IF EXISTS "Teachers grade submissions" ON public.submissions;

DROP POLICY IF EXISTS "Students view own grades" ON public.grades_records;
DROP POLICY IF EXISTS "Teachers manage grades" ON public.grades_records;

DROP POLICY IF EXISTS "Teachers manage materials" ON public.course_materials;
DROP POLICY IF EXISTS "Students view materials" ON public.course_materials;

DROP POLICY IF EXISTS "Authenticated view announcements" ON public.announcements;
DROP POLICY IF EXISTS "Staff manage announcements" ON public.announcements;

DROP POLICY IF EXISTS "Authenticated view timetable" ON public.timetable;
DROP POLICY IF EXISTS "Admins manage timetable" ON public.timetable;

DROP POLICY IF EXISTS "Authenticated view exam types" ON public.exam_types;
DROP POLICY IF EXISTS "Admins manage teacher assignments" ON public.teacher_assignments;
DROP POLICY IF EXISTS "Authenticated read teacher assignments" ON public.teacher_assignments;

-- ============================================================
-- Re-create clean, non-recursive RLS policies
-- ============================================================

-- profiles
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- academic_years
CREATE POLICY "Academic years viewable by all" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "Admins manage academic years" ON public.academic_years FOR ALL USING (public.is_admin());

-- grades
CREATE POLICY "Grades viewable by all" ON public.grades FOR SELECT USING (true);
CREATE POLICY "Admins manage grades" ON public.grades FOR ALL USING (public.is_admin());

-- sections
CREATE POLICY "Sections viewable by all" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Admins manage sections" ON public.sections FOR ALL USING (public.is_admin());

-- subjects
CREATE POLICY "Subjects viewable by all" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL USING (public.is_admin());

-- student_profiles
CREATE POLICY "Students read own profile" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff read student profiles" ON public.student_profiles FOR SELECT USING (public.is_staff());
CREATE POLICY "Admins manage student profiles" ON public.student_profiles FOR ALL USING (public.is_admin());

-- teacher_profiles
CREATE POLICY "Teacher profiles viewable by all" ON public.teacher_profiles FOR SELECT USING (true);
CREATE POLICY "Admins manage teacher profiles" ON public.teacher_profiles FOR ALL USING (public.is_admin());

-- teacher_assignments
CREATE POLICY "Teacher assignments viewable by all" ON public.teacher_assignments FOR SELECT USING (true);
CREATE POLICY "Admins manage teacher assignments" ON public.teacher_assignments FOR ALL USING (public.is_admin());

-- attendance
CREATE POLICY "Staff manage attendance" ON public.attendance FOR ALL USING (public.is_staff());
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);

-- assignments
CREATE POLICY "Staff manage assignments" ON public.assignments FOR ALL USING (public.is_staff());
CREATE POLICY "Students view assignments" ON public.assignments FOR SELECT USING (true);

-- submissions
CREATE POLICY "Students manage own submissions" ON public.submissions FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Staff manage submissions" ON public.submissions FOR ALL USING (public.is_staff());

-- grades_records
CREATE POLICY "Students view own grades" ON public.grades_records FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Staff manage grades" ON public.grades_records FOR ALL USING (public.is_staff());

-- course_materials
CREATE POLICY "Staff manage materials" ON public.course_materials FOR ALL USING (public.is_staff());
CREATE POLICY "Students view materials" ON public.course_materials FOR SELECT USING (is_published = true);

-- announcements
CREATE POLICY "Announcements viewable by all" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Staff manage announcements" ON public.announcements FOR ALL USING (public.is_staff());

-- timetable
CREATE POLICY "Timetable viewable by all" ON public.timetable FOR SELECT USING (true);
CREATE POLICY "Admins manage timetable" ON public.timetable FOR ALL USING (public.is_admin());

-- exam_types
CREATE POLICY "Exam types viewable by all" ON public.exam_types FOR SELECT USING (true);
