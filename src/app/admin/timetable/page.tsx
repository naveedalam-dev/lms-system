import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { AdminTimetableView } from './AdminTimetableView'

export default async function AdminTimetablePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [
    { data: sections },
    { data: subjects },
    { data: teachers },
    { data: timetable },
    { data: activeYear },
  ] = await Promise.all([
    supabase.from('sections').select('*, grades(name)').order('name', { ascending: true }),
    supabase.from('subjects').select('*').order('name', { ascending: true }),
    supabase.from('profiles').select('id, first_name, last_name').eq('role', 'TEACHER'),
    supabase.from('timetable').select('*, sections(name, grades(name)), subjects(name, color), profiles:teacher_id(first_name, last_name)').order('day_of_week', { ascending: true }),
    supabase.from('academic_years').select('*').eq('is_active', true).single(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Timetable Management"
        subtitle="Schedule weekly class slots, assigned teachers, and room numbers."
      />

      <AdminTimetableView
        sections={sections || []}
        subjects={subjects || []}
        teachers={teachers || []}
        initialTimetable={timetable || []}
        academicYearId={activeYear?.id || ''}
      />
    </div>
  )
}
