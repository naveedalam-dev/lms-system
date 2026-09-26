'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  Upload,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

const iconMap = {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  FileText,
  MessageSquare,
  Upload,
}

interface NavItem {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  navItems: NavItem[]
  role: string
  accentColor: string
  userName?: string
  userEmail?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  navItems,
  role,
  userName,
  userEmail,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'glass-sidebar-panel text-white flex flex-col min-h-screen fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between min-h-[69px]">
        <div className={cn('flex items-center gap-3 min-w-0', collapsed && 'justify-center w-full')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/25 ring-2 ring-white/10 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">EduPortal</span>
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium capitalize mt-0.5 truncate">
                {role.replace('_', ' ')} Panel
              </p>
            </div>
          )}
        </div>

        {!collapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all ml-1 shrink-0"
            title="Minimize Sidebar"
            aria-label="Minimize Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When collapsed: quick maximize bar */}
      {collapsed && onToggleCollapse && (
        <div className="px-3 pt-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all flex items-center justify-center group"
            title="Maximize Sidebar"
            aria-label="Maximize Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 text-blue-400 transition-transform" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/80 mb-2">Main Menu</p>
        )}
        {navItems.map(({ label, href, icon }) => {
          const Icon = iconMap[icon as keyof typeof iconMap] || BookOpen
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group relative',
                collapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5',
                active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-white/15 ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              {!collapsed && (
                <>
                  <span className="truncate">{label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </>
              )}

              {/* Floating Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-2xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150">
                  {label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Footer Card */}
      {(userName || userEmail) && (
        <div className={cn('border-t border-white/10 bg-slate-950/60', collapsed ? 'p-3 flex justify-center' : 'p-3')}>
          <div
            className={cn(
              'rounded-xl bg-slate-900/80 border border-white/10 flex items-center relative group',
              collapsed ? 'p-2 justify-center' : 'gap-3 p-2.5'
            )}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold shrink-0 shadow-xs">
              {userName?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{userName ?? 'Admin'}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail ?? ''}</p>
              </div>
            )}

            {collapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-2xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150">
                <p className="font-bold">{userName}</p>
                {userEmail && <p className="text-[10px] text-slate-400 font-mono">{userEmail}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
