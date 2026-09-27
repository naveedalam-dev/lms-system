import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, DataTable, EmptyState, StatCard } from '@/components/ui/shared'
import { CalendarCheck, UserCheck, UserX, Clock, FileText } from 'lucide-react'

interface AttendanceRow {
  id: string
  student_id: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  remarks: string | null
  sections?: { name?: string } | null
  subjects?: { name?: string } | null
}

interface ProfileRow {
  id: string
  first_name: string | null
  last_name: string | null
}

const statusColor: Record<string, string> = {
  PRESENT: 'text-emerald-600',
  ABSENT: 'text-rose-600',
  LATE: 'text-amber-600',
  EXCUSED: 'text-slate-500',
}

export default async function AdminAttendancePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data: recentData }, { count: presentCount }, { count: absentCount }, { count: lateCount }, { count: excusedCount }] =
    await Promise.all([
      supabase
        .from('attendance')
        .select('id, student_id, date, status, remarks, sections(name), subjects(name)')
        .order('date', { ascending: false })
        .limit(20),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'PRESENT'),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'ABSENT'),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'LATE'),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('status', 'EXCUSED'),
    ])

  const records = (recentData as unknown as AttendanceRow[]) ?? []

  const studentIds = Array.from(new Set(records.map((r) => r.student_id)))
  let nameMap: Record<string, string> = {}
  if (studentIds.length > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', studentIds)
    nameMap = ((profileData as unknown as ProfileRow[]) ?? []).reduce<Record<string, string>>((acc, p) => {
      acc[p.id] = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Student'
      return acc
    }, {})
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" subtitle="School-wide attendance summary and recent records" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present" value={presentCount ?? 0} icon={<UserCheck className="w-5 h-5 text-white" />} color="bg-emerald-500" />
        <StatCard label="Absent" value={absentCount ?? 0} icon={<UserX className="w-5 h-5 text-white" />} color="bg-rose-500" />
        <StatCard label="Late" value={lateCount ?? 0} icon={<Clock className="w-5 h-5 text-white" />} color="bg-amber-500" />
        <StatCard label="Excused" value={excusedCount ?? 0} icon={<FileText className="w-5 h-5 text-white" />} color="bg-slate-500" />
      </div>

      {records.length > 0 ? (
        <div className="glass-card rounded-2xl p-2 sm:p-4">
          <DataTable headers={['Student', 'Section', 'Subject', 'Date', 'Status']}>
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-white/40 transition-colors">
                <td className="py-3 px-4 text-sm font-bold text-slate-900">{nameMap[r.student_id] ?? 'Student'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{r.sections?.name ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{r.subjects?.name ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-500 font-mono">{new Date(r.date).toLocaleDateString()}</td>
                <td className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wide ${statusColor[r.status] ?? 'text-slate-500'}`}>
                  {r.status}
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<CalendarCheck className="w-10 h-10" />} title="No attendance records" description="Attendance marked by teachers will appear here." />
        </div>
      )}
    </div>
  )
}
