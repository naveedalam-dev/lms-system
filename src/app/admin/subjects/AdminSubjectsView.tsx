'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Search, BookOpen, Palette, Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/ui/shared'

export interface SubjectItem {
  id: string
  name: string
  code: string
  description?: string | null
  color?: string | null
}

interface Props {
  initialSubjects: SubjectItem[]
}

export function AdminSubjectsView({ initialSubjects }: Props) {
  const router = useRouter()
  const [subjects, setSubjects] = useState(initialSubjects)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = subjects.filter(s =>
    `${s.name} ${s.code} ${s.description || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !code) return
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('subjects')
      .insert({ name, code: code.toUpperCase(), description, color })
      .select()

    if (!error && data) {
      setSubjects(prev => [...prev, data[0]])
      setName('')
      setCode('')
      setDescription('')
      setShowForm(false)
      router.refresh()
    } else {
      console.error('Failed to add subject:', error)
      setError(error?.message || 'Failed to add subject.')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string, subjectName: string) => {
    if (!confirm(`Are you sure you want to delete subject "${subjectName}"?`)) return
    setDeletingId(id)

    const supabase = createClient()
    const { error } = await supabase.from('subjects').delete().eq('id', id)

    if (!error) {
      setSubjects(prev => prev.filter(s => s.id !== id))
      router.refresh()
    } else {
      alert(`Could not delete subject: ${error.message}`)
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects by name or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel Form' : 'Add Subject'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="glass-card p-6 sm:p-8 rounded-2xl space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/60">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-500/30 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Add New Subject</h3>
              <p className="text-[11px] text-slate-500">Configure curriculum subject and UI visual color</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 text-rose-800 text-xs font-semibold rounded-xl border border-rose-300/60 shadow-2xs backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">Subject Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Physics"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">Subject Code *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. PHY101"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none uppercase font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief course syllabus summary..."
                className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">Visual Color Accent</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-12 h-11 p-0.5 border border-white/80 rounded-xl cursor-pointer bg-white/70 shadow-2xs"
                />
                <span className="text-xs font-mono font-bold text-slate-700 bg-white/60 border border-white/80 px-3 py-2 rounded-xl shadow-2xs backdrop-blur-xs">{color}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/60">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Subject'}
            </button>
          </div>
        </form>
      )}

      {/* Subjects Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => {
            const isDeleting = deletingId === s.id
            return (
              <div
                key={s.id}
                className="glass-card glass-card-hover rounded-2xl p-6 space-y-4 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 ring-2 ring-white/60"
                      style={{ backgroundColor: s.color || '#3B82F6' }}
                    >
                      {s.code.slice(0, 4)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base tracking-tight">{s.name}</h3>
                      <p className="text-xs text-slate-500 font-mono font-bold">{s.code}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.name)}
                    disabled={isDeleting}
                    title="Delete subject"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {s.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 pt-2 border-t border-white/60 leading-relaxed">{s.description}</p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title="No subjects found"
          description={search ? 'No subjects matched your search.' : 'Add your first subject to get started.'}
        />
      )}
    </div>
  )
}
