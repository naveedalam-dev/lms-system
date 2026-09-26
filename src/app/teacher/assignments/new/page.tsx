import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/shared'
import { CreateAssignmentForm } from './CreateAssignmentForm'

export default async function NewAssignmentPage() {
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
        title="Create New Assignment"
        subtitle="Publish a new homework assignment, quiz, or project for your students."
      />

      <CreateAssignmentForm
        teacherAssignments={teacherAssignments || []}
        teacherId={user?.id || ''}
      />
    </div>
  )
}
