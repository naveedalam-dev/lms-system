import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { isUuid } from '@/lib/uuid'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { User, Mail, Phone, BadgeCheck, BookOpen, Users } from 'lucide-react'

interface ProfileRow {
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
}

interface TeacherProfileRow {
  employee_id: string | null
  qualification: string | null
  specialization: string | null
  date_of_joining: string | null
}

interface AssignmentRow {
  id: string
  is_class_teacher: boolean
  subjects?: { name?: string; color?: string } | null
  sections?: { name?: string; grades?: { name?: string } | null } | null
}

export default async function TeacherProfilePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const userId = user?.id ?? ''

  let profile: ProfileRow | null = null
  let teacherProfile: TeacherProfileRow | null = null
  let assignments: AssignmentRow[] = []

  if (isUuid(userId)) {
    const [{ data: profileData }, { data: tpData }, { data: assignmentData }] = await Promise.all([
      supabase.from('profiles').select('email, first_name, last_name, phone, avatar_url').eq('id', userId).single(),
      supabase.from('teacher_profiles').select('employee_id, qualification, specialization, date_of_joining').eq('user_id', userId).single(),
      supabase.from('teacher_assignments').select('id, is_class_teacher, subjects(name, color), sections(name, grades(name))').eq('teacher_id', userId),
    ])
    profile = (profileData as unknown as ProfileRow) ?? null
    teacherProfile = (tpData as unknown as TeacherProfileRow) ?? null
    assignments = (assignmentData as unknown as AssignmentRow[]) ?? []
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Teacher'

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your teacher account details and teaching assignments" />

      {profile ? (
        <>
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{fullName}</h2>
                <p className="text-xs text-slate-500 font-mono">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/60">
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile.email} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={profile.phone ?? '—'} />
              <InfoRow icon={<BadgeCheck className="w-4 h-4" />} label="Employee ID" value={teacherProfile?.employee_id ?? '—'} />
              <InfoRow icon={<BadgeCheck className="w-4 h-4" />} label="Qualification" value={teacherProfile?.qualification ?? '—'} />
              <InfoRow icon={<BookOpen className="w-4 h-4" />} label="Specialization" value={teacherProfile?.specialization ?? '—'} />
              <InfoRow icon={<User className="w-4 h-4" />} label="Joined" value={teacherProfile?.date_of_joining ? new Date(teacherProfile.date_of_joining).toLocaleDateString() : '—'} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Teaching Assignments</h3>
            {assignments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assignments.map((a) => (
                  <div key={a.id} className="rounded-xl border border-white/80 bg-white/60 p-4 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.subjects?.color ?? '#10B981' }} />
                      <p className="text-sm font-bold text-slate-900">{a.subjects?.name ?? 'Subject'}</p>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {a.sections?.grades?.name ?? ''} {a.sections?.name ?? ''}
                    </p>
                    {a.is_class_teacher && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-500/15 border border-emerald-300/50 px-2 py-0.5 rounded-full">
                        Class Teacher
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No teaching assignments yet.</p>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<User className="w-10 h-10" />} title="Profile unavailable" description="Sign in with a real teacher account to view your profile." />
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-300/40 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  )
}
