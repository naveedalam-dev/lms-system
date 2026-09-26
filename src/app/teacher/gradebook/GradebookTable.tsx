'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Save, CheckCircle2 } from 'lucide-react'

interface GradeInfo { name?: string }
interface SectionInfo { name?: string; grades?: GradeInfo | GradeInfo[] }
interface SubjectInfo { name?: string }

interface TeacherAssignmentOption {
  section_id: string
  subject_id: string
  sections?: SectionInfo | SectionInfo[] | null
  subjects?: SubjectInfo | SubjectInfo[] | null
}

function unwrap<T>(val: T | T[] | null | undefined): T | undefined {
  if (Array.isArray(val)) return val[0]
  return val ?? undefined
}

interface ExamTypeOption {
  id: string
  name: string
  weight: number
}

export interface StudentGradeRow {
  student_id: string
  roll_number: string
  name: string
  marks_obtained: string | number
  total_marks: number
  remarks: string
}

interface Props {
  teacherAssignments: TeacherAssignmentOption[]
  examTypes: ExamTypeOption[]
  selectedSectionId: string
  selectedSubjectId: string
  selectedExamTypeId: string
  academicYearId: string
  rows: StudentGradeRow[]
  teacherId: string
}

export function GradebookTable({
  teacherAssignments,
  examTypes,
  selectedSectionId,
  selectedSubjectId,
  selectedExamTypeId,
  academicYearId,
  rows,
  teacherId,
}: Props) {
  const router = useRouter()
  const [gradeData, setGradeData] = useState(rows)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (studentId: string, field: 'marks_obtained' | 'remarks', value: string) => {
    setGradeData(prev =>
      prev.map(r => (r.student_id === studentId ? { ...r, [field]: value } : r))
    )
  }

  const handleSaveAll = async () => {
    if (!selectedSectionId || !selectedSubjectId || !selectedExamTypeId) return
    setSaving(true)
    setSuccess(false)

    const supabase = createClient()

    // Fetch active academic year if not provided
    let yearId = academicYearId
    if (!yearId) {
      const { data: activeYear } = await supabase.from('academic_years').select('id').eq('is_active', true).single()
      yearId = activeYear?.id || '00000000-0000-0000-0000-000000000000'
    }

    const recordsToUpsert = gradeData
      .filter(r => r.marks_obtained !== '')
      .map(r => ({
        student_id: r.student_id,
        subject_id: selectedSubjectId,
        section_id: selectedSectionId,
        exam_type_id: selectedExamTypeId,
        academic_year_id: yearId,
        marks_obtained: parseFloat(String(r.marks_obtained)) || 0,
        total_marks: 100,
        remarks: r.remarks || null,
        recorded_by: teacherId || '00000000-0000-0000-0000-000000000000',
      }))

    if (recordsToUpsert.length > 0) {
      const { error } = await supabase.from('grades_records').upsert(recordsToUpsert, {
        onConflict: 'student_id,subject_id,section_id,exam_type_id,academic_year_id',
      })

      if (error) {
        console.error('Error saving grades:', error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Class / Subject</label>
            <select
              value={`${selectedSectionId}:${selectedSubjectId}`}
              onChange={e => {
                const [sec, sub] = e.target.value.split(':')
                router.push(`/teacher/gradebook?section=${sec}&subject=${sub}&exam=${selectedExamTypeId}`)
              }}
              className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {teacherAssignments.map(a => (
                <option key={`${a.section_id}-${a.subject_id}`} value={`${a.section_id}:${a.subject_id}`}>
                  {(() => { const sec = unwrap(a.sections); const gr = unwrap(sec?.grades); return `${gr?.name ?? ''} — ${sec?.name ?? ''}`; })()} ({unwrap(a.subjects)?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Exam / Assessment</label>
            <select
              value={selectedExamTypeId}
              onChange={e => {
                router.push(`/teacher/gradebook?section=${selectedSectionId}&subject=${selectedSubjectId}&exam=${e.target.value}`)
              }}
              className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {examTypes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} (Weight: {t.weight}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 font-medium px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" /> Grades saved!
          </div>
        )}
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {gradeData.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No students found for this class.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="bg-slate-50 px-6 py-3 grid grid-cols-12 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span className="col-span-2">Roll #</span>
              <span className="col-span-4">Student Name</span>
              <span className="col-span-3 text-center">Score (Max 100)</span>
              <span className="col-span-3">Remarks</span>
            </div>

            {gradeData.map(row => (
              <div key={row.student_id} className="px-6 py-3 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors">
                <span className="col-span-2 text-xs font-mono text-slate-600">{row.roll_number}</span>
                <span className="col-span-4 text-sm font-medium text-slate-800">{row.name}</span>
                <div className="col-span-3 flex justify-center">
                  <input
                    type="number"
                    value={row.marks_obtained}
                    onChange={e => handleChange(row.student_id, 'marks_obtained', e.target.value)}
                    placeholder="0-100"
                    min={0}
                    max={100}
                    className="w-24 text-center border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={row.remarks}
                    onChange={e => handleChange(row.student_id, 'remarks', e.target.value)}
                    placeholder="Comments..."
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {gradeData.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAll}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Gradebook'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
