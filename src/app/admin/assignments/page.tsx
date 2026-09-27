import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, DataTable, EmptyState, Badge } from '@/components/ui/shared'
import { FileText } from 'lucide-react'

interface AssignmentRow {
  id: string
  title: string
  due_date: string
  total_marks: number | null
  is_published: boolean
  subjects?: { name?: string; color?: string } | null
  sections?: { name?: string } | null
  profiles?: { first_name?: string | null; last_name?: string | null } | null
}

export default async function AdminAssignmentsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('assignments')
    .select('*, subjects(name, color), sections(name), profiles(first_name, last_name)')
    .order('due_date', { ascending: false })
    .limit(100)

  const assignments = (data as unknown as AssignmentRow[]) ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" subtitle={`${assignments.length} assignments across all sections`} />

      {assignments.length > 0 ? (
        <div className="glass-card rounded-2xl p-2 sm:p-4">
          <DataTable headers={['Title', 'Subject', 'Section', 'Teacher', 'Due', 'Marks', 'Status']}>
            {assignments.map((a) => {
              const overdue = new Date(a.due_date) < new Date()
              return (
                <tr key={a.id} className="hover:bg-white/40 transition-colors">
                  <td className="py-3 px-4 text-sm font-bold text-slate-900">{a.title}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.subjects?.color ?? '#3B82F6' }} />
                      {a.subjects?.name ?? '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{a.sections?.name ?? '—'}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {[a.profiles?.first_name, a.profiles?.last_name].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className={`py-3 px-4 text-sm font-mono ${overdue ? 'text-rose-500' : 'text-slate-500'}`}>
                    {new Date(a.due_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{a.total_marks ?? '—'}</td>
                  <td className="py-3 px-4">
                    <Badge label={a.is_published ? 'Published' : 'Draft'} color={a.is_published ? 'green' : 'gray'} />
                  </td>
                </tr>
              )
            })}
          </DataTable>
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<FileText className="w-10 h-10" />} title="No assignments" description="Assignments created by teachers will appear here." />
        </div>
      )}
    </div>
  )
}
