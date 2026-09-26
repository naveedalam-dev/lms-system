import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'


const navItems = [
  { label: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
  { label: 'My Courses', href: '/student/courses', icon: 'BookOpen' },
  { label: 'Assignments', href: '/student/assignments', icon: 'Upload' },
  { label: 'My Grades', href: '/student/grades', icon: 'GraduationCap' },
  { label: 'Attendance', href: '/student/attendance', icon: 'ClipboardList' },
  { label: 'Calendar', href: '/student/calendar', icon: 'Calendar' },
  { label: 'Announcements', href: '/student/announcements', icon: 'Bell' },
  { label: 'Messages', href: '/student/messages', icon: 'MessageSquare' },
]

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const { user, profile } = await getCurrentUserAndProfile(cookieStore)

  if (!user) redirect('/login')

  if (profile?.role !== 'STUDENT') redirect('/login')

  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Student'

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        navItems={navItems}
        role="Student"
        accentColor="bg-violet-600"
        userName={userName}
        userEmail={profile?.email}
      />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar title="Student Portal" />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
