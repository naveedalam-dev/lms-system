import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { Users, BookOpen } from 'lucide-react'

interface ClassItem {
  section_id: string
  subject_id: string
  is_class_teacher?: boolean
  studentCount: number
  sections?: { id?: string; name?: string; room?: string | null; capacity?: number | null; grades?: { name?: string } } | null
  subjects?: { id?: string; name?: string; code?: string; color?: string } | null
}

export default async function TeacherClassesPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Get teacher's section assignments
  const { data: assignments } = await supabase
    .from('teacher_assignments')
    .select('*, sections(id, name, room, capacity, grades(name)), subjects(id, name, code, color)')
    .eq('teacher_id', user?.id ?? '')

  // For each section, get count of enrolled students
  const classList = await Promise.all(
    ((assignments || []) as ClassItem[]).map(async (a) => {
      const { count } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', a.section_id)

      return {
        ...a,
        studentCount: count || 0,
      }
    })
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classes"
        subtitle="Manage and view all student rosters across your assigned sections."
      />

      {classList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classList.map((c: ClassItem) => (
            <div key={`${c.section_id}-${c.subject_id}`} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm" style={{ backgroundColor: c.subjects?.color || '#3B82F6' }}>
                  {c.subjects?.code || 'SUB'}
                </div>
                {c.is_class_teacher && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Class Teacher
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-lg">{c.subjects?.name}</h3>
                <p className="text-sm font-medium text-slate-500">{c.sections?.grades?.name} — {c.sections?.name}</p>
                {c.sections?.room && <p className="text-xs text-slate-400 mt-0.5">Room: {c.sections.room}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-slate-400" />
                  {c.studentCount} Enrolled Students
                </div>

                <Link
                  href={`/teacher/attendance/mark?section=${c.section_id}&subject=${c.subject_id}`}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Mark Attendance →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="No classes assigned"
          description="You currently have no class or subject assignments assigned by school admin."
        />
      )}
    </div>
  )
}
