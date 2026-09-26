'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface StudentRosterItem {
  user_id: string
  roll_number?: string | null
  profiles?: { first_name?: string; last_name?: string; email?: string } | { first_name?: string; last_name?: string; email?: string }[] | null
}

interface SubmissionRecordItem {
  student_id: string
  status?: string | null
  marks_obtained?: number | null
  feedback?: string | null
  file_url?: string | null
}

interface Props {
  assignmentId: string
  totalMarks: number
  students: StudentRosterItem[]
  submissions: SubmissionRecordItem[]
  teacherId: string
}

export function GradeSubmissionsList({
  assignmentId,
  totalMarks,
  students,
  submissions,
  teacherId,
}: Props) {
  const [submissionList, setSubmissionList] = useState(submissions)
  const [gradingState, setGradingState] = useState<Record<string, { marks: string; feedback: string; saving?: boolean }>>({})

  const submissionMap = new Map(submissionList.map(s => [s.student_id, s]))

  const handleGradeChange = (studentId: string, field: 'marks' | 'feedback', value: string) => {
    const existing = submissionMap.get(studentId)
    setGradingState(prev => ({
      ...prev,
      [studentId]: {
        marks: field === 'marks' ? value : (prev[studentId]?.marks ?? existing?.marks_obtained?.toString() ?? ''),
        feedback: field === 'feedback' ? value : (prev[studentId]?.feedback ?? existing?.feedback ?? ''),
      },
    }))
  }

  const saveGrade = async (studentId: string) => {
    const currentGrade = gradingState[studentId]
    if (!currentGrade) return

    setGradingState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], saving: true },
    }))

    const supabase = createClient()
    const marksNum = parseFloat(currentGrade.marks) || 0

    const { data, error } = await supabase
      .from('submissions')
      .upsert({
        assignment_id: assignmentId,
        student_id: studentId,
        marks_obtained: marksNum,
        feedback: currentGrade.feedback,
        status: 'GRADED',
        graded_by: teacherId || null,
        graded_at: new Date().toISOString(),
      }, { onConflict: 'assignment_id,student_id' })
      .select()

    if (!error && data) {
      setSubmissionList(prev => {
        const filtered = prev.filter(s => s.student_id !== studentId)
        return [...filtered, data[0]]
      })
    }

    setGradingState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], saving: false },
    }))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
      {students.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          No students registered in this section.
        </div>
      ) : (
        students.map(s => {
          const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
          const submission = submissionMap.get(s.user_id)
          const isGraded = submission?.status === 'GRADED'
          const state = gradingState[s.user_id] || {
            marks: submission?.marks_obtained?.toString() || '',
            feedback: submission?.feedback || '',
          }

          return (
            <div key={s.user_id} className="p-4 sm:p-6 space-y-3 hover:bg-slate-50/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    {profile?.first_name} {profile?.last_name}
                  </h4>
                  <p className="text-xs text-slate-400">Roll #: {s.roll_number || 'N/A'} • {profile?.email}</p>
                </div>

                <div>
                  {isGraded ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" /> Graded ({submission.marks_obtained}/{totalMarks})
                    </span>
                  ) : submission ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      <Clock className="w-3 h-3" /> Submitted - Pending Grade
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      <AlertCircle className="w-3 h-3" /> Not Submitted
                    </span>
                  )}
                </div>
              </div>

              {submission?.file_url && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  Submission File: <a href={submission.file_url} target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">View Attachment</a>
                </div>
              )}

              {/* Grading Input Controls */}
              <div className="pt-2 flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Marks (Out of {totalMarks})</label>
                  <input
                    type="number"
                    value={state.marks}
                    onChange={e => handleGradeChange(s.user_id, 'marks', e.target.value)}
                    placeholder="0"
                    max={totalMarks}
                    className="w-24 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Teacher Feedback</label>
                  <input
                    type="text"
                    value={state.feedback}
                    onChange={e => handleGradeChange(s.user_id, 'feedback', e.target.value)}
                    placeholder="e.g. Good effort, review chapter 3."
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={state.saving}
                  onClick={() => saveGrade(s.user_id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {state.saving ? 'Saving...' : 'Save Grade'}
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
