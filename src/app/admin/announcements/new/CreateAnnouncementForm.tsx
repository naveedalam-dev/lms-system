'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Megaphone, Send } from 'lucide-react'

export interface SectionOption {
  id: string
  name: string
  grades?: { name?: string } | { name?: string }[] | null
}

interface Props {
  sections: SectionOption[]
  authorId: string
}

export function CreateAnnouncementForm({ sections, authorId }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('announcements').insert({
      author_id: authorId || '00000000-0000-0000-0000-000000000000',
      title,
      content,
      target_role: targetRole || null,
      section_id: sectionId || null,
      is_published: true,
    })

    if (insertError) {
      console.error(insertError)
      setError('Failed to post announcement: ' + insertError.message)
      setSubmitting(false)
    } else {
      router.push('/admin/announcements')
      router.refresh()
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-slate-200/50 overflow-hidden ring-1 ring-slate-900/5">
      {/* Accent Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-500/20">
          <Megaphone className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Compose Announcement</h3>
          <p className="text-[11px] text-slate-400">Broadcast updates to entire school or targeted user groups</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200/80">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
            Announcement Title <span className="text-blue-600">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Mid-Term Examination Schedule Released"
            className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Target Audience
            </label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all cursor-pointer"
            >
              <option value="">Everyone (School-Wide)</option>
              <option value="STUDENT">Students Only</option>
              <option value="TEACHER">Teachers Only</option>
              <option value="PARENT">Parents Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Target Class Section (Optional)
            </label>
            <select
              value={sectionId}
              onChange={e => setSectionId(e.target.value)}
              className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all cursor-pointer"
            >
              <option value="">All Class Sections</option>
              {sections.map(s => {
                const gradeName = Array.isArray(s.grades) ? s.grades[0]?.name : s.grades?.name
                return (
                  <option key={s.id} value={s.id}>
                    {gradeName ? `${gradeName} — ` : ''}{s.name}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
            Announcement Content <span className="text-blue-600">*</span>
          </label>
          <textarea
            rows={5}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write the full announcement message, dates, instructions or details here..."
            className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all resize-y"
            required
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            href="/admin/announcements"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Publishing Notice...' : 'Publish Announcement'}
          </button>
        </div>
      </form>
    </div>
  )
}
