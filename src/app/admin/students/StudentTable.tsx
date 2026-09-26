'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Trash2, CheckCircle, XCircle, Users } from 'lucide-react'
import { Badge, DataTable, EmptyState } from '@/components/ui/shared'
import { deleteStudent, toggleStudentStatus } from './actions'

interface StudentProfile {
  roll_number?: string | null
  grades?: { name?: string } | null
  sections?: { name?: string } | null
}

export interface StudentRow {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  is_active: boolean
  created_at: string
  student_profiles?: StudentProfile | StudentProfile[] | null
}

export function StudentTable({ initialStudents }: { initialStudents: StudentRow[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = initialStudents.filter(s => {
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase()
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())

    if (statusFilter === 'ACTIVE') return matchesSearch && s.is_active
    if (statusFilter === 'INACTIVE') return matchesSearch && !s.is_active
    return matchesSearch
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove student "${name}"?`)) return
    setDeletingId(id)
    await deleteStudent(id)
    setDeletingId(null)
    router.refresh()
  }

  const handleToggle = async (id: string, current: boolean) => {
    await toggleStudentStatus(id, current)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Glass Card */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
            <option value="ALL">All Students ({initialStudents.length})</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table Glass Card */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {filtered.length > 0 ? (
          <DataTable headers={['Student Information', 'Roll Number', 'Grade Level', 'Class Section', 'Status', 'Registered Date', 'Actions']}>
            {filtered.map(s => {
              const spData = s.student_profiles
              const sp = Array.isArray(spData) ? spData[0] : spData
              const fullName = [s.first_name, s.last_name].filter(Boolean).join(' ') || '—'
              const isDeleting = deletingId === s.id

              return (
                <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                        {fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{fullName}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs font-mono font-bold">
                    <span className="bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-md">
                      {sp?.roll_number ?? '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs font-semibold">
                    {sp?.grades?.name ?? '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                    {sp?.sections?.name ?? '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggle(s.id, s.is_active)}
                      title="Click to toggle status"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Badge
                        label={s.is_active ? 'Active' : 'Inactive'}
                        color={s.is_active ? 'green' : 'red'}
                      />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id, fullName)}
                        disabled={isDeleting}
                        title="Delete student"
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
            icon={<Users className="w-10 h-10" />}
            title="No students found"
            description={
              search ? 'Try adjusting your search criteria.' : 'Add your first student to get started.'
            }
          />
        )}
      </div>
    </div>
  )
}
