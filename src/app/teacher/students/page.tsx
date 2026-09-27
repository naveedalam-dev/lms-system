import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { isUuid } from '@/lib/uuid'
import { PageHeader, DataTable, EmptyState } from '@/components/ui/shared'
import { Users } from 'lucide-react'

interface AssignmentRow {
  section_id: string
}

interface StudentRow {
  id: string
  roll_number: string | null
  gender: string | null
  profiles?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null
  grades?: { name?: string } | null
  sections?: { name?: string } | null
}

export default async function TeacherStudentsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const userId = user?.id ?? ''

  let students: StudentRow[] = []
  let sectionCount = 0

  if (isUuid(userId)) {
    const { data: assignmentData } = await supabase
      .from('teacher_assignments')
      .select('section_id')
      .eq('teacher_id', userId)

    const sectionIds = Array.from(new Set(((assignmentData as unknown as AssignmentRow[]) ?? []).map((a) => a.section_id)))
    sectionCount = sectionIds.length

    if (sectionIds.length > 0) {
      const { data: studentData } = await supabase
        .from('student_profiles')
        .select('*, profiles(first_name, last_name, email), grades(name), sections(name)')
        .in('section_id', sectionIds)
        .order('roll_number', { ascending: true })
      students = (studentData as unknown as StudentRow[]) ?? []
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Students" subtitle={`${students.length} students across ${sectionCount} of your sections`} />

      {students.length > 0 ? (
        <div className="glass-card rounded-2xl p-2 sm:p-4">
          <DataTable headers={['Student', 'Email', 'Roll No.', 'Grade', 'Section']}>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-white/40 transition-colors">
                <td className="py-3 px-4 text-sm font-bold text-slate-900">
                  {[s.profiles?.first_name, s.profiles?.last_name].filter(Boolean).join(' ') || 'Student'}
                </td>
                <td className="py-3 px-4 text-xs text-slate-500 font-mono">{s.profiles?.email ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600 font-mono">{s.roll_number ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{s.grades?.name ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{s.sections?.name ?? '—'}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<Users className="w-10 h-10" />} title="No students found" description="Students enrolled in the sections you teach will appear here." />
        </div>
      )}
    </div>
  )
}
