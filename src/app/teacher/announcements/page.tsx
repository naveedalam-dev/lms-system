import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/shared'
import { TeacherAnnouncementsView, TeacherAssignmentItem } from './TeacherAnnouncementsView'

export default async function TeacherAnnouncementsPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Fetch announcements authored by teacher or school-wide
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, profiles(first_name, last_name, role), sections(name, grades(name))')
    .order('created_at', { ascending: false })

  // Fetch teacher's sections for targeting option when creating announcement
  const { data: teacherAssignments } = await supabase
    .from('teacher_assignments')
    .select('section_id, sections(id, name, grades(name))')
    .eq('teacher_id', user?.id ?? '')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class & School Announcements"
        subtitle="Post updates, schedule notices, and reminders to your students."
      />

      <TeacherAnnouncementsView
        initialAnnouncements={announcements || []}
        teacherAssignments={(teacherAssignments as unknown as TeacherAssignmentItem[]) || []}
        teacherId={user?.id || ''}
      />
    </div>
  )
}
