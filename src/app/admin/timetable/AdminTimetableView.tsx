'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Filter, Calendar, Clock, MapPin, User, Sparkles } from 'lucide-react'

interface SectionOption {
  id: string
  name: string
  grades?: { name?: string } | null
}

interface SubjectOption {
  id: string
  name: string
  color?: string | null
}

interface TeacherOption {
  id: string
  first_name?: string | null
  last_name?: string | null
}

interface TimetableSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  room?: string | null
  sections?: { name?: string; grades?: { name?: string } } | null
  subjects?: { name?: string; color?: string } | null
  profiles?: { first_name?: string; last_name?: string } | { first_name?: string; last_name?: string }[] | null
  section_id?: string
}

interface Props {
  sections: SectionOption[]
  subjects: SubjectOption[]
  teachers: TeacherOption[]
  initialTimetable: TimetableSlot[]
  academicYearId: string
}

export function AdminTimetableView({
  sections,
  subjects,
  teachers,
  initialTimetable,
  academicYearId,
}: Props) {
  const router = useRouter()
  const [timetable, setTimetable] = useState(initialTimetable)
  const [showForm, setShowForm] = useState(false)
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('ALL')
  const [sectionId, setSectionId] = useState(sections[0]?.id || '')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '')
  const [dayOfWeek, setDayOfWeek] = useState(0)
  const [startTime, setStartTime] = useState('08:30')
  const [endTime, setEndTime] = useState('09:30')
  const [room, setRoom] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const filteredTimetable = selectedSectionFilter === 'ALL'
    ? timetable
    : timetable.filter(t => (t as any).section_id === selectedSectionFilter)

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionId || !subjectId || !teacherId) return
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('timetable')
      .insert({
        section_id: sectionId,
        subject_id: subjectId,
        teacher_id: teacherId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        room: room || null,
        academic_year_id: academicYearId || 'fdbca22e-9d82-4a8d-8a79-3b521e9bbbc9',
      })
      .select('*, sections(name, grades(name)), subjects(name, color), profiles:teacher_id(first_name, last_name)')

    if (!insertError && data) {
      setTimetable(prev => [...prev, data[0]])
      setShowForm(false)
      setRoom('')
      router.refresh()
    } else {
      console.error('Failed to add timetable slot:', insertError)
      setError(insertError?.message || 'Failed to add timetable slot.')
    }
    setSubmitting(false)
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to remove this timetable slot?')) return
    setDeletingId(id)

    const supabase = createClient()
    const { error: delError } = await supabase.from('timetable').delete().eq('id', id)

    if (!delError) {
      setTimetable(prev => prev.filter(t => t.id !== id))
      router.refresh()
    } else {
      alert(`Could not delete slot: ${delError.message}`)
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Glass Action / Filter Bar */}
      <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between ring-1 ring-slate-900/5">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Section:</span>
          <select
            value={selectedSectionFilter}
            onChange={e => setSelectedSectionFilter(e.target.value)}
            className="bg-slate-50/70 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:border-slate-300 cursor-pointer"
          >
            <option value="ALL">All Class Sections ({timetable.length} slots)</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>
                {s.grades?.name} — {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel Slot' : 'Schedule Class Slot'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddSlot} className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/80 shadow-lg shadow-slate-200/50 space-y-5 ring-1 ring-slate-900/5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Schedule Timetable Slot</h3>
              <p className="text-[11px] text-slate-400">Add course period with assigned classroom and educator</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200/80">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Class Section *</label>
              <select
                value={sectionId}
                onChange={e => setSectionId(e.target.value)}
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                required
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.grades?.name} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Subject *</label>
              <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                required
              >
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Teacher *</label>
              <select
                value={teacherId}
                onChange={e => setTeacherId(e.target.value)}
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
                required
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.first_name} {t.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Day of Week *</label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
              >
                {daysOfWeek.map((d, idx) => (
                  <option key={d} value={idx}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">End Time *</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Room / Lab</label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. Lab 1"
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Add Slot'}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Days with Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {daysOfWeek.map((dayName, dayIdx) => {
          const slots = filteredTimetable.filter(t => t.day_of_week === dayIdx)
          return (
            <div key={dayName} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/80 p-5 space-y-3.5 shadow-sm ring-1 ring-slate-900/5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  {dayName}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {slots.length}
                </span>
              </div>

              {slots.length > 0 ? (
                <div className="space-y-3">
                  {slots.map(s => {
                    const teacher = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
                    const isDeleting = deletingId === s.id
                    return (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-2 relative group hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-slate-900 leading-tight">
                            {s.subjects?.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(s.id)}
                            disabled={isDeleting}
                            title="Remove slot"
                            className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] font-bold text-blue-600">
                          {s.sections?.grades?.name} — {s.sections?.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</span>
                          {s.room && (
                            <span className="ml-auto text-[10px] font-bold text-slate-600 bg-white border border-slate-200/60 px-1.5 py-0.2 rounded">
                              {s.room}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                          <User className="w-2.5 h-2.5" />
                          <span>{teacher?.first_name} {teacher?.last_name}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No slots
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
