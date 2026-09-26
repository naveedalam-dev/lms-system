import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { StatCard, PageHeader } from '@/components/ui/shared'
import { Upload, ClipboardList, BookOpen, Bell } from 'lucide-react'

interface StudentProfileQuery {
  section_id?: string
  grades?: { name?: string; tier?: string } | null
  sections?: { name?: string } | null
}

interface AssignmentItem {
  id: string
  title: string
  due_date: string
  subjects?: { name?: string; color?: string } | null
}

interface AnnouncementItem {
  id: string
  title: string
  content: string
  created_at: string
}

export default async function StudentDashboard() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const userId = user?.id ?? ''

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('section_id, grades(name, tier), sections(name)')
    .eq('user_id', userId)
    .single()

  const profile = studentProfile as unknown as StudentProfileQuery | null
  const sectionId = profile?.section_id

  const [
    { data: assignmentsData },
    { data: announcementsData },
    { count: attendanceTotal },
    { count: presentCount },
  ] = await Promise.all([
    sectionId
      ? supabase.from('assignments').select('id, title, due_date, subjects(name, color)').eq('section_id', sectionId).eq('is_published', true).order('due_date', { ascending: true }).limit(5)
      : { data: [] },
    supabase.from('announcements').select('id, title, content, created_at').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
    sectionId
      ? supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', userId).eq('section_id', sectionId)
      : { count: 0 },
    sectionId
      ? supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('student_id', userId).eq('section_id', sectionId).eq('status', 'PRESENT')
      : { count: 0 },
  ])

  const assignments = (assignmentsData as unknown as AssignmentItem[]) ?? []
  const announcements = (announcementsData as unknown as AnnouncementItem[]) ?? []

  const attendanceRate = attendanceTotal && attendanceTotal > 0
    ? Math.round(((presentCount ?? 0) / attendanceTotal) * 100)
    : null

  const gradeName = profile?.grades?.name ?? 'Not Assigned'
  const sectionName = profile?.sections?.name ?? ''

  const now = new Date()
  const currentTimestamp = now.getTime()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Dashboard"
        subtitle={`${gradeName}${sectionName ? ` — ${sectionName}` : ''} • Welcome back!`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Assignments" value={assignments.length} icon={<Upload className="w-5 h-5 text-white" />} color="bg-amber-500" />
        <StatCard label="Attendance Rate" value={attendanceRate !== null ? `${attendanceRate}%` : '—'} icon={<ClipboardList className="w-5 h-5 text-white" />} color="bg-emerald-500" />
        <StatCard label="Active Courses" value={sectionId ? '—' : 0} icon={<BookOpen className="w-5 h-5 text-white" />} color="bg-violet-500" />
        <StatCard label="Announcements" value={announcements.length} icon={<Bell className="w-5 h-5 text-white" />} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Upcoming Assignments</h3>
            <a href="/student/assignments" className="text-xs text-violet-600 hover:underline font-medium">View all →</a>
          </div>
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((a) => {
                const due = new Date(a.due_date)
                const isOverdue = due < now
                const daysLeft = Math.ceil((due.getTime() - currentTimestamp) / 86400000)
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-violet-50 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.subjects?.color ?? '#8B5CF6' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400">{a.subjects?.name}</p>
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${isOverdue ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {isOverdue ? 'Overdue' : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No upcoming assignments!</p>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Announcements</h3>
            <a href="/student/announcements" className="text-xs text-violet-600 hover:underline font-medium">View all →</a>
          </div>
          {announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="border-l-2 border-violet-400 pl-3">
                  <p className="text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-slate-300 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No announcements yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
