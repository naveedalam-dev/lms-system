import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  color: string
}

export function StatCard({ label, value, icon, trend, trendUp, color }: StatCardProps) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 flex items-start gap-4 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 font-semibold flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
            <span>{trendUp ? '↑' : '↓'}</span> {trend}
          </p>
        )}
      </div>
    </div>
  )
}

interface BadgeProps {
  label: string
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray'
}

const colorMap: Record<string, string> = {
  green:  'bg-emerald-500/15 text-emerald-800 border-emerald-300/60 backdrop-blur-md',
  red:    'bg-rose-500/15 text-rose-800 border-rose-300/60 backdrop-blur-md',
  yellow: 'bg-amber-500/15 text-amber-800 border-amber-300/60 backdrop-blur-md',
  blue:   'bg-blue-500/15 text-blue-800 border-blue-300/60 backdrop-blur-md',
  purple: 'bg-violet-500/15 text-violet-800 border-violet-300/60 backdrop-blur-md',
  gray:   'bg-slate-500/10 text-slate-700 border-slate-300/60 backdrop-blur-md',
}

export function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorMap[color]} shadow-2xs`}>
      {label}
    </span>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mb-4 text-slate-400 shadow-2xs">
          {icon}
        </div>
      )}
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{description}</p>
    </div>
  )
}

export function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-white/60 glass-table-head">
            {headers.map(h => (
              <th key={h} className="py-3.5 px-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/60">{children}</tbody>
      </table>
    </div>
  )
}
