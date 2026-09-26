import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader, Badge, EmptyState } from '@/components/ui/shared'
import { ClipboardList } from 'lucide-react'

interface AttendanceRecord {
  date: string
  status: string
  subjects?: { name?: string; color?: string } | null
}

export default async function StudentAttendancePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const userId = user?.id ?? ''

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('section_id')
    .eq('user_id', userId)
    .single()

  const sectionId = (studentProfile as unknown as { section_id?: string })?.section_id

  const { data: recordsData } = sectionId
    ? await supabase
        .from('attendance')
        .select('date, status, subjects(name, color)')
        .eq('student_id', userId)
        .eq('section_id', sectionId)
        .order('date', { ascending: false })
        .limit(30)
    : { data: [] }

  const records = (recordsData as unknown as AttendanceRecord[]) ?? []

  const total = records?.length ?? 0
  const present = records?.filter(r => r.status === 'PRESENT').length ?? 0
  const absent = records?.filter(r => r.status === 'ABSENT').length ?? 0
  const late = records?.filter(r => r.status === 'LATE').length ?? 0
  const rate = total > 0 ? Math.round((present / total) * 100) : 0

  const statusColors: Record<string, 'green' | 'red' | 'yellow' | 'blue'> = {
    PRESENT: 'green',
    ABSENT: 'red',
    LATE: 'yellow',
    EXCUSED: 'blue',
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" subtitle="Your attendance record for the current term" />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Attendance Rate', value: `${rate}%`, color: rate >= 75 ? 'text-emerald-600' : 'text-red-600', bg: 'bg-slate-50' },
          { label: 'Present', value: present, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Absent', value: absent, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Late', value: late, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-slate-100 p-5 text-center`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Attendance</span>
            <span className={`text-sm font-bold ${rate >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{rate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${rate >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${rate}%` }}
            />
          </div>
          {rate < 75 && (
            <p className="text-xs text-red-500 mt-2 font-medium">⚠ Attendance is below the required 75% threshold.</p>
          )}
        </div>
      )}

      {/* Records */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="font-semibold text-slate-900">Recent Records (Last 30)</h3>
        </div>
        {records && records.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {records.map((r, i: number) => (
              <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: r.subjects?.color ?? '#94A3B8' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-slate-400">{r.subjects?.name ?? 'General'}</p>
                  </div>
                </div>
                <Badge label={r.status} color={statusColors[r.status] ?? 'gray'} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList className="w-12 h-12" />}
            title="No attendance records"
            description="Your teacher hasn't marked attendance yet."
          />
        )}
      </div>
    </div>
  )
}
