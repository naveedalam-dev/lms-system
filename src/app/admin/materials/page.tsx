import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, DataTable, EmptyState, Badge } from '@/components/ui/shared'
import { FolderOpen, ExternalLink } from 'lucide-react'

interface MaterialRow {
  id: string
  title: string
  description: string | null
  file_url: string | null
  material_type: string | null
  is_published: boolean
  created_at: string
  subjects?: { name?: string; color?: string } | null
  sections?: { name?: string } | null
  profiles?: { first_name?: string | null; last_name?: string | null } | null
}

export default async function AdminMaterialsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('course_materials')
    .select('*, subjects(name, color), sections(name), profiles(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const materials = (data as unknown as MaterialRow[]) ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Materials" subtitle={`${materials.length} teaching materials uploaded`} />

      {materials.length > 0 ? (
        <div className="glass-card rounded-2xl p-2 sm:p-4">
          <DataTable headers={['Title', 'Subject', 'Section', 'Type', 'Teacher', 'Status', '']}>
            {materials.map((m) => (
              <tr key={m.id} className="hover:bg-white/40 transition-colors">
                <td className="py-3 px-4">
                  <p className="text-sm font-bold text-slate-900">{m.title}</p>
                  {m.description && <p className="text-[11px] text-slate-500 line-clamp-1">{m.description}</p>}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.subjects?.color ?? '#3B82F6' }} />
                    {m.subjects?.name ?? '—'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{m.sections?.name ?? '—'}</td>
                <td className="py-3 px-4 text-xs text-slate-500 capitalize font-mono">{m.material_type ?? 'document'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {[m.profiles?.first_name, m.profiles?.last_name].filter(Boolean).join(' ') || '—'}
                </td>
                <td className="py-3 px-4">
                  <Badge label={m.is_published ? 'Published' : 'Draft'} color={m.is_published ? 'green' : 'gray'} />
                </td>
                <td className="py-3 px-4 text-right">
                  {m.file_url ? (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<FolderOpen className="w-10 h-10" />} title="No materials" description="Teaching materials uploaded by teachers will appear here." />
        </div>
      )}
    </div>
  )
}
