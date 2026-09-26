import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Students', href: '/admin/students', icon: 'Users' },
  { label: 'Teachers', href: '/admin/teachers', icon: 'GraduationCap' },
  { label: 'Classes', href: '/admin/classes', icon: 'BookOpen' },
  { label: 'Subjects', href: '/admin/subjects', icon: 'ClipboardList' },
  { label: 'Timetable', href: '/admin/timetable', icon: 'Calendar' },
  { label: 'Announcements', href: '/admin/announcements', icon: 'Bell' },
  { label: 'Reports', href: '/admin/reports', icon: 'BarChart3' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const { user, profile } = await getCurrentUserAndProfile(cookieStore)

  if (!user) redirect('/login')

  if (!['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(profile?.role ?? '')) redirect('/login')

  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Administrator'

  return (
    <AppShell
      navItems={navItems}
      role="Admin"
      title="Admin Command Center"
      accentColor="bg-blue-600"
      userName={userName}
      userEmail={profile?.email}
    >
      {children}
    </AppShell>
  )
}
