import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'


const navItems = [
  { label: 'Dashboard', href: '/teacher', icon: 'LayoutDashboard' },
  { label: 'My Classes', href: '/teacher/classes', icon: 'Users' },
  { label: 'Attendance', href: '/teacher/attendance', icon: 'ClipboardList' },
  { label: 'Assignments', href: '/teacher/assignments', icon: 'FileText' },
  { label: 'Gradebook', href: '/teacher/gradebook', icon: 'GraduationCap' },
  { label: 'Materials', href: '/teacher/materials', icon: 'BookOpen' },
  { label: 'Announcements', href: '/teacher/announcements', icon: 'Bell' },
  { label: 'Messages', href: '/teacher/messages', icon: 'MessageSquare' },
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
      userName={userName}
      userEmail={profile?.email}
    >
      {children}
    </AppShell>
  )
}
