import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { StatCard, PageHeader } from '@/components/ui/shared'
import { Users, GraduationCap, BookOpen, Bell, ArrowRight, UserPlus, PlusCircle, Megaphone, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Parallel data fetching
  const [
    { count: studentCount },
    { count: teacherCount },
    { count: subjectCount },
    { data: announcements },
    { data: recentStudents },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'STUDENT'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'TEACHER'),
    supabase.from('subjects').select('*', { count: 'exact', head: true }),
    supabase.from('announcements').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(5),
    supabase.from('profiles').select('id, first_name, last_name, email, created_at').eq('role', 'STUDENT').order('created_at', { ascending: false }).limit(6),
  ])

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Academic Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, Administrator</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            School operations, faculty management, and curriculum synchronization are active and synchronized with Supabase Cloud.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Students"
          value={studentCount ?? 0}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
        />
        <StatCard
          label="Total Teachers"
          value={teacherCount ?? 0}
          icon={<GraduationCap className="w-6 h-6 text-white" />}
          color="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25"
        />
        <StatCard
          label="Active Subjects"
          value={subjectCount ?? 0}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25"
        />
        <StatCard
          label="Announcements"
          value={announcements?.length ?? 0}
          icon={<Bell className="w-6 h-6 text-white" />}
          color="bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25"
        />
      </div>

      {/* Recent Students + Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students Glass Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/60">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Recent Enrolled Students</h3>
              <p className="text-[11px] text-slate-500">Newly registered students in the system</p>
            </div>
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentStudents && recentStudents.length > 0 ? (
            <div className="divide-y divide-white/60">
              {recentStudents.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-white/40 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs">
                      {s.first_name?.charAt(0) ?? s.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {[s.first_name, s.last_name].filter(Boolean).join(' ') || 'Student Member'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{s.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-10">No students yet. Add students to get started.</p>
          )}
        </div>

        {/* Latest Announcements Glass Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/60">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Latest Announcements</h3>
              <p className="text-[11px] text-slate-500">Active broadcasts and school updates</p>
            </div>
            <Link
              href="/admin/announcements"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {announcements && announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl border border-white/80 bg-white/60 hover:bg-white/90 hover:shadow-xs transition-all space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900">{a.title}</span>
                    <span className="text-slate-500 text-[10px] font-mono">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{a.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-10">No announcements yet.</p>
          )}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Student',    href: '/admin/students/new',     icon: UserPlus,    color: 'from-blue-600 to-indigo-600 text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 border-blue-300/60' },
            { label: 'Add Teacher',    href: '/admin/teachers/new',     icon: GraduationCap, color: 'from-emerald-600 to-teal-600 text-emerald-800 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-300/60' },
            { label: 'Create Class',   href: '/admin/classes/new',      icon: PlusCircle,  color: 'from-violet-600 to-purple-600 text-violet-800 bg-violet-500/10 hover:bg-violet-500/20 border-violet-300/60' },
            { label: 'Announcement',   href: '/admin/announcements/new',icon: Megaphone,   color: 'from-amber-600 to-orange-600 text-amber-800 bg-amber-500/10 hover:bg-amber-500/20 border-amber-300/60' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border text-xs font-bold transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md ${color}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
