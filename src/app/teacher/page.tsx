import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { StatCard } from '@/components/ui/shared'
import { Users, ClipboardList, FileText, GraduationCap } from 'lucide-react'

interface TeacherAssignmentItem {
  id: string
  title: string
  due_date: string
  subjects?: { name?: string; color?: string } | null
  sections?: { name?: string; grades?: { name?: string } } | null
}

export default async function TeacherDashboard() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const userId = user?.id ?? ''

  const [
    { count: classCount },
    { count: assignmentCount },
    { count: pendingCount },
    { data: myAssignmentsData },
  ] = await Promise.all([
    supabase.from('teacher_assignments').select('*', { count: 'exact', head: true }).eq('teacher_id', userId),
    supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('teacher_id', userId),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'SUBMITTED'),
    supabase.from('assignments')
      .select('id, title, due_date, subjects(name, color), sections(name, grades(name))')
      .eq('teacher_id', userId)
      .eq('is_published', true)
      .order('due_date', { ascending: true })
      .limit(5),
  ])

  const myAssignments = (myAssignmentsData as unknown as TeacherAssignmentItem[]) ?? []

  return (
    <div className="space-y-6">
      {/* Emerald Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-green-950 p-8 text-white shadow-xl shadow-emerald-900/10 border border-emerald-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Teaching Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Teacher Dashboard</h1>
          <p className="text-sm text-emerald-200/80 leading-relaxed">
            Here&apos;s your teaching overview for today — classes, assignments, and pending reviews.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/20 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Classes" value={classCount ?? 0} icon={<Users className="w-5 h-5 text-white" />} color="bg-emerald-500" />
        <StatCard label="Assignments" value={assignmentCount ?? 0} icon={<FileText className="w-5 h-5 text-white" />} color="bg-blue-500" />
        <StatCard label="Pending Review" value={pendingCount ?? 0} icon={<ClipboardList className="w-5 h-5 text-white" />} color="bg-amber-500" />
        <StatCard label="Graded" value="—" icon={<GraduationCap className="w-5 h-5 text-white" />} color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Upcoming Assignments</h3>
            <Link href="/teacher/assignments" className="text-xs text-emerald-600 hover:underline font-medium">View all →</Link>
          </div>
          {myAssignments.length > 0 ? (
            <div className="space-y-3">
              {myAssignments.map((a) => {
                const due = new Date(a.due_date)
                const isOverdue = due < new Date()
                return (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400">
                        {a.subjects?.name} • {a.sections?.grades?.name} {a.sections?.name}
                      </p>
                      <p className={`text-xs font-medium mt-0.5 ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                        Due: {due.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No assignments created yet.</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Take Attendance', href: '/teacher/attendance', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
              { label: 'New Assignment', href: '/teacher/assignments/new', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
              { label: 'Enter Grades', href: '/teacher/gradebook', color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
              { label: 'Upload Material', href: '/teacher/materials/new', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
            ].map(({ label, href, color }) => (
              <Link key={label} href={href} className={`flex items-center justify-center py-3 px-4 rounded-lg border text-sm font-medium transition-colors text-center ${color}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

