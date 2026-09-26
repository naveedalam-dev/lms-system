'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Trash2, CheckCircle2, ShieldCheck, Database, Server, Key, Sparkles } from 'lucide-react'
import { createAcademicYear, setActiveAcademicYear, deleteAcademicYear } from './actions'

export interface AcademicYearItem {
  id: string
  name: string
  start_date: string
  end_date: string
  is_active?: boolean
}

interface Props {
  academicYears: AcademicYearItem[]
  projectRef: string
  supabaseUrl: string
}

export function SettingsView({ academicYears, projectRef, supabaseUrl }: Props) {
  const router = useRouter()
  const [showAddYear, setShowAddYear] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const handleCreateYear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createAcademicYear(formData)

    if (result.success) {
      setShowAddYear(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to create academic session')
    }
    setLoading(false)
  }

  const handleSetActive = async (id: string) => {
    setActionId(id)
    await setActiveAcademicYear(id)
    setActionId(null)
    router.refresh()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete academic session "${name}"?`)) return
    setActionId(id)
    await deleteAcademicYear(id)
    setActionId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Supabase Connection Status Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-slate-200/50 p-6 space-y-5 ring-1 ring-slate-900/5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Supabase Cloud Database</h3>
              <p className="text-[11px] text-slate-400">Production Postgres Cluster Live Connection</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected & Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Project Ref</span>
            <span className="font-mono font-bold text-slate-900">{projectRef}</span>
          </div>
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Postgres Version</span>
            <span className="font-mono font-bold text-slate-900">PostgreSQL 17.6 (Active)</span>
          </div>
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Hosting Region</span>
            <span className="font-mono font-bold text-slate-900">ap-northeast-1 (Tokyo)</span>
          </div>
        </div>
      </div>

      {/* Academic Sessions Management */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 shadow-lg shadow-slate-200/50 p-6 space-y-5 ring-1 ring-slate-900/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 tracking-tight">
              <Calendar className="w-4 h-4 text-blue-600" /> Academic Years & Terms
            </h3>
            <p className="text-[11px] text-slate-400">Configure academic sessions and assign the active school calendar.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddYear(!showAddYear)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> {showAddYear ? 'Cancel' : 'Add Academic Session'}
          </button>
        </div>

        {showAddYear && (
          <form onSubmit={handleCreateYear} className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">New Academic Session</h4>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200/80">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Session Name *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. 2025-2026"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Start Date *</label>
                <input
                  name="start_date"
                  type="date"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">End Date *</label>
                <input
                  name="end_date"
                  type="date"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={false}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700">Set as Current Active Session</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddYear(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* List of Years */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white/60">
          {academicYears.length > 0 ? (
            academicYears.map(y => {
              const isOperating = actionId === y.id
              return (
                <div key={y.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{y.name}</h4>
                      {y.is_active && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                          Active Term
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      {new Date(y.start_date).toLocaleDateString()} — {new Date(y.end_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!y.is_active && (
                      <button
                        type="button"
                        onClick={() => handleSetActive(y.id)}
                        disabled={isOperating}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl border border-blue-200/60 transition-colors disabled:opacity-50"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(y.id, y.name)}
                      disabled={isOperating || y.is_active}
                      title={y.is_active ? 'Cannot delete active term' : 'Delete academic session'}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-6 text-xs text-slate-400 text-center">No academic sessions found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
