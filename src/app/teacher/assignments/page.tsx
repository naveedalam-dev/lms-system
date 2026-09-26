import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader, Badge, EmptyState } from '@/components/ui/shared'
import { FileText } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  description?: string | null
  due_date: string
  total_marks: number
  is_published: boolean
  created_at: string
  subjects?: { name?: string; color?: string } | null
  sections?: { name?: string; grades?: { name?: string } } | null
}

export default async function AssignmentsPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  const { data: assignmentsData } = await supabase
    .from('assignments')
    .select(`
      id, title, description, due_date, total_marks, is_published, created_at,
      subjects ( name, color ),
      sections ( name, grades ( name ) )
    `)
    .eq('teacher_id', user?.id ?? '')
    .order('created_at', { ascending: false })

  const assignments = (assignmentsData as unknown as Assignment[]) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle={`${assignments.length} total assignments`}
        action={
          <Link href="/teacher/assignments/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + New Assignment
          </Link>
        }
      />

      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a) => {
            const due = new Date(a.due_date)
            const isOverdue = due < new Date()

            return (
              <Link
                key={a.id}
                href={`/teacher/assignments/${a.id}`}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-white"
                    style={{ backgroundColor: a.subjects?.color ?? '#3B82F6' }}
                  >
                    {a.subjects?.name}
                  </div>
                  <Badge
                    label={a.is_published ? 'Published' : 'Draft'}
                    color={a.is_published ? 'green' : 'gray'}
                  />
                </div>
                <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-700">{a.title}</h4>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{a.description || 'No description provided.'}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{a.sections?.grades?.name} — {a.sections?.name}</span>
                  <span className={`font-medium ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                    {isOverdue ? 'Overdue · ' : 'Due: '}{due.toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Total Marks: <span className="font-medium text-slate-600">{a.total_marks}</span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title="No assignments yet"
            description="Create your first assignment to share with your students."
          />
        </div>
      )}
    </div>
  )
}

