'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Plus, Users, Trash2, Search, Building2, MapPin, Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/ui/shared'
import { deleteClassSection } from './actions'

export interface SectionItem {
  id: string
  name: string
  room?: string | null
  capacity?: number | null
  studentCount?: number
  grades?: { name?: string; tier?: string } | null
  academic_years?: { name?: string } | null
}

export function ClassesView({ initialSections }: { initialSections: SectionItem[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = initialSections.filter(s => {
    const gradeName = s.grades?.name || ''
    const term = `${gradeName} ${s.name} ${s.room || ''}`.toLowerCase()
    return term.includes(search.toLowerCase())
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete class section "${name}"?`)) return
    setDeletingId(id)
    await deleteClassSection(id)
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Search Bar & Glass Action Header */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes by grade or section..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <Link
          href="/admin/classes/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Class Section
        </Link>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(s => {
            const isDeleting = deletingId === s.id
            const enrollmentPercentage = Math.min(Math.round(((s.studentCount || 0) / (s.capacity || 30)) * 100), 100)

            return (
              <div
                key={s.id}
                className="glass-card glass-card-hover rounded-2xl p-6 space-y-5 relative group"
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-500/15 text-blue-700 border border-blue-500/30 backdrop-blur-md">
                      <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                      {s.grades?.name || 'Grade Level'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg tracking-tight pt-1">{s.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-white/60 border border-white/80 px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                      {s.academic_years?.name || 'Current AY'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, `${s.grades?.name} - ${s.name}`)}
                      disabled={isDeleting}
                      title="Delete class section"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location & Capacity Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-white/50 backdrop-blur-md p-3.5 rounded-xl border border-white/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Room</p>
                      <p className="font-bold text-slate-800 truncate">{s.room || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">Capacity</p>
                      <p className="font-bold text-slate-800 truncate">{s.capacity || 30} max</p>
                    </div>
                  </div>
                </div>

                {/* Enrollment Progress Indicator */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Enrolled</span>
                    </span>
                    <span className="text-slate-800 font-mono font-bold">
                      {s.studentCount || 0} / {s.capacity || 30} ({enrollmentPercentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(enrollmentPercentage, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="No class sections found"
          description={
            search ? 'No classes match your search query.' : 'Click "Add New Class Section" to create your first class.'
          }
        />
      )}
    </div>
  )
}
