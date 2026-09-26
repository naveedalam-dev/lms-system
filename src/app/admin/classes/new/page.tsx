import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { CreateClassForm } from './CreateClassForm'

export const dynamic = 'force-dynamic'

export default async function NewClassPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data: grades }, { data: academicYears }] = await Promise.all([
    supabase.from('grades').select('*').order('sort_order', { ascending: true }),
    supabase.from('academic_years').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Create Class Section"
        subtitle="Add a new section (e.g., Section A) to an existing grade."
      />

      <CreateClassForm
        grades={grades || []}
        academicYears={academicYears || []}
      />
    </div>
  )
}
