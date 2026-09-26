'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react'
import { createTeacher } from '../actions'

export function TeacherForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createTeacher(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/teachers')
        router.refresh()
      }, 1000)
    } else {
      setError(result.error || 'Failed to create teacher')
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/60 bg-white/40 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Teacher Professional Profile</h2>
          <p className="text-xs text-slate-500">Add credentials, qualifications, and department info</p>
        </div>
        <Link
          href="/admin/teachers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 glass-input px-3.5 py-2 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Teachers
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Teacher registered successfully! Redirecting...</span>
          </div>
        )}

        {/* Credentials */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Account Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                name="email"
                type="email"
                required
                placeholder="teacher@school.edu"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
              <input
                name="password"
                type="password"
                defaultValue="Teacher@1234"
                required
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Default: Teacher@1234</p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-4 pt-4 border-t border-white/60">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Teacher Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                name="first_name"
                type="text"
                required
                placeholder="e.g. Sarah"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                name="last_name"
                type="text"
                placeholder="e.g. Johnson"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4 pt-4 border-t border-white/60">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Professional & Academic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
              <input
                name="employee_id"
                type="text"
                placeholder="e.g. EMP-003"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
              <input
                name="qualification"
                type="text"
                placeholder="e.g. M.Sc. Mathematics, B.Ed"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization / Department</label>
              <input
                name="specialization"
                type="text"
                placeholder="e.g. Mathematics & Computer Science"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Joining</label>
              <input
                name="date_of_joining"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/60">
          <Link
            href="/admin/teachers"
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || success}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Registering Teacher...' : 'Save & Register Teacher'}
          </button>
        </div>
      </form>
    </div>
  )
}
