'use client'

import { Bell, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'
import { logout } from '@/app/login/actions'

interface TopbarProps {
  title: string
  subtitle?: string
  notificationCount?: number
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Topbar({
  title,
  subtitle,
  notificationCount = 0,
  collapsed = false,
  onToggleCollapse,
}: TopbarProps) {
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await logout()
  }

  return (
    <header className="h-16 glass-topbar-panel flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-200 select-none">
      <div className="flex items-center gap-3">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/80 border border-slate-200/60 hover:border-slate-300 transition-all duration-200 shadow-2xs flex items-center justify-center cursor-pointer"
            title={collapsed ? 'Maximize Sidebar' : 'Minimize Sidebar'}
            aria-label={collapsed ? 'Maximize Sidebar' : 'Minimize Sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-blue-600 animate-in fade-in" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-600 animate-in fade-in" />
            )}
          </button>
        )}
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Health Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-300/60 text-[11px] font-bold shadow-2xs backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 border border-slate-200/50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 px-3.5 py-1.5 rounded-xl border border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/80 transition-all duration-200 disabled:opacity-50 shadow-2xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{loading ? 'Signing out…' : 'Sign Out'}</span>
        </button>
      </div>
    </header>
  )
}
