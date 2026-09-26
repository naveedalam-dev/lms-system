import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/shared'
import { CreateMaterialForm } from './CreateMaterialForm'

export default async function NewMaterialPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Fetch sections & subjects assigned to this teacher
  const { data: teacherAssignments } = await supabase
    .from('teacher_assignments')
    .select('section_id, subject_id, sections(id, name, grades(name)), subjects(id, name)')
    .eq('teacher_id', user?.id ?? '')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Upload Study Material"
        subtitle="Share notes, presentations, or reference links with your section."
      />

      <CreateMaterialForm
        teacherAssignments={teacherAssignments || []}
        teacherId={user?.id || ''}
      />
    </div>
  )
}
