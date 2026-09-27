'use client'

import React, { useCallback, useSyncExternalStore } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { cn } from '@/lib/utils'

const COLLAPSE_STORAGE_KEY = 'lms_sidebar_collapsed'
const COLLAPSE_CHANGE_EVENT = 'lms-sidebar-collapsed-change'

function subscribeToCollapsed(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(COLLAPSE_CHANGE_EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(COLLAPSE_CHANGE_EVENT, callback)
  }
}

function getCollapsedSnapshot() {
  try {
    return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function getCollapsedServerSnapshot() {
  return false
}

interface NavItem {
  label: string
  href: string
  icon: string
}

interface AppShellProps {
  navItems: NavItem[]
  role: string
  title: string
  subtitle?: string
  accentColor?: string
  userName?: string
  userEmail?: string
  children: React.ReactNode
}

export function AppShell({
  navItems,
  role,
  title,
  subtitle,
  accentColor = 'bg-blue-600',
  userName,
  userEmail,
  children,
}: AppShellProps) {
  const collapsed = useSyncExternalStore(
    subscribeToCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot
  )

  const handleToggleCollapse = useCallback(() => {
    const next = !getCollapsedSnapshot()
    try {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(next))
    } catch {
      // Ignore localStorage errors
    }
    window.dispatchEvent(new Event(COLLAPSE_CHANGE_EVENT))
  }, [])

  return (
    <div className="min-h-screen bg-slate-900/[0.02] text-slate-800 relative selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden">
      {/* =========================================================================
          TRUE GLASSMORPHISM AMBIENT MESH LAYER
          Vivid luminous colored spheres that visibly glow through translucent glass
          ========================================================================= */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        {/* Dynamic primary orb (Royal Blue / Indigo) */}
        <div className="orb-animate absolute -top-36 -left-36 w-[560px] h-[560px] bg-gradient-to-tr from-blue-600/30 via-indigo-600/30 to-violet-600/25 rounded-full blur-[100px]" />

        {/* Cyan & Turquoise floating orb */}
        <div className="orb-animate-slow absolute top-1/4 -right-40 w-[620px] h-[620px] bg-gradient-to-bl from-cyan-400/30 via-sky-500/25 to-blue-600/25 rounded-full blur-[110px]" />

        {/* Violet & Fuchsia bottom orb */}
        <div className="orb-animate absolute -bottom-40 left-1/4 w-[680px] h-[680px] bg-gradient-to-tr from-purple-600/25 via-pink-500/20 to-indigo-600/25 rounded-full blur-[120px]" style={{ animationDelay: '-4s' }} />

        {/* Teal & Emerald accent orb */}
        <div className="orb-animate-slow absolute top-2/3 -left-36 w-[480px] h-[480px] bg-gradient-to-r from-emerald-400/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-[95px]" style={{ animationDelay: '-8s' }} />

        {/* Subtle geometric glass pattern */}
        <div className="absolute inset-0 glass-mesh-pattern opacity-60" />
      </div>

      {/* Collapsible Sidebar */}
      <Sidebar
        navItems={navItems}
        role={role}
        accentColor={accentColor}
        userName={userName}
        userEmail={userEmail}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area with Dynamic Responsive Margin */}
      <div
        className={cn(
          'flex flex-col min-h-screen relative z-10 transition-all duration-300 ease-in-out',
          collapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <Topbar
          title={title}
          subtitle={subtitle}
          collapsed={collapsed}
          onToggleCollapse={handleToggleCollapse}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  )
}
