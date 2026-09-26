import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/ui/shared'
import { Plus } from 'lucide-react'
import { StudentTable, StudentRow } from './StudentTable'

export default async function StudentsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: studentsData } = await supabase
    .from('profiles')
    .select(`
      id, email, first_name, last_name, is_active, created_at,
      student_profiles (
        roll_number,
        grades ( name ),
        sections ( name )
      )
    `)
    .eq('role', 'STUDENT')
    .order('created_at', { ascending: false })

  const students = (studentsData as unknown as StudentRow[]) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students Directory"
        subtitle={`${students.length} registered students in the LMS`}
        action={
          <Link
            href="/admin/students/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" /> Add Student
          </Link>
        }
      />

      <StudentTable initialStudents={students} />
    </div>
  )
}
