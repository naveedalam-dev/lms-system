import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  { label: 'Students', href: '/admin/students', icon: 'Users' },
  { label: 'Teachers', href: '/admin/teachers', icon: 'GraduationCap' },
  { label: 'Grades', href: '/admin/grades', icon: 'Award' },
  { label: 'Sections', href: '/admin/sections', icon: 'Layers' },
  { label: 'Subjects', href: '/admin/subjects', icon: 'BookOpen' },
  { label: 'Courses', href: '/admin/courses', icon: 'Library' },
  { label: 'Attendance', href: '/admin/attendance', icon: 'CalendarCheck' },
  { label: 'Assignments', href: '/admin/assignments', icon: 'FileText' },
  { label: 'Assessments', href: '/admin/assessments', icon: 'ClipboardCheck' },
  { label: 'Gradebook', href: '/admin/gradebook', icon: 'BookMarked' },
  { label: 'Materials', href: '/admin/materials', icon: 'FolderOpen' },
  { label: 'Discussions', href: '/admin/discussions', icon: 'MessagesSquare' },
  { label: 'Messages', href: '/admin/messages', icon: 'MessageSquare' },
  { label: 'Notifications', href: '/admin/notifications', icon: 'Bell' },
  { label: 'Reports', href: '/admin/reports', icon: 'BarChart3' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'ScrollText' },
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
      theme="admin"
      userName={userName}
      userEmail={profile?.email}
    >
      {children}
    </AppShell>
  )
}
