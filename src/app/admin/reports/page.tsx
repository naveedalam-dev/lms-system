import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { ReportsView } from './ReportsView'

export default async function AdminReportsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [
    { count: studentCount },
    { count: teacherCount },
    { count: classCount },
    { count: subjectCount },
    { count: assignmentCount },
    { count: submissionCount },
    { data: attendanceData },
    { data: gradesData },
    { data: studentProfiles },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'TEACHER'),
    supabase.from('sections').select('*', { count: 'exact', head: true }),
    supabase.from('subjects').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase.from('attendance').select('status'),
    supabase.from('grades').select('id, name').order('sort_order', { ascending: true }),
    supabase.from('student_profiles').select('grade_id'),
  ])

  // Count students per grade
  const gradeDistribution = (gradesData || []).map(g => ({
    name: g.name,
    count: (studentProfiles || []).filter(sp => sp.grade_id === g.id).length,
  }))

  const totalAtt = attendanceData?.length || 0
  const presentAtt = attendanceData?.filter(a => a.status === 'PRESENT').length || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Key school performance indicators, student distribution, and academic metrics."
      />

      <ReportsView
        studentCount={studentCount ?? 0}
        teacherCount={teacherCount ?? 0}
        classCount={classCount ?? 0}
        subjectCount={subjectCount ?? 0}
        assignmentCount={assignmentCount ?? 0}
        submissionCount={submissionCount ?? 0}
        totalAttendance={totalAtt}
        presentAttendance={presentAtt}
        gradeDistribution={gradeDistribution}
      />
    </div>
  )
}
