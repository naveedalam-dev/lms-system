'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Search, Megaphone, Filter, Calendar, User, Users } from 'lucide-react'
import { EmptyState } from '@/components/ui/shared'
import { deleteAnnouncement } from './actions'

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  target_role?: string | null
  created_at: string
  profiles?: { first_name?: string; last_name?: string; role?: string } | { first_name?: string; last_name?: string; role?: string }[] | null
  sections?: { name?: string; grades?: { name?: string } } | null
}

export function AnnouncementsList({ initialAnnouncements }: { initialAnnouncements: AnnouncementItem[] }) {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = announcements.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())

    if (roleFilter === 'ALL') return matchesSearch
    return matchesSearch && a.target_role === roleFilter
  })

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete announcement "${title}"?`)) return
    setDeletingId(id)
    await deleteAnnouncement(id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between ring-1 ring-slate-900/5">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300 cursor-pointer"
            >
              <option value="ALL">All Audiences</option>
              <option value="STUDENT">Students Only</option>
              <option value="TEACHER">Teachers Only</option>
              <option value="PARENT">Parents Only</option>
            </select>
          </div>
        </div>

        <Link
          href="/admin/announcements/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </Link>
      </div>

      {/* Announcements Cards */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(a => {
            const author = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles
            const isDeleting = deletingId === a.id

            return (
              <div
                key={a.id}
                className="bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-2xl border border-white/80 shadow-lg shadow-slate-200/40 space-y-4 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300 relative group ring-1 ring-slate-900/5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[10px] uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-full shadow-2xs">
                      {a.target_role ? `${a.target_role}s` : 'All School'}
                    </span>
                    {a.sections && (
                      <span className="font-semibold text-slate-700 bg-slate-50 border border-slate-200/70 px-2.5 py-0.5 rounded-full text-xs">
                        {a.sections.grades?.name} — {a.sections.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id, a.title)}
                      disabled={isDeleting}
                      title="Delete announcement"
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{a.title}</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{a.content}</p>
                </div>

                <div className="pt-3 text-[11px] text-slate-400 border-t border-slate-100/80 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Posted by:</span>
                  <span className="font-semibold text-slate-600">
                    {author?.first_name || 'School'} {author?.last_name || 'Admin'}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-[10px] text-slate-400">({author?.role || 'SUPER_ADMIN'})</span>
                </div>
              </div>
            )
          })
        ) : (
          <EmptyState
            icon={<Megaphone className="w-10 h-10" />}
            title="No announcements found"
            description={
              search ? 'No notices matched your filter.' : 'Click "Create Announcement" to post your first notice.'
            }
          />
        )}
      </div>
    </div>
  )
}
