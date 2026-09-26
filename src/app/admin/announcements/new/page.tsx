import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/shared'
import { CreateAnnouncementForm, SectionOption } from './CreateAnnouncementForm'

export default async function NewAdminAnnouncementPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  const { data: sections } = await supabase
    .from('sections')
    .select('id, name, grades(name)')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="New Announcement"
        subtitle="Broadcast notices to students, teachers, or parents."
      />

      <CreateAnnouncementForm
        sections={(sections as unknown as SectionOption[]) || []}
        authorId={user?.id || ''}
      />
    </div>
  )
}
