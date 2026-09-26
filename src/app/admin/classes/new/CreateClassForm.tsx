'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Plus, BookOpen, Sparkles, Building, Hash } from 'lucide-react'

interface GradeItem {
  id: string
  name: string
}

interface AcademicYearItem {
  id: string
  name: string
  is_active?: boolean
}

interface Props {
  grades: GradeItem[]
  academicYears: AcademicYearItem[]
}

export function CreateClassForm({ grades: initialGrades, academicYears: initialAcademicYears }: Props) {
  const router = useRouter()
  const [grades, setGrades] = useState<GradeItem[]>(initialGrades || [])
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>(initialAcademicYears || [])
  const [gradeId, setGradeId] = useState(initialGrades[0]?.id || '')
  const [academicYearId, setAcademicYearId] = useState(
    initialAcademicYears.find(a => a.is_active)?.id || initialAcademicYears[0]?.id || ''
  )
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [capacity, setCapacity] = useState('30')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ensure grades and academic years are always loaded
  useEffect(() => {
    const supabase = createClient()

    if (grades.length === 0) {
      supabase
        .from('grades')
        .select('id, name')
        .order('sort_order', { ascending: true })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setGrades(data)
            if (!gradeId) setGradeId(data[0].id)
          }
        })
    }

    if (academicYears.length === 0) {
      supabase
        .from('academic_years')
        .select('id, name, is_active')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setAcademicYears(data)
            if (!academicYearId) {
              const active = data.find(y => y.is_active)
              setAcademicYearId(active?.id || data[0].id)
            }
          }
        })
    }
  }, [grades.length, academicYears.length, gradeId, academicYearId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !gradeId || !academicYearId) {
      setError('Please fill in all required fields.')
      return
    }
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('sections').insert({
      grade_id: gradeId,
      academic_year_id: academicYearId,
      name,
      room: room || null,
      capacity: parseInt(capacity, 10) || 30,
    })

    if (insertError) {
      console.error(insertError)
      setError('Failed to create class section: ' + insertError.message)
      setSubmitting(false)
    } else {
      router.push('/admin/classes')
      router.refresh()
    }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Form Header Accent */}
      <div className="px-6 py-4 border-b border-white/60 bg-white/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-500/30 shadow-2xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Class Section Setup</h3>
            <p className="text-[11px] text-slate-500">Assign grade tier, room location and enrollment limit</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-300/60 shadow-2xs">
          Ready
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-500/15 text-rose-800 text-xs font-semibold rounded-xl border border-rose-300/60 shadow-2xs backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
              Grade Level <span className="text-blue-600">*</span>
            </label>
            <div className="relative">
              <select
                value={gradeId}
                onChange={e => setGradeId(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                required
              >
                <option value="" disabled>
                  {grades.length === 0 ? 'Loading grades...' : 'Select Grade Level'}
                </option>
                {grades.map(g => (
                  <option key={g.id} value={g.id} className="text-slate-800">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
              Academic Year <span className="text-blue-600">*</span>
            </label>
            <div className="relative">
              <select
                value={academicYearId}
                onChange={e => setAcademicYearId(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                required
              >
                <option value="" disabled>
                  {academicYears.length === 0 ? 'Loading sessions...' : 'Select Academic Year'}
                </option>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id} className="text-slate-800">
                    {y.name} {y.is_active ? '— (Active Term)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
            Section Name <span className="text-blue-600">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Section A"
            className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
              Room Number / Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. Room 102"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
              Student Capacity
            </label>
            <div className="relative">
              <input
                type="number"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                placeholder="30"
                min="1"
                max="100"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <Link
            href="/admin/classes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || grades.length === 0}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Plus className="w-4 h-4" />
            {submitting ? 'Creating Section...' : 'Create Class Section'}
          </button>
        </div>
      </form>
    </div>
  )
}
