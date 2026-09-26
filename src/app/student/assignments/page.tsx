import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, Badge, EmptyState } from '@/components/ui/shared'
import { Upload } from 'lucide-react'

interface Submission {
  status: string
  marks_obtained?: number | null
  submitted_at: string
}

interface StudentAssignment {
  id: string
  title: string
  description?: string | null
  due_date: string
  total_marks: number
  subjects?: { name?: string; color?: string } | null
  submissions?: Submission[] | null
}

export default async function StudentAssignmentsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('section_id')
    .eq('user_id', user?.id ?? '')
    .single()

  const sectionId = (studentProfile as unknown as { section_id?: string })?.section_id

  const { data: assignmentsData } = sectionId
    ? await supabase
        .from('assignments')
        .select(`
          id, title, description, due_date, total_marks,
          subjects(name, color),
          submissions(status, marks_obtained, submitted_at)
        `)
        .eq('section_id', sectionId)
        .eq('is_published', true)
        .order('due_date', { ascending: true })
    : { data: [] }

  const assignments = (assignmentsData as unknown as StudentAssignment[]) ?? []

  const getSubmissionStatus = (submissions?: Submission[] | null) => {
    if (!submissions || submissions.length === 0) return { label: 'Not Submitted', color: 'gray' as const }
    const s = submissions[0]
    if (s.status === 'GRADED') return { label: 'Graded', color: 'green' as const }
    if (s.status === 'SUBMITTED') return { label: 'Submitted', color: 'blue' as const }
    if (s.status === 'LATE') return { label: 'Late', color: 'yellow' as const }
    return { label: 'Pending', color: 'gray' as const }
  }

  const now = new Date()
  const currentTimestamp = now.getTime()

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assignments"
        subtitle={`${assignments.length} assignments total`}
      />

      {assignments.length > 0 ? (
        <div className="space-y-3">
          {assignments.map((a) => {
            const due = new Date(a.due_date)
            const isOverdue = due < now
            const daysLeft = Math.ceil((due.getTime() - currentTimestamp) / 86400000)
            const { label: statusLabel, color: statusColor } = getSubmissionStatus(a.submissions)
            const grade = a.submissions?.[0]?.marks_obtained

            return (
              <div key={a.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: a.subjects?.color ?? '#8B5CF6' }}
                      >
                        {a.subjects?.name}
                      </span>
                      <Badge label={statusLabel} color={statusColor} />
                      {isOverdue && statusLabel === 'Not Submitted' && (
                        <Badge label="Overdue" color="red" />
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900">{a.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description || 'No description.'}</p>
                  </div>
                  {grade !== null && grade !== undefined && (
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-2xl font-bold text-emerald-600">{grade}</p>
                      <p className="text-xs text-slate-400">/ {a.total_marks}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <p className="text-xs text-slate-400">
                    Total Marks: <span className="font-medium text-slate-600">{a.total_marks}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <p className={`text-xs font-medium ${isOverdue && statusLabel === 'Not Submitted' ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {isOverdue ? `Overdue by ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Due today' : `Due in ${daysLeft} days`}
                    </p>
                    {statusLabel === 'Not Submitted' && (
                      <button className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <EmptyState
            icon={<Upload className="w-12 h-12" />}
            title="No assignments yet"
            description="Your teacher hasn't posted any assignments yet. Check back soon!"
          />
        </div>
      )}
    </div>
  )
}
