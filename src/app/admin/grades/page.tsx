import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, DataTable, EmptyState, Badge } from '@/components/ui/shared'
import { Award } from 'lucide-react'

interface GradeRow {
  id: string
  name: string
  tier: string
  sort_order: number
}

interface SectionRow {
  id: string
  grade_id: string
}

const tierLabel: Record<string, string> = { KG_4: 'KG – 4', MID_5_7: 'Grades 5 – 7', UPPER_8_10: 'Grades 8 – 10' }
const tierColor: Record<string, 'green' | 'blue' | 'purple'> = { KG_4: 'green', MID_5_7: 'blue', UPPER_8_10: 'purple' }

export default async function AdminGradesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data: gradesData }, { data: sectionsData }] = await Promise.all([
    supabase.from('grades').select('*').order('sort_order', { ascending: true }),
    supabase.from('sections').select('id, grade_id'),
  ])

  const grades = (gradesData as unknown as GradeRow[]) ?? []
  const sections = (sectionsData as unknown as SectionRow[]) ?? []

  const countByGrade = sections.reduce<Record<string, number>>((acc, s) => {
    acc[s.grade_id] = (acc[s.grade_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <PageHeader title="Grades" subtitle={`${grades.length} grade levels configured`} />

      {grades.length > 0 ? (
        <div className="glass-card rounded-2xl p-2 sm:p-4">
          <DataTable headers={['Grade', 'Tier', 'Sections']}>
            {grades.map((g) => (
              <tr key={g.id} className="hover:bg-white/40 transition-colors">
                <td className="py-3 px-4 text-sm font-bold text-slate-900">{g.name}</td>
                <td className="py-3 px-4">
                  <Badge label={tierLabel[g.tier] ?? g.tier} color={tierColor[g.tier] ?? 'gray'} />
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 font-semibold">{countByGrade[g.id] ?? 0}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<Award className="w-10 h-10" />} title="No grades yet" description="Grade levels will appear here once they are added to the system." />
        </div>
      )}
    </div>
  )
}
