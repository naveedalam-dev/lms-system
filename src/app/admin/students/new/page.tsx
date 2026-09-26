import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { StudentForm } from './StudentForm'

export const dynamic = 'force-dynamic'

export default async function NewStudentPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data: grades }, { data: sections }] = await Promise.all([
    supabase.from('grades').select('id, name').order('sort_order', { ascending: true }),
    supabase.from('sections').select('id, name, grade_id').order('name', { ascending: true }),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Add New Student"
        subtitle="Enroll a new student and set up their LMS credentials."
      />

      <StudentForm
        grades={grades || []}
        sections={sections || []}
      />
    </div>
  )
}
