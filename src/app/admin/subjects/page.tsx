import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { AdminSubjectsView } from './AdminSubjectsView'

export default async function AdminSubjectsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subject Directory"
        subtitle="Manage academic subjects, course codes, and UI color accents."
      />

      <AdminSubjectsView initialSubjects={subjects || []} />
    </div>
  )
}
