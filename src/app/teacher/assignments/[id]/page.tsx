import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/shared'
import { notFound } from 'next/navigation'
import { GradeSubmissionsList } from './GradeSubmissionsList'

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Fetch assignment details
  const { data: assignment } = await supabase
    .from('assignments')
    .select('*, sections(id, name, grades(name)), subjects(id, name)')
    .eq('id', id)
    .single()

  if (!assignment) {
    notFound()
  }

  // Fetch submissions for this assignment
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, profiles(first_name, last_name, email)')
    .eq('assignment_id', id)

  // Fetch total students in this section to know missing submissions
  const { data: sectionStudents } = await supabase
    .from('student_profiles')
    .select('user_id, roll_number, profiles(first_name, last_name, email)')
    .eq('section_id', assignment.section_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={assignment.title}
          subtitle={`${assignment.sections?.grades?.name} - ${assignment.sections?.name} | ${assignment.subjects?.name}`}
        />
        <Link
          href="/teacher/assignments"
          className="text-xs text-slate-500 hover:text-slate-800 underline"
        >
          ← Back to assignments
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Due Date: {new Date(assignment.due_date).toLocaleString()}</span>
          <span>Total Marks: {assignment.total_marks}</span>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{assignment.description || 'No description provided.'}</p>
      </div>

      {/* Submissions Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Student Submissions & Grading</h3>

        <GradeSubmissionsList
          assignmentId={assignment.id}
          totalMarks={assignment.total_marks}
          students={sectionStudents || []}
          submissions={submissions || []}
          teacherId={user?.id || ''}
        />
      </div>
    </div>
  )
}
