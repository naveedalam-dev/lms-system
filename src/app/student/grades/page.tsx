import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { GraduationCap } from 'lucide-react'

interface GradeRecord {
  marks_obtained: number
  total_marks: number
  remarks?: string | null
  subjects?: { name?: string; color?: string } | null
  exam_types?: { name?: string; weight?: number } | null
}

export default async function StudentGradesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('section_id, academic_year_id')
    .eq('user_id', user?.id ?? '')
    .single()

  const profile = studentProfile as unknown as { section_id?: string; academic_year_id?: string } | null
  const sectionId = profile?.section_id
  const academicYearId = profile?.academic_year_id

  const { data: rawGrades } = (sectionId && academicYearId)
    ? await supabase
        .from('grades_records')
        .select(`
          marks_obtained, total_marks, remarks,
          subjects(name, color),
          exam_types(name, weight)
        `)
        .eq('student_id', user?.id ?? '')
        .eq('section_id', sectionId)
        .eq('academic_year_id', academicYearId)
        .order('created_at', { ascending: false })
    : { data: [] }

  const gradesData = (rawGrades as unknown as GradeRecord[]) ?? []

  // Group by subject
  const subjectMap: Record<string, { color: string; exams: { examType: string; obtained: number; total: number; weight: number }[] }> = {}
  gradesData.forEach((g) => {
    const subjectName = g.subjects?.name ?? 'Unknown'
    if (!subjectMap[subjectName]) {
      subjectMap[subjectName] = { color: g.subjects?.color ?? '#8B5CF6', exams: [] }
    }
    subjectMap[subjectName].exams.push({
      examType: g.exam_types?.name ?? '—',
      obtained: g.marks_obtained,
      total: g.total_marks,
      weight: g.exam_types?.weight ?? 0,
    })
  })

  const getGradeLabel = (pct: number) => {
    if (pct >= 90) return { label: 'A+', color: 'text-emerald-600' }
    if (pct >= 80) return { label: 'A',  color: 'text-emerald-500' }
    if (pct >= 70) return { label: 'B',  color: 'text-blue-600' }
    if (pct >= 60) return { label: 'C',  color: 'text-amber-600' }
    if (pct >= 50) return { label: 'D',  color: 'text-orange-500' }
    return { label: 'F', color: 'text-red-600' }
  }

  const subjects = Object.entries(subjectMap)

  return (
    <div className="space-y-6">
      <PageHeader title="My Grades" subtitle="Academic performance overview" />

      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map(([subjectName, { color, exams }]) => {
            const totalObtained = exams.reduce((acc, e) => acc + (e.obtained / e.total) * e.weight, 0)
            const totalWeight = exams.reduce((acc, e) => acc + e.weight, 0)
            const overallPct = totalWeight > 0 ? Math.round((totalObtained / totalWeight) * 100) : null
            const grade = overallPct !== null ? getGradeLabel(overallPct) : null

            return (
              <div key={subjectName} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">{subjectName}</h4>
                    {grade && (
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${grade.color}`}>{grade.label}</span>
                        <p className="text-xs text-slate-400">{overallPct}%</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {exams.map((e, i) => {
                      const pct = Math.round((e.obtained / e.total) * 100)
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-24 shrink-0">{e.examType}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-700 w-16 text-right">
                            {e.obtained}/{e.total}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <EmptyState
            icon={<GraduationCap className="w-12 h-12" />}
            title="No grades recorded yet"
            description="Your teacher hasn't entered any grades yet. Check back after exams."
          />
        </div>
      )}
    </div>
  )
}
