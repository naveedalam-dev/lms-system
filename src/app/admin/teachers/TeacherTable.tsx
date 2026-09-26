'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Trash2, GraduationCap } from 'lucide-react'
import { Badge, DataTable, EmptyState } from '@/components/ui/shared'
import { deleteTeacher, toggleTeacherStatus } from './actions'

interface TeacherProfile {
  employee_id?: string | null
  qualification?: string | null
  specialization?: string | null
  date_of_joining?: string | null
}

export interface TeacherRow {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  is_active: boolean
  created_at: string
  teacher_profiles?: TeacherProfile | TeacherProfile[] | null
}

export function TeacherTable({ initialTeachers }: { initialTeachers: TeacherRow[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = initialTeachers.filter(t => {
    const fullName = `${t.first_name || ''} ${t.last_name || ''}`.toLowerCase()
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())

    if (statusFilter === 'ACTIVE') return matchesSearch && t.is_active
    if (statusFilter === 'INACTIVE') return matchesSearch && !t.is_active
    return matchesSearch
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove teacher "${name}"?`)) return
    setDeletingId(id)
    await deleteTeacher(id)
    setDeletingId(null)
    router.refresh()
  }

  const handleToggle = async (id: string, current: boolean) => {
    await toggleTeacherStatus(id, current)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by faculty name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="glass-input rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Faculty ({initialTeachers.length})</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {filtered.length > 0 ? (
          <DataTable headers={['Faculty Member', 'Employee ID', 'Qualification', 'Department / Specialization', 'Status', 'Actions']}>
            {filtered.map(t => {
              const tpData = t.teacher_profiles
              const tp = Array.isArray(tpData) ? tpData[0] : tpData
              const fullName = [t.first_name, t.last_name].filter(Boolean).join(' ') || '—'
              const isDeleting = deletingId === t.id

              return (
                <tr key={t.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs font-mono font-bold">
                    <span className="bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-md">
                      {tp?.employee_id ?? '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs font-medium">
                    {tp?.qualification ?? '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {tp?.specialization ?? 'General'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggle(t.id, t.is_active)}
                      title="Click to toggle status"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Badge
                        label={t.is_active ? 'Active' : 'Inactive'}
                        color={t.is_active ? 'green' : 'red'}
                      />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, fullName)}
                        disabled={isDeleting}
                        title="Delete teacher"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </DataTable>
        ) : (
          <EmptyState
            icon={<GraduationCap className="w-10 h-10" />}
            title="No teachers found"
            description={
              search ? 'Try adjusting your search criteria.' : 'Add your first teacher to get started.'
            }
          />
        )}
      </div>
    </div>
  )
}
