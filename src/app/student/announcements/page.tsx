import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { Bell } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
  target_role?: string | null
  profiles?: { first_name?: string; last_name?: string } | null
}

export default async function AnnouncementsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: announcementsData } = await supabase
    .from('announcements')
    .select('id, title, content, created_at, target_role, profiles(first_name, last_name)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const announcements = (announcementsData as unknown as Announcement[]) ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" subtitle="School-wide and class announcements" />

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a) => {
            const author = a.profiles
            const authorName = [author?.first_name, author?.last_name].filter(Boolean).join(' ') || 'School Admin'
            return (
              <div key={a.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 mb-1">{a.title}</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{a.content}</p>
                  </div>
                  {a.target_role && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium shrink-0 capitalize">
                      {a.target_role.replace('_', ' ').toLowerCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                    {authorName.charAt(0)}
                  </div>
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-slate-600">{authorName}</span>
                    {' · '}
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <EmptyState
            icon={<Bell className="w-12 h-12" />}
            title="No announcements yet"
            description="School announcements will appear here."
          />
        </div>
      )}
    </div>
  )
}
