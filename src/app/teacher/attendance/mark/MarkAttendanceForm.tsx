'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Check, Save, UserX, Clock, ShieldCheck } from 'lucide-react'
import { StudentAttendanceItem } from './page'

interface GradeInfo { name?: string }
interface SectionInfo { id?: string; name?: string; grades?: GradeInfo | GradeInfo[] }
interface SubjectInfo { id?: string; name?: string }

interface TeacherAssignmentProp {
  section_id: string
  subject_id: string
  sections?: SectionInfo | SectionInfo[] | null
  subjects?: SubjectInfo | SubjectInfo[] | null
}

function unwrap<T>(val: T | T[] | null | undefined): T | undefined {
  if (Array.isArray(val)) return val[0]
  return val ?? undefined
}

interface Props {
  teacherAssignments: TeacherAssignmentProp[]
  currentSectionId: string
  currentSubjectId: string
  initialStudents: StudentAttendanceItem[]
  teacherId: string
}

export function MarkAttendanceForm({
  teacherAssignments,
  currentSectionId,
  currentSubjectId,
  initialStudents,
  teacherId,
}: Props) {
  const router = useRouter()
  const [students, setStudents] = useState<StudentAttendanceItem[]>(initialStudents)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudents(prev =>
      prev.map(s => (s.student_id === studentId ? { ...s, status } : s))
    )
  }

  const markAll = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudents(prev => prev.map(s => ({ ...s, status })))
  }

  const handleSubmit = async () => {
    if (!currentSectionId) return
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const records = students.map(s => ({
      student_id: s.student_id,
      section_id: currentSectionId,
      subject_id: currentSubjectId || null,
      date: today,
      status: s.status,
      marked_by: teacherId || '00000000-0000-0000-0000-000000000000',
    }))

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,section_id,date,subject_id' })

      if (error) {
        console.error('Error saving attendance:', error)
        setMessage({ type: 'error', text: 'Failed to save attendance records.' })
      } else {
        setMessage({ type: 'success', text: 'Attendance recorded successfully!' })
        setTimeout(() => {
          router.push('/teacher/attendance')
        }, 1200)
      }
    } catch (e) {
      console.error(e)
      setMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section / Subject Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <label className="text-xs font-semibold text-slate-500 uppercase">Select Class:</label>
          <select
            value={currentSectionId}
            onChange={(e) => {
              const selected = teacherAssignments.find(a => a.section_id === e.target.value)
              router.push(`/teacher/attendance/mark?section=${e.target.value}&subject=${selected?.subject_id || ''}`)
            }}
            className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {teacherAssignments.map(a => (
              <option key={`${a.section_id}-${a.subject_id}`} value={a.section_id}>
                {(() => { const sec = unwrap(a.sections); const gr = unwrap(sec?.grades); return `${gr?.name ?? ''} — ${sec?.name ?? ''}`; })()} ({unwrap(a.subjects)?.name})
              </option>
            ))}
          </select>
        </div>

        {students.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => markAll('PRESENT')}
              className="text-xs font-medium px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('ABSENT')}
              className="text-xs font-medium px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              All Absent
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No students found for the selected section.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="bg-slate-50 px-6 py-3 grid grid-cols-12 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span className="col-span-2">Roll #</span>
              <span className="col-span-5">Student Name</span>
              <span className="col-span-5 text-right">Status</span>
            </div>
            {students.map((student) => (
              <div key={student.student_id} className="px-6 py-3 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors">
                <span className="col-span-2 text-xs font-mono text-slate-600">{student.roll_number}</span>
                <span className="col-span-5 text-sm font-medium text-slate-800">
                  {student.first_name} {student.last_name}
                </span>
                <div className="col-span-5 flex justify-end gap-1.5">
                  {[
                    { id: 'PRESENT', label: 'Present', icon: Check, activeBg: 'bg-emerald-600 text-white' },
                    { id: 'ABSENT', label: 'Absent', icon: UserX, activeBg: 'bg-red-600 text-white' },
                    { id: 'LATE', label: 'Late', icon: Clock, activeBg: 'bg-amber-500 text-white' },
                    { id: 'EXCUSED', label: 'Excused', icon: ShieldCheck, activeBg: 'bg-blue-600 text-white' },
                  ].map((statusOpt) => {
                    const Icon = statusOpt.icon
                    const isSelected = student.status === statusOpt.id
                    return (
                      <button
                        key={statusOpt.id}
                        type="button"
                        onClick={() => handleStatusChange(student.student_id, statusOpt.id as StudentAttendanceItem['status'])}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? `${statusOpt.activeBg} border-transparent shadow-sm`
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {statusOpt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {students.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
