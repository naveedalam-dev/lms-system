import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, DataTable, EmptyState } from '@/components/ui/shared'
import { BookMarked } from 'lucide-react'

interface GradeRecordRow {
  id: string
  student_id: string
  marks_obtained: number
  total_marks: number
  subjects?: { name?: string; color?: string } | null
  sections?: { name?: string } | null
  exam_types?: { name?: string } | null
}

interface ProfileRow {
  id: string
  first_name: string | null
  last_name: string | null
}

export default async function AdminGradebookPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('grades_records')
    .select('id, student_id, marks_obtained, total_marks, subjects(name, color), sections(name), exam_types(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const records = (data as unknown as GradeRecordRow[]) ?? []

  const studentIds = Array.from(new Set(records.map((r) => r.student_id)))
  let nameMap: Record<string, string> = {}
  if (studentIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', studentIds)
    nameMap = ((profileData as unknown as ProfileRow[]) ?? []).reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Student'
      return acc
    }, {})
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Gradebook" subtitle={`${records.length} grade entries recorded`} />

      {records.length > 0 ? (
        <div className="glass-card rounded-2xl p-2 sm:p-4">
          <DataTable headers={['Student', 'Subject', 'Section', 'Exam', 'Marks', '%']}>
            {records.map((r) => {
              const total = Number(r.total_marks) || 0
              const pct = total > 0 ? Math.round((Number(r.marks_obtained) / total) * 100) : 0
              const pctColor = pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'
              return (
                <tr key={r.id} className="hover:bg-white/40 transition-colors">
                  <td className="py-3 px-4 text-sm font-bold text-slate-900">{nameMap[r.student_id] ?? 'Student'}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.subjects?.color ?? '#3B82F6' }} />
                      {r.subjects?.name ?? '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{r.sections?.name ?? '—'}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{r.exam_types?.name ?? '—'}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-mono">
                    {Number(r.marks_obtained)} / {total}
                  </td>
                  <td className={`py-3 px-4 text-sm font-extrabold ${pctColor}`}>{pct}%</td>
                </tr>
              )
            })}
          </DataTable>
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<BookMarked className="w-10 h-10" />} title="No grade entries" description="Recorded grades will appear here once teachers enter marks." />
        </div>
      )}
    </div>
  )
}
