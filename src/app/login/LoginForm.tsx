'use client'

import { useState } from 'react'
import { login } from './actions'
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react'

interface LoginFormProps {
  serverError?: string
}

const DEMO_PRESETS = [
  { label: 'Admin', email: 'admin@lms.com', pass: 'admin123', color: 'border-[#C5A880]/30 hover:border-[#C5A880] text-[#E2C391]' },
  { label: 'Teacher', email: 'teacher1@school.edu', pass: 'Teacher@1234', color: 'border-emerald-800/40 hover:border-emerald-500 text-emerald-300' },
  { label: 'Student', email: 'student1@school.edu', pass: 'Student@1234', color: 'border-sky-800/40 hover:border-sky-500 text-sky-300' },
]

export function LoginForm({ serverError }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  const handleSubmit = () => {
    setLoading(true)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-7 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      {/* Top Title & Subtitle */}
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-xs font-medium tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secure Academic Gate</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-editorial tracking-tight text-[#FAF7F0] font-normal">
          The Central Portal
        </h2>
        <p className="text-sm text-slate-400 font-light leading-relaxed">
          Access course materials, research archives, and academic administration.
        </p>
      </div>

      {/* Top Banner Server Error State */}
      {serverError && (
        <div 
          role="alert" 
          aria-live="assertive"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-sm animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-300">Authentication Warning</p>
            <p className="text-xs text-red-200/90 mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* Quick Demo Credentials Pill Selector */}
      <div className="p-3.5 rounded-xl bg-[#162035]/60 border border-[#C5A880]/15 space-y-2">
        <p className="text-xs font-medium text-[#C5A880]/90 tracking-wide flex items-center justify-between">
          <span>⚡ Quick 1-Click Demo Profiles</span>
          <span className="text-[10px] text-slate-500 font-normal">Auto-fill credentials</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_PRESETS.map((demo) => (
            <button
              key={demo.label}
              type="button"
              onClick={() => handleDemoFill(demo.email, demo.pass)}
              className={`py-1.5 px-2 rounded-lg border text-xs font-medium bg-[#0A0F1D]/80 transition-all text-center truncate ${demo.color}`}
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Authentication Form */}
      <form action={login} onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label 
            htmlFor="email" 
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Email address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#C5A880] transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scholar@school.edu"
              required
              className="w-full pl-10 pr-4 py-3 bg-[#070B14]/90 border border-slate-800 rounded-xl text-sm text-[#FAF7F0] placeholder-slate-600 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all duration-200"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="password" 
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Password
            </label>
            <a 
              href="#forgot" 
              onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset credentials.') }}
              className="text-xs font-medium text-[#C5A880] hover:text-[#E2C391] hover:underline transition-colors"
            >
              Forgot security key?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#C5A880] transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-11 py-3 bg-[#070B14]/90 border border-slate-800 rounded-xl text-sm text-[#FAF7F0] placeholder-slate-600 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide key entry' : 'Reveal key entry'}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              name="remember"
              className="w-4 h-4 rounded border-slate-700 bg-[#070B14] text-[#B08D57] focus:ring-[#C5A880] focus:ring-offset-0 transition-colors" 
            />
            <span className="text-xs text-slate-400 font-medium">Remember this device</span>
          </label>
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#B08D57] via-[#C5A880] to-[#997740] hover:from-[#C5A880] hover:to-[#B08D57] text-[#0A0F1D] font-bold text-sm tracking-wide shadow-lg shadow-[#B08D57]/20 hover:shadow-[#B08D57]/30 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0A0F1D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Authenticating…</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
