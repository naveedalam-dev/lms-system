import { LoginForm } from './LoginForm'
import { AcademicMotif } from './AcademicMotif'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0A0F1D] text-[#FAF7F0] selection:bg-[#C5A880]/30 selection:text-[#FAF7F0] overflow-x-hidden">
      {/* Mobile Top Slim Strip (<768px) */}
      <div className="lg:hidden w-full bg-[#070B14] p-4 border-b border-[#C5A880]/15 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-editorial font-bold tracking-tight text-[#FAF7F0]">
              EduPortal Academy
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">Editorial Academic Hub</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#C5A880] px-2 py-0.5 rounded bg-[#C5A880]/10 border border-[#C5A880]/20">
          v4.2
        </span>
      </div>

      {/* Desktop Asymmetric Split Layout (58% / 42%) */}
      {/* Left Form Panel — 58% on Desktop */}
      <div className="w-full lg:w-[58%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative bg-[#0A0F1D] bg-grain">
        {/* Header Branding (Desktop) */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A880]/20 to-[#B08D57]/5 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-editorial font-semibold tracking-tight text-[#FAF7F0]">
                EduPortal LMS Portal
              </h1>
              <p className="text-xs text-slate-500 font-mono">Academic Excellence System</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-[#C5A880] transition-colors flex items-center gap-1.5"
          >
            <span>Main Site</span>
            <span>↗</span>
          </Link>
        </div>

        {/* Center Form Component */}
        <div className="my-auto py-8">
          <LoginForm serverError={error} />
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} EduPortal Academy. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms of Governance</a>
          </div>
        </div>
      </div>

      {/* Right Graphic Panel — 42% on Desktop */}
      <div className="hidden lg:block lg:w-[42%] border-l border-[#C5A880]/15">
        <AcademicMotif />
      </div>
    </main>
  )
}
