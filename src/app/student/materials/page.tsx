import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { isUuid } from '@/lib/uuid'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { FolderOpen, ExternalLink, FileText } from 'lucide-react'

interface MaterialRow {
  id: string
  title: string
  description: string | null
  file_url: string | null
  material_type: string | null
  created_at: string
  subjects?: { name?: string; color?: string } | null
  profiles?: { first_name?: string | null; last_name?: string | null } | null
}

export default async function StudentMaterialsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const userId = user?.id ?? ''

  let materials: MaterialRow[] = []

  if (isUuid(userId)) {
    const { data: spData } = await supabase
      .from('student_profiles')
      .select('section_id')
      .eq('user_id', userId)
      .single()

    const sectionId = (spData as { section_id?: string } | null)?.section_id

    if (sectionId) {
      const { data } = await supabase
        .from('course_materials')
        .select('*, subjects(name, color), profiles(first_name, last_name)')
        .eq('section_id', sectionId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      materials = (data as unknown as MaterialRow[]) ?? []
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Materials" subtitle={`${materials.length} course materials shared with your section`} />

      {materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <div key={m.id} className="glass-card glass-card-hover rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: m.subjects?.color ?? '#8B5CF6' }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{m.title}</p>
                  <p className="text-[11px] text-slate-500">{m.subjects?.name ?? 'General'}</p>
                </div>
              </div>
              {m.description && <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{m.description}</p>}
              <div className="flex items-center justify-between pt-2 border-t border-white/60">
                <span className="text-[11px] text-slate-500">
                  {[m.profiles?.first_name, m.profiles?.last_name].filter(Boolean).join(' ') || 'Teacher'}
                </span>
                {m.file_url ? (
                  <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700">
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 capitalize font-mono">{m.material_type ?? 'document'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<FolderOpen className="w-10 h-10" />} title="No materials yet" description="Course materials shared by your teachers will appear here." />
        </div>
      )}
    </div>
  )
}
