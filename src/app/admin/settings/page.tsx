import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { SettingsView, AcademicYearItem } from './SettingsView'

export default async function AdminSettingsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: academicYears } = await supabase
    .from('academic_years')
    .select('*')
    .order('start_date', { ascending: false })

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://emhdxgimolrwqaduczok.supabase.co'
  const projectRef = 'emhdxgimolrwqaduczok'

  return (
    <div className="space-y-6">
      <PageHeader
        title="LMS & School Settings"
        subtitle="Manage academic terms, default settings, and system parameters."
      />

      <SettingsView
        academicYears={(academicYears as unknown as AcademicYearItem[]) || []}
        projectRef={projectRef}
        supabaseUrl={projectUrl}
      />
    </div>
  )
}
