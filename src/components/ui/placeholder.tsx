import type { LucideIcon } from 'lucide-react'
import { PageHeader, EmptyState } from './shared'

interface PlaceholderPageProps {
  title: string
  subtitle: string
  icon: LucideIcon
}

export function PlaceholderPage({ title, subtitle, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="glass-card rounded-2xl border border-white/60">
        <EmptyState
          icon={<Icon className="w-10 h-10" />}
          title="Coming soon"
          description="This section is scaffolded and ready for implementation. It will be wired to Supabase in a future update."
        />
      </div>
    </div>
  )
}
