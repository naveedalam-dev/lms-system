import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserAndProfile } from '@/lib/auth'
import { isUuid } from '@/lib/uuid'
import { PageHeader, EmptyState } from '@/components/ui/shared'
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, type LucideIcon } from 'lucide-react'

interface NotificationRow {
  id: string
  title: string
  message: string
  type: string | null
  is_read: boolean
  link: string | null
  created_at: string
}

const typeStyle: Record<string, { Icon: LucideIcon; cls: string }> = {
  success: { Icon: CheckCircle2, cls: 'bg-emerald-500/15 text-emerald-600 border-emerald-300/50' },
  warning: { Icon: AlertTriangle, cls: 'bg-amber-500/15 text-amber-600 border-amber-300/50' },
  error: { Icon: XCircle, cls: 'bg-rose-500/15 text-rose-600 border-rose-300/50' },
  info: { Icon: Info, cls: 'bg-blue-500/15 text-blue-600 border-blue-300/50' },
}

export async function NotificationsView() {
  const cookieStore = await cookies()
  const { user } = await getCurrentUserAndProfile(cookieStore)
  const userId = user?.id ?? ''

  let items: NotificationRow[] = []
  if (isUuid(userId)) {
    const supabase = createClient(cookieStore)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    items = (data as unknown as NotificationRow[]) ?? []
  }

  const unread = items.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={items.length ? `${unread} unread · ${items.length} total` : 'You have no notifications yet.'}
      />

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((n) => {
            const t = typeStyle[n.type ?? 'info'] ?? typeStyle.info
            const Icon = t.Icon
            return (
              <div key={n.id} className="glass-card rounded-2xl p-4 flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${t.cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl">
          <EmptyState
            icon={<Bell className="w-10 h-10" />}
            title="No notifications"
            description="When there's activity on your account, notifications will appear here."
          />
        </div>
      )}
    </div>
  )
}
