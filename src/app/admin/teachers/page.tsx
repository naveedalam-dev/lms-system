import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { Plus } from 'lucide-react'
import { TeacherTable, TeacherRow } from './TeacherTable'

export default async function TeachersPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: teachersData } = await supabase
    .from('profiles')
    .select(`
      id, email, first_name, last_name, is_active, created_at,
      teacher_profiles (
        employee_id, qualification, specialization, date_of_joining
      )
    `)
    .eq('role', 'TEACHER')
    .order('created_at', { ascending: false })

  const teachers = (teachersData as unknown as TeacherRow[]) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers Directory"
        subtitle={`${teachers.length} registered teachers in the LMS`}
        action={
          <Link
            href="/admin/teachers/new"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" /> Add Teacher
          </Link>
        }
      />

      <TeacherTable initialTeachers={teachers} />
    </div>
  )
}
