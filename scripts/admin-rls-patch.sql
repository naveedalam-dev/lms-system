-- Admin policies for sections, subjects, grades, academic_years
DO $$
BEGIN
  -- Sections
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sections' AND policyname = 'Admins manage sections'
  ) THEN
    CREATE POLICY "Admins manage sections" ON public.sections FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','SCHOOL_ADMIN'))
    );
  END IF;

  -- Subjects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subjects' AND policyname = 'Admins manage subjects'
  ) THEN
    CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','SCHOOL_ADMIN'))
    );
  END IF;

  -- Grades
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'grades' AND policyname = 'Admins manage grades'
  ) THEN
    CREATE POLICY "Admins manage grades" ON public.grades FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','SCHOOL_ADMIN'))
    );
  END IF;

  -- Teacher assignments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'teacher_assignments' AND policyname = 'Admins manage teacher assignments'
  ) THEN
    CREATE POLICY "Admins manage teacher assignments" ON public.teacher_assignments FOR ALL USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','SCHOOL_ADMIN'))
    );
  END IF;
  
  -- Authenticated read teacher assignments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'teacher_assignments' AND policyname = 'Authenticated read teacher assignments'
  ) THEN
    CREATE POLICY "Authenticated read teacher assignments" ON public.teacher_assignments FOR SELECT TO authenticated USING (true);
  END IF;

END $$;
