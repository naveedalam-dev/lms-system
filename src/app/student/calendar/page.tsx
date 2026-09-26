import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader } from '@/components/ui/shared'
import { Calendar, Clock, FileText } from 'lucide-react'

interface CalendarAssignmentItem {
  id: string
  title: string
  due_date: string
  total_marks: number
  subjects?: { name?: string; color?: string } | null
}

interface CalendarTimetableItem {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  room?: string | null
  subjects?: { name?: string; color?: string } | null
}

export default async function StudentCalendarPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Student section
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('section_id')
    .eq('user_id', user?.id ?? '')
    .single()

  const sectionId = studentProfile?.section_id

  // Fetch upcoming assignment due dates
  let assignments: CalendarAssignmentItem[] = []
  let timetableEntries: CalendarTimetableItem[] = []

  if (sectionId) {
    const { data: assignData } = await supabase
      .from('assignments')
      .select('*, subjects(name, color)')
      .eq('section_id', sectionId)
      .eq('is_published', true)
      .order('due_date', { ascending: true })

    assignments = assignData || []

    const { data: timeData } = await supabase
      .from('timetable')
      .select('*, subjects(name, color), profiles:teacher_id(first_name, last_name)')
      .eq('section_id', sectionId)
      .order('day_of_week', { ascending: true })

    timetableEntries = timeData || []
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="space-y-8">
      <PageHeader
        title="Schedule & Deadlines"
        subtitle="Weekly timetable breakdown and assignment due dates."
      />

      {/* Weekly Timetable */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" /> Weekly Class Schedule
        </h3>

        {timetableEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {daysOfWeek.slice(0, 5).map((dayName, dayIdx) => {
              const dayClasses = timetableEntries.filter(t => t.day_of_week === dayIdx)
              return (
                <div key={dayName} className="bg-white rounded-xl border border-slate-100 p-4 space-y-3 shadow-sm">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    {dayName}
                  </h4>
                  {dayClasses.length > 0 ? (
                    <div className="space-y-2">
                      {dayClasses.map(c => (
                        <div key={c.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1">
                          <p className="font-semibold text-slate-900">{c.subjects?.name}</p>
                          <p className="text-[11px] text-slate-500">{c.start_time} - {c.end_time}</p>
                          {c.room && <p className="text-[10px] text-slate-400">Room: {c.room}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No scheduled classes</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-100 text-slate-400 text-xs">
            No weekly timetable configured for your class section.
          </div>
        )}
      </div>

      {/* Assignment Deadlines */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" /> Upcoming Deadlines
        </h3>

        {assignments.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm divide-y divide-slate-100">
            {assignments.map(a => {
              const due = new Date(a.due_date)
              const isOverdue = due < new Date()
              return (
                <div key={a.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 text-sm">{a.title}</h5>
                      <p className="text-xs text-slate-500">{a.subjects?.name} • Total Marks: {a.total_marks}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      Due: {due.toLocaleDateString()} {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-100 text-slate-400 text-xs">
            No active assignment deadlines.
          </div>
        )}
      </div>
    </div>
  )
}
