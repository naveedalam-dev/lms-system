'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Megaphone, Send } from 'lucide-react'

interface AnnouncementItem {
  id: string
  title: string
  content: string
  created_at: string
  profiles?: { first_name?: string; last_name?: string; role?: string } | { first_name?: string; last_name?: string; role?: string }[] | null
  sections?: { name?: string; grades?: { name?: string } } | null
}

export interface TeacherAssignmentItem {
  section_id: string
  sections?: { id?: string; name?: string; grades?: { name?: string } | { name?: string }[] } | { id?: string; name?: string; grades?: { name?: string } | { name?: string }[] }[] | null
}

interface Props {
  initialAnnouncements: AnnouncementItem[]
  teacherAssignments: TeacherAssignmentItem[]
  teacherId: string
}

export function TeacherAnnouncementsView({
  initialAnnouncements,
  teacherAssignments,
  teacherId,
}: Props) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetSectionId, setTargetSectionId] = useState('')
  const [publishing, setPublishing] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    setPublishing(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        author_id: teacherId || '00000000-0000-0000-0000-000000000000',
        title,
        content,
        target_role: 'STUDENT',
        section_id: targetSectionId || null,
        is_published: true,
      })
      .select('*, profiles(first_name, last_name, role), sections(name, grades(name))')

    if (!error && data) {
      setAnnouncements(prev => [data[0], ...prev])
      setTitle('')
      setContent('')
      setShowForm(false)
    } else {
      console.error('Failed to post announcement:', error)
    }
    setPublishing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Post New Announcement</h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Target Audience</label>
            <select
              value={targetSectionId}
              onChange={e => setTargetSectionId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All My Classes / School-wide</option>
              {teacherAssignments.map(a => {
                const secObj = Array.isArray(a.sections) ? a.sections[0] : a.sections
                const gName = Array.isArray(secObj?.grades) ? secObj?.grades[0]?.name : secObj?.grades?.name
                return (
                  <option key={a.section_id} value={a.section_id}>
                    {gName} — {secObj?.name}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Headline / Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Science Quiz Postponed to Friday"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Announcement Body *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write announcement details..."
              rows={4}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={publishing}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {publishing ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* Announcement List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-100 text-slate-500 text-sm">
            <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            No announcements yet.
          </div>
        ) : (
          announcements.map(a => {
            const author = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
            return (
              <div key={a.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {a.sections ? `${a.sections.grades?.name} — ${a.sections.name}` : 'School-wide'}
                  </span>
                  <span>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{a.title}</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.content}</p>
                <div className="pt-2 text-[11px] text-slate-400">
                  Posted by {author?.first_name} {author?.last_name} ({author?.role || 'Staff'})
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
