import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { BookOpen, FileText, Download } from 'lucide-react'

interface CourseSubjectAssignment {
  id: string
  subjects?: { id?: string; name?: string; code?: string; description?: string | null; color?: string | null } | null
  profiles?: { first_name?: string; last_name?: string; email?: string } | { first_name?: string; last_name?: string; email?: string }[] | null
}

interface CourseMaterialItem {
  id: string
  title: string
  description?: string | null
  file_url?: string | null
  created_at: string
  subjects?: { name?: string } | null
}

export default async function StudentCoursesPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Get student profile section
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('section_id, sections(name, grades(name))')
    .eq('user_id', user?.id ?? '')
    .single()

  const sectionId = studentProfile?.section_id

  // Fetch subjects & teacher assignments for student's section
  let subjects: CourseSubjectAssignment[] = []
  let materials: CourseMaterialItem[] = []

  if (sectionId) {
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select('*, subjects(id, name, code, description, color), profiles:teacher_id(first_name, last_name, email)')
      .eq('section_id', sectionId)

    subjects = assignments || []

    const { data: mats } = await supabase
      .from('course_materials')
      .select('*, subjects(name)')
      .eq('section_id', sectionId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    materials = mats || []
  }

  const sectionObj = (Array.isArray(studentProfile?.sections) ? studentProfile?.sections[0] : studentProfile?.sections) as { name?: string; grades?: { name?: string } | { name?: string }[] } | undefined
  const gradeObj = (Array.isArray(sectionObj?.grades) ? sectionObj?.grades[0] : sectionObj?.grades) as { name?: string } | undefined

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Enrolled Courses"
        subtitle={`Enrolled Class: ${gradeObj?.name || 'Class'} — ${sectionObj?.name || 'Section'}`}
      />

      {/* Subjects Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">Subjects & Instructors</h3>
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((s: CourseSubjectAssignment) => {
              const teacher = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles
              return (
                <div key={s.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm" style={{ backgroundColor: s.subjects?.color || '#3B82F6' }}>
                      {s.subjects?.code || 'SUB'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{s.subjects?.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{s.subjects?.code}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-700">Teacher:</p>
                    <p>{teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Assigned Teacher'}</p>
                    {teacher?.email && <p className="text-slate-400">{teacher.email}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="w-12 h-12" />}
            title="No course subjects found"
            description="Your class section does not have assigned subjects yet."
          />
        )}
      </div>

      {/* Course Study Materials */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4">Course Notes & Resources</h3>
        {materials.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
            {materials.map((m: CourseMaterialItem) => (
              <div key={m.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 text-sm">{m.title}</h5>
                    <p className="text-xs text-slate-500">{m.subjects?.name} • Uploaded {new Date(m.created_at).toLocaleDateString()}</p>
                    {m.description && <p className="text-xs text-slate-600 mt-1">{m.description}</p>}
                  </div>
                </div>

                {m.file_url && (
                  <a
                    href={m.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-xs text-slate-400">
            No study materials uploaded for your section yet.
          </div>
        )}
      </div>
    </div>
  )
}
