import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { MessageSquare } from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  message: string
  created_at: string
}

export default async function TeacherMessagesPage() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const supabase = createClient(cookieStore)

  // Fetch notifications/messages for this user
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages & Notifications"
        subtitle="Direct system alerts and student communication center."
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {notifications && notifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {notifications.map((n: NotificationItem) => (
              <div key={n.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-slate-900">{n.title}</h4>
                    <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<MessageSquare className="w-12 h-12" />}
            title="No messages"
            description="Your inbox is currently clear of system alerts and messages."
          />
        )}
      </div>
    </div>
  )
}
