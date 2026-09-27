import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, DataTable, EmptyState } from '@/components/ui/shared'
import { Layers } from 'lucide-react'

interface SectionRow {
  id: string
  name: string
  room: string | null
  capacity: number | null
  grades?: { name?: string } | null
  academic_years?: { name?: string } | null
}

export default async function AdminSectionsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('sections')
    .select('*, grades(name), academic_years(name)')
    .order('created_at', { ascending: false })

  const sections = (data as unknown as SectionRow[]) ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Sections" subtitle={`${sections.length} class sections across all grades`} />

      {sections.length > 0 ? (
        <div className="glass-card rounded-2xl p-2 sm:p-4">
          <DataTable headers={['Section', 'Grade', 'Room', 'Capacity', 'Academic Year']}>
            {sections.map((s) => (
              <tr key={s.id} className="hover:bg-white/40 transition-colors">
                <td className="py-3 px-4 text-sm font-bold text-slate-900">{s.name}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{s.grades?.name ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{s.room ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{s.capacity ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-500 font-mono">{s.academic_years?.name ?? '—'}</td>
              </tr>
            ))}
          </DataTable>
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<Layers className="w-10 h-10" />} title="No sections yet" description="Create class sections to organise students by grade." />
        </div>
      )}
    </div>
  )
}
