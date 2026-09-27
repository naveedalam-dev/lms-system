import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { isUuid } from '@/lib/uuid'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { User, Mail, Phone, Hash, GraduationCap, Users, Calendar } from 'lucide-react'

interface ProfileRow {
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
}

interface StudentProfileRow {
  roll_number: string | null
  date_of_birth: string | null
  gender: string | null
  guardian_name: string | null
  guardian_phone: string | null
  grades?: { name?: string } | null
  sections?: { name?: string } | null
}

export default async function StudentProfilePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const userId = user?.id ?? ''

  let profile: ProfileRow | null = null
  let studentProfile: StudentProfileRow | null = null

  if (isUuid(userId)) {
    const [{ data: profileData }, { data: spData }] = await Promise.all([
      supabase.from('profiles').select('email, first_name, last_name, phone').eq('id', userId).single(),
      supabase.from('student_profiles').select('roll_number, date_of_birth, gender, guardian_name, guardian_phone, grades(name), sections(name)').eq('user_id', userId).single(),
    ])
    profile = (profileData as unknown as ProfileRow) ?? null
    studentProfile = (spData as unknown as StudentProfileRow) ?? null
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Student'

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your student account and academic details" />

      {profile ? (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
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
            <InfoRow icon={<Hash className="w-4 h-4" />} label="Roll Number" value={studentProfile?.roll_number ?? '—'} />
            <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Grade" value={studentProfile?.grades?.name ?? '—'} />
            <InfoRow icon={<Users className="w-4 h-4" />} label="Section" value={studentProfile?.sections?.name ?? '—'} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={studentProfile?.date_of_birth ? new Date(studentProfile.date_of_birth).toLocaleDateString() : '—'} />
            <InfoRow icon={<User className="w-4 h-4" />} label="Guardian" value={studentProfile?.guardian_name ?? '—'} />
            <InfoRow icon={<Phone className="w-4 h-4" />} label="Guardian Phone" value={studentProfile?.guardian_phone ?? '—'} />
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState icon={<User className="w-10 h-10" />} title="Profile unavailable" description="Sign in with a real student account to view your profile." />
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 border border-violet-300/40 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  )
}
