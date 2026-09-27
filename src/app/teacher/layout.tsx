import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'


const navItems = [
  { label: 'Dashboard', href: '/teacher', icon: 'LayoutDashboard' },
  { label: 'My Classes', href: '/teacher/classes', icon: 'School' },
  { label: 'Students', href: '/teacher/students', icon: 'Users' },
  { label: 'Attendance', href: '/teacher/attendance', icon: 'CalendarCheck' },
  { label: 'Assignments', href: '/teacher/assignments', icon: 'FileText' },
  { label: 'Assessments', href: '/teacher/assessments', icon: 'ClipboardCheck' },
  { label: 'Gradebook', href: '/teacher/gradebook', icon: 'BookMarked' },
  { label: 'Materials', href: '/teacher/materials', icon: 'FolderOpen' },
  { label: 'Discussions', href: '/teacher/discussions', icon: 'MessagesSquare' },
  { label: 'Messages', href: '/teacher/messages', icon: 'MessageSquare' },
  { label: 'Notifications', href: '/teacher/notifications', icon: 'Bell' },
  { label: 'Profile', href: '/teacher/profile', icon: 'User' },
]

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const { user, profile } = await getCurrentUserAndProfile(cookieStore)

  if (!user) redirect('/login')

  if (profile?.role !== 'TEACHER') redirect('/login')

  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Teacher'

  return (
    <AppShell
      navItems={navItems}
      role="Teacher"
      title="Teacher Portal"
      accentColor="bg-emerald-600"
      theme="teacher"
      userName={userName}
      userEmail={profile?.email}
    >
      {children}
    </AppShell>
  )
}
