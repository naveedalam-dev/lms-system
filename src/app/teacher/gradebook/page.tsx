import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/shared'
import { GradebookTable, StudentGradeRow } from './GradebookTable'

export default async function TeacherGradebookPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; subject?: string; exam?: string }>
}) {
  const { section: sectionId, subject: subjectId, exam: examTypeId } = await searchParams
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Teacher assignments
  const { data: teacherAssignments } = await supabase
    .from('teacher_assignments')
    .select('section_id, subject_id, academic_year_id, sections(id, name, grades(name)), subjects(id, name)')
    .eq('teacher_id', user?.id ?? '')

  const currentAssignment = teacherAssignments?.find(
    a => a.section_id === sectionId && a.subject_id === subjectId
  ) || teacherAssignments?.[0]

  const selectedSectionId = currentAssignment?.section_id || ''
  const selectedSubjectId = currentAssignment?.subject_id || ''
  const academicYearId = currentAssignment?.academic_year_id || ''

  // Exam types
  const { data: examTypes } = await supabase.from('exam_types').select('*').order('weight', { ascending: false })
  const selectedExamTypeId = examTypeId || examTypes?.[0]?.id || ''

  // Students in section
  let studentGradeRows: StudentGradeRow[] = []
  if (selectedSectionId) {
    const { data: students } = await supabase
      .from('student_profiles')
      .select('user_id, roll_number, profiles(first_name, last_name)')
      .eq('section_id', selectedSectionId)

    // Existing grades
    const { data: existingGrades } = await supabase
      .from('grades_records')
      .select('*')
      .eq('section_id', selectedSectionId)
      .eq('subject_id', selectedSubjectId)
      .eq('exam_type_id', selectedExamTypeId)

    const gradeMap = new Map(existingGrades?.map(g => [g.student_id, g]))

    studentGradeRows = (students || []).map(s => {
      const p = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
      const record = gradeMap.get(s.user_id)
      return {
        student_id: s.user_id,
        roll_number: s.roll_number || 'N/A',
        name: `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'Student',
        marks_obtained: record?.marks_obtained ?? '',
        total_marks: record?.total_marks ?? 100,
        remarks: record?.remarks ?? '',
      }
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gradebook Management"
        subtitle="Record exam, quiz, and term assessment scores for your classes."
      />

      <GradebookTable
        teacherAssignments={teacherAssignments || []}
        examTypes={examTypes || []}
        selectedSectionId={selectedSectionId}
        selectedSubjectId={selectedSubjectId}
        selectedExamTypeId={selectedExamTypeId}
        academicYearId={academicYearId}
        rows={studentGradeRows}
        teacherId={user?.id || ''}
      />
    </div>
  )
}
