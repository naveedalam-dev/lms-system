'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Plus } from 'lucide-react'

interface GradeInfo { name?: string }
interface SectionInfo { name?: string; grades?: GradeInfo | GradeInfo[] }
interface SubjectInfo { name?: string }

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
  teacherId: string
}

export function CreateAssignmentForm({ teacherAssignments, teacherId }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignmentIndex, setAssignmentIndex] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [totalMarks, setTotalMarks] = useState('100')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const selectedAssignment = teacherAssignments[assignmentIndex]
    if (!selectedAssignment) {
      setError('Please select a valid class and subject.')
      setSubmitting(false)
      return
    }

    const supabase = createClient()
    const { error: insertError } = await supabase.from('assignments').insert({
      teacher_id: teacherId || '00000000-0000-0000-0000-000000000000',
      section_id: selectedAssignment.section_id,
      subject_id: selectedAssignment.subject_id,
      title,
      description,
      due_date: new Date(dueDate).toISOString(),
      total_marks: parseInt(totalMarks, 10) || 100,
      is_published: true,
    })

    if (insertError) {
      console.error(insertError)
      setError('Failed to create assignment. Please try again.')
      setSubmitting(false)
    } else {
      router.push('/teacher/assignments')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Class & Subject *</label>
        <select
          value={assignmentIndex}
          onChange={e => setAssignmentIndex(Number(e.target.value))}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        >
          {teacherAssignments.map((a, i) => (
            <option key={`${a.section_id}-${a.subject_id}`} value={i}>
              {(() => { const sec = unwrap(a.sections); const gr = unwrap(sec?.grades); return `${gr?.name ?? ''} — ${sec?.name ?? ''}`; })()} ({unwrap(a.subjects)?.name})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Assignment Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Chapter 4 Exercises"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Instructions / Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Provide detailed instructions for the assignment..."
          rows={4}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Due Date & Time *</label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Total Marks *</label>
          <input
            type="number"
            value={totalMarks}
            onChange={e => setTotalMarks(e.target.value)}
            min={1}
            max={1000}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          href="/teacher/assignments"
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {submitting ? 'Publishing...' : 'Publish Assignment'}
        </button>
      </div>
    </form>
  )
}
