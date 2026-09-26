'use client'

import { useState, useEffect } from 'react'

const QUOTES = [
  {
    quote: "Knowledge is not a vessel to be filled, but a fire to be kindled.",
    author: "Plutarch",
    role: "Classical Philosophy",
  },
  {
    quote: "Education is the manifestation of perfection already in man.",
    author: "Swami Vivekananda",
    role: "Academic Thought",
  },
  {
    quote: "The roots of education are bitter, but the fruit is sweet.",
    author: "Aristotle",
    role: "Foundational Pedagogy",
  },
]

export function AcademicMotif() {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Parallax on mouse move unless prefers-reduced-motion is requested
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth - 0.5) * 15
      const y = (e.clientY / innerHeight - 0.5) * 15
      setMouseOffset({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const current = QUOTES[quoteIndex]

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-10 lg:p-16 overflow-hidden bg-[#070B14]">
      {/* Background Subtle Line Grid + Paper Grain */}
      <div className="absolute inset-0 bg-grain pointer-events-none opacity-40" />
      
      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse" />
          <span className="text-xs font-mono tracking-widest text-[#C5A880]/80 uppercase">
            Est. MMXXVI • Academic Network
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono">v4.2.0</span>
      </div>

      {/* Central SVG Single-Weight Line-Art Motif (Celestial Astrolabe & Open Codex) */}
      <div 
        className="relative z-10 my-auto flex items-center justify-center py-8 transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
        }}
      >
        <div className="relative w-72 h-72 lg:w-96 lg:h-96 flex items-center justify-center">
          {/* Outer Decorative Ring */}
          <div className="absolute inset-0 rounded-full border border-[#C5A880]/20 animate-[spin_40s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-dashed border-[#C5A880]/15 animate-[spin_60s_linear_infinite_reverse]" />
          
          {/* Vector Line Art SVG */}
          <svg 
            viewBox="0 0 400 400" 
            className="w-full h-full text-[#C5A880] stroke-current stroke-[1.2] fill-none drop-shadow-[0_0_12px_rgba(197,168,128,0.15)]"
          >
            {/* Concentric Circles & Axis */}
            <circle cx="200" cy="200" r="160" strokeOpacity="0.3" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="120" strokeOpacity="0.4" />
            <circle cx="200" cy="200" r="80" strokeOpacity="0.25" />
            <line x1="40" y1="200" x2="360" y2="200" strokeOpacity="0.2" />
            <line x1="200" y1="40" x2="200" y2="360" strokeOpacity="0.2" />

            {/* Orbiting Nodes */}
            <circle cx="200" cy="80" r="4" fill="#C5A880" fillOpacity="0.8" />
            <circle cx="320" cy="200" r="4" fill="#C5A880" fillOpacity="0.8" />
            <circle cx="200" cy="320" r="4" fill="#C5A880" fillOpacity="0.8" />
            <circle cx="80" cy="200" r="4" fill="#C5A880" fillOpacity="0.8" />

            {/* Open Book Line-Art Motif in Center */}
            <g transform="translate(130, 150)">
              {/* Spine */}
              <line x1="70" y1="20" x2="70" y2="90" strokeWidth="1.5" />
              {/* Left Pages */}
              <path d="M 70 20 Q 35 10 10 25 L 10 85 Q 35 70 70 85" strokeWidth="1.5" />
              <path d="M 70 28 Q 38 18 15 32" strokeOpacity="0.5" />
              <path d="M 70 38 Q 38 28 15 42" strokeOpacity="0.5" />
              <path d="M 70 48 Q 38 38 15 52" strokeOpacity="0.5" />

              {/* Right Pages */}
              <path d="M 70 20 Q 105 10 130 25 L 130 85 Q 105 70 70 85" strokeWidth="1.5" />
              <path d="M 70 28 Q 102 18 125 32" strokeOpacity="0.5" />
              <path d="M 70 38 Q 102 28 125 42" strokeOpacity="0.5" />
              <path d="M 70 48 Q 102 38 125 52" strokeOpacity="0.5" />
            </g>

            {/* Star Constellation Lines */}
            <polyline points="130,100 170,120 200,80 250,110 270,90" strokeOpacity="0.4" strokeDasharray="2 2" />
            <circle cx="130" cy="100" r="2.5" fill="#E2C391" />
            <circle cx="170" cy="120" r="2.5" fill="#E2C391" />
            <circle cx="250" cy="110" r="2.5" fill="#E2C391" />
            <circle cx="270" cy="90" r="2.5" fill="#E2C391" />
          </svg>
        </div>
      </div>

      {/* Bottom Rotating Quote & Key Stat */}
      <div className="relative z-10 space-y-4 pt-6 border-t border-[#C5A880]/15">
        <div className="min-h-[90px] transition-all duration-500">
          <p className="text-lg lg:text-xl font-editorial italic text-[#FAF7F0]/90 leading-snug">
            &ldquo;{current.quote}&rdquo;
          </p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#C5A880] tracking-wide">— {current.author}</span>
            <span className="text-slate-500 font-mono">{current.role}</span>
          </div>
        </div>

        {/* Live Academic Metric Ticker */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center border-t border-slate-900">
          <div>
            <p className="text-base font-bold font-editorial text-[#FAF7F0]">99.4%</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Attendance</p>
          </div>
          <div>
            <p className="text-base font-bold font-editorial text-[#C5A880]">14,200+</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Active Modules</p>
          </div>
          <div>
            <p className="text-base font-bold font-editorial text-[#FAF7F0]">4.9 / 5.0</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Faculty Rating</p>
          </div>
        </div>
      </div>
    </div>
  )
}
