import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { FileText, Plus, ExternalLink, Download } from 'lucide-react'

interface MaterialItem {
  id: string
  title: string
  description?: string | null
  material_type?: string | null
  file_url?: string | null
  created_at: string
  sections?: { name?: string; grades?: { name?: string } } | null
  subjects?: { name?: string; color?: string } | null
}

export default async function TeacherMaterialsPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Fetch materials uploaded by teacher
  const { data: materials } = await supabase
    .from('course_materials')
    .select('*, sections(name, grades(name)), subjects(name, color)')
    .eq('teacher_id', user?.id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Materials"
        subtitle="Share lecture slides, documents, and reference links with your classes."
        action={
          <Link
            href="/teacher/materials/new"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Upload Material
          </Link>
        }
      />

      {materials && materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((m: MaterialItem) => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700">
                    {m.material_type || 'document'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{m.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {m.sections?.grades?.name} — {m.sections?.name} | {m.subjects?.name}
                  </p>
                </div>

                {m.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">{m.description}</p>
                )}
              </div>

              {m.file_url ? (
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> View / Download</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 italic">
                  No file attachment
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title="No materials uploaded yet"
          description="Click 'Upload Material' to share study notes, syllabus documents, or web links."
        />
      )}
    </div>
  )
}
