DO $$
DECLARE
  ay_id uuid;
  g1_id uuid;
  g5_id uuid;
  g8_id uuid;
  g10_id uuid;
BEGIN
  SELECT id INTO ay_id FROM public.academic_years WHERE is_active = true LIMIT 1;
  SELECT id INTO g1_id FROM public.grades WHERE name = 'Grade 1' LIMIT 1;
  SELECT id INTO g5_id FROM public.grades WHERE name = 'Grade 5' LIMIT 1;
  SELECT id INTO g8_id FROM public.grades WHERE name = 'Grade 8' LIMIT 1;
  SELECT id INTO g10_id FROM public.grades WHERE name = 'Grade 10' LIMIT 1;

  IF ay_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.sections WHERE name = 'Section A' AND grade_id = g1_id) THEN
      INSERT INTO public.sections (grade_id, academic_year_id, name, room, capacity)
      VALUES (g1_id, ay_id, 'Section A', 'Room 101', 30);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.sections WHERE name = 'Section A' AND grade_id = g5_id) THEN
      INSERT INTO public.sections (grade_id, academic_year_id, name, room, capacity)
      VALUES (g5_id, ay_id, 'Section A', 'Room 201', 35);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.sections WHERE name = 'Section A' AND grade_id = g8_id) THEN
      INSERT INTO public.sections (grade_id, academic_year_id, name, room, capacity)
      VALUES (g8_id, ay_id, 'Section A', 'Room 301', 35);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.sections WHERE name = 'Section B' AND grade_id = g8_id) THEN
      INSERT INTO public.sections (grade_id, academic_year_id, name, room, capacity)
      VALUES (g8_id, ay_id, 'Section B', 'Room 302', 30);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.sections WHERE name = 'Section A' AND grade_id = g10_id) THEN
      INSERT INTO public.sections (grade_id, academic_year_id, name, room, capacity)
      VALUES (g10_id, ay_id, 'Section A', 'Room 401', 40);
    END IF;
  END IF;

  -- Also link existing demo students to grades & sections
  UPDATE public.student_profiles 
  SET grade_id = g8_id, section_id = (SELECT id FROM public.sections WHERE grade_id = g8_id AND name = 'Section A' LIMIT 1), academic_year_id = ay_id
  WHERE roll_number IN ('G8-001', 'G8-002');

  UPDATE public.student_profiles 
  SET grade_id = g5_id, section_id = (SELECT id FROM public.sections WHERE grade_id = g5_id AND name = 'Section A' LIMIT 1), academic_year_id = ay_id
  WHERE roll_number = 'G5-001';

END $$;
