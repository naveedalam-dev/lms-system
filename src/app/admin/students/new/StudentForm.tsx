'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { createStudent } from '../actions'

interface GradeOption {
  id: string
  name: string
}

interface SectionOption {
  id: string
  name: string
  grade_id: string
}

interface Props {
  grades: GradeOption[]
  sections: SectionOption[]
}

export function StudentForm({ grades: initialGrades, sections: initialSections }: Props) {
  const router = useRouter()
  const [grades, setGrades] = useState<GradeOption[]>(initialGrades || [])
  const [sections, setSections] = useState<SectionOption[]>(initialSections || [])
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (grades.length === 0) {
      supabase.from('grades').select('id, name').order('sort_order', { ascending: true }).then(({ data }) => {
        if (data && data.length > 0) setGrades(data)
      })
    }
    if (sections.length === 0) {
      supabase.from('sections').select('id, name, grade_id').order('name', { ascending: true }).then(({ data }) => {
        if (data && data.length > 0) setSections(data)
      })
    }
  }, [grades.length, sections.length])

  // Filter sections when a grade is selected
  const filteredSections = selectedGrade
    ? sections.filter(s => s.grade_id === selectedGrade)
    : sections

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createStudent(formData)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/students')
        router.refresh()
      }, 1000)
    } else {
      setError(result.error || 'Failed to create student')
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/60 bg-white/40 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Student Profile Information</h2>
          <p className="text-xs text-slate-500">Provide basic demographic and academic details</p>
        </div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 glass-input px-3.5 py-2 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Students
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
            <span>Student created successfully! Redirecting...</span>
          </div>
        )}

        {/* Account Credentials */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Account Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                name="email"
                type="email"
                required
                placeholder="student@school.edu"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
              <input
                name="password"
                type="password"
                defaultValue="Student@1234"
                required
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Default: Student@1234</p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-4 pt-4 border-t border-white/60">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                name="first_name"
                type="text"
                required
                placeholder="e.g. Ali"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
              <input
                name="last_name"
                type="text"
                placeholder="e.g. Hassan"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                name="roll_number"
                type="text"
                placeholder="e.g. G8-010"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                defaultValue=""
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                name="date_of_birth"
                type="date"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Academic Placement */}
        <div className="space-y-4 pt-4 border-t border-white/60">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Class & Grade Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level</label>
              <select
                name="grade_id"
                value={selectedGrade}
                onChange={e => {
                  setSelectedGrade(e.target.value)
                  setSelectedSection('')
                }}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="">Select Grade</option>
                {grades.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Section</label>
              <select
                name="section_id"
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="">Select Section</option>
                {filteredSections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Guardian Info */}
        <div className="space-y-4 pt-4 border-t border-white/60">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Guardian Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name</label>
              <input
                name="guardian_name"
                type="text"
                placeholder="Parent or Guardian"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone</label>
              <input
                name="guardian_phone"
                type="tel"
                placeholder="+1234567890"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/60">
          <Link
            href="/admin/students"
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || success}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Student...' : 'Save & Register Student'}
          </button>
        </div>
      </form>
    </div>
  )
}
