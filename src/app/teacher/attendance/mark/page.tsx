import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/shared'
import { MarkAttendanceForm } from './MarkAttendanceForm'

export interface StudentAttendanceItem {
  student_id: string
  first_name: string
  last_name: string
  roll_number: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
}

export default async function MarkAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; subject?: string }>
}) {
  const { section: sectionId, subject: subjectId } = await searchParams
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Fetch sections assigned to teacher
  const { data: teacherAssignments } = await supabase
    .from('teacher_assignments')
    .select('section_id, subject_id, sections(id, name, grades(name)), subjects(id, name)')
    .eq('teacher_id', user?.id ?? '')

  const currentSectionId = sectionId || teacherAssignments?.[0]?.section_id || ''
  const currentSubjectId = subjectId || teacherAssignments?.[0]?.subject_id || ''

  // Fetch students in selected section
  let students: StudentAttendanceItem[] = []
  if (currentSectionId) {
    const { data: studentProfiles } = await supabase
      .from('student_profiles')
      .select('user_id, roll_number, profiles(first_name, last_name)')
      .eq('section_id', currentSectionId)

    // Check existing attendance for today
    const today = new Date().toISOString().split('T')[0]
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('student_id, status')
      .eq('section_id', currentSectionId)
      .eq('date', today)

    const attendanceMap = new Map<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>()
    existingAttendance?.forEach(a => attendanceMap.set(a.student_id, a.status as StudentAttendanceItem['status']))

    students = (studentProfiles || []).map(sp => {
      const p = Array.isArray(sp.profiles) ? sp.profiles[0] : sp.profiles
      return {
        student_id: sp.user_id,
        first_name: p?.first_name || 'Student',
        last_name: p?.last_name || '',
        roll_number: sp.roll_number || 'N/A',
        status: attendanceMap.get(sp.user_id) || 'PRESENT'
      }
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        subtitle={`Select a section to mark today's attendance (${new Date().toLocaleDateString()})`}
      />

      <MarkAttendanceForm
        teacherAssignments={teacherAssignments || []}
        currentSectionId={currentSectionId}
        currentSubjectId={currentSubjectId}
        initialStudents={students}
        teacherId={user?.id || ''}
      />
    </div>
  )
}
