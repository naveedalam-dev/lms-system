import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { ClassesView, SectionItem } from './ClassesView'

export default async function AdminClassesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch sections with grade and academic year info
  const { data: sections } = await supabase
    .from('sections')
    .select('*, grades(name, tier), academic_years(name)')
    .order('created_at', { ascending: false })

  // For each section get student count
  const sectionList = await Promise.all(
    (sections || []).map(async s => {
      const { count } = await supabase
        .from('student_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', s.id)
      return { ...s, studentCount: count || 0 }
    })
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Sections Management"
        subtitle="Configure school grades, section rooms, and capacities."
      />

      <ClassesView initialSections={(sectionList as unknown as SectionItem[]) || []} />
    </div>
  )
}
