import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { AnnouncementsList, AnnouncementItem } from './AnnouncementsList'

export default async function AdminAnnouncementsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, profiles(first_name, last_name, role), sections(name, grades(name))')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Announcements"
        subtitle="Manage official news, notices, and target role broadcasts."
      />

      <AnnouncementsList initialAnnouncements={(announcements as unknown as AnnouncementItem[]) || []} />
    </div>
  )
}
