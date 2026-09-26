import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { ClipboardList } from 'lucide-react'

interface TeacherAssignment {
  section_id: string
  sections?: { id: string; name: string; grades?: { name: string } } | null
  subjects?: { id: string; name: string; color?: string } | null
}

export default async function AttendancePage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Get teacher's sections
  const { data: assignmentsData } = await supabase
    .from('teacher_assignments')
    .select('section_id, sections(id, name, grades(name)), subjects(id, name, color)')
    .eq('teacher_id', user?.id ?? '')

  const assignments = (assignmentsData as unknown as TeacherAssignment[]) ?? []

  // Today's attendance summary
  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('status, student_id')
    .eq('marked_by', user?.id ?? '')
    .eq('date', today)

  const presentCount = todayAttendance?.filter(a => a.status === 'PRESENT').length ?? 0
  const absentCount = todayAttendance?.filter(a => a.status === 'ABSENT').length ?? 0
  const lateCount = todayAttendance?.filter(a => a.status === 'LATE').length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle={`Today: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        action={
          <a href="/teacher/attendance/mark" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Mark Attendance
          </a>
        }
      />

      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Present', value: presentCount, color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
          { label: 'Absent', value: absentCount, color: 'bg-red-50 border-red-200', textColor: 'text-red-700' },
          { label: 'Late', value: lateCount, color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
        ].map(({ label, value, color, textColor }) => (
          <div key={label} className={`rounded-xl border p-5 text-center ${color}`}>
            <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
            <p className={`text-sm font-medium mt-1 ${textColor}`}>{label} Today</p>
          </div>
        ))}
      </div>

      {/* My Classes */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">My Classes — Select to Mark Attendance</h3>
        {assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignments.map((a) => (
              <a
                key={`${a.section_id}-${a.subjects?.id}`}
                href={`/teacher/attendance/mark?section=${a.section_id}&subject=${a.subjects?.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: a.subjects?.color ?? '#10B981' }}
                >
                  {a.subjects?.name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 group-hover:text-emerald-700 text-sm">{a.subjects?.name}</p>
                  <p className="text-xs text-slate-500">{a.sections?.grades?.name} — {a.sections?.name}</p>
                </div>
                <span className="text-slate-400 group-hover:text-emerald-600">→</span>
              </a>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList className="w-12 h-12" />}
            title="No classes assigned"
            description="Contact admin to assign you to a class and subject."
          />
        )}
      </div>
    </div>
  )
}
