import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'


const navItems = [
  { label: 'Dashboard', href: '/student', icon: 'LayoutDashboard' },
  { label: 'My Courses', href: '/student/courses', icon: 'BookOpen' },
  { label: 'Assignments', href: '/student/assignments', icon: 'FileText' },
  { label: 'Calendar', href: '/student/calendar', icon: 'Calendar' },
  { label: 'Grades', href: '/student/grades', icon: 'Award' },
  { label: 'Attendance', href: '/student/attendance', icon: 'CalendarCheck' },
  { label: 'Materials', href: '/student/materials', icon: 'FolderOpen' },
  { label: 'Messages', href: '/student/messages', icon: 'MessageSquare' },
  { label: 'Discussions', href: '/student/discussions', icon: 'MessagesSquare' },
  { label: 'Notifications', href: '/student/notifications', icon: 'Bell' },
  { label: 'Profile', href: '/student/profile', icon: 'User' },
]

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const { user, profile } = await getCurrentUserAndProfile(cookieStore)

  if (!user) redirect('/login')

  if (profile?.role !== 'STUDENT') redirect('/login')

  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Student'

  return (
    <AppShell
      navItems={navItems}
      role="Student"
      title="Student Portal"
      accentColor="bg-violet-600"
      theme="student"
      userName={userName}
      userEmail={profile?.email}
    >
      {children}
    </AppShell>
  )
}
