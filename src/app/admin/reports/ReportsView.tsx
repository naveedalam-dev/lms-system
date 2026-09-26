'use client'

import { Printer, TrendingUp, Users, GraduationCap, BookOpen, ClipboardList, CheckCircle2, BarChart2, Layers } from 'lucide-react'
import { StatCard } from '@/components/ui/shared'

interface GradeCount {
  name: string
  count: number
}

interface Props {
  studentCount: number
  teacherCount: number
  classCount: number
  subjectCount: number
  assignmentCount: number
  submissionCount: number
  totalAttendance: number
  presentAttendance: number
  gradeDistribution: GradeCount[]
}

export function ReportsView({
  studentCount,
  teacherCount,
  classCount,
  subjectCount,
  assignmentCount,
  submissionCount,
  totalAttendance,
  presentAttendance,
  gradeDistribution,
}: Props) {
  const attendanceRate = totalAttendance > 0
    ? Math.round((presentAttendance / totalAttendance) * 100)
    : 100

  const studentTeacherRatio = teacherCount > 0
    ? `${(studentCount / teacherCount).toFixed(1)}:1`
    : 'N/A'

  const handlePrint = () => {
    window.print()
  }

  const maxGradeCount = Math.max(...gradeDistribution.map(g => g.count), 1)

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex justify-end print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all"
        >
          <Printer className="w-4 h-4 text-slate-500" /> Print / Export PDF Report
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Enrolled Students"
          value={studentCount}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
        />
        <StatCard
          label="Total Active Teachers"
          value={teacherCount}
          icon={<GraduationCap className="w-6 h-6 text-white" />}
          color="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25"
        />
        <StatCard
          label="Class Sections"
          value={classCount}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25"
        />
        <StatCard
          label="Attendance Health"
          value={`${attendanceRate}%`}
          icon={<ClipboardList className="w-6 h-6 text-white" />}
          color="bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25"
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Enrollment Distribution Card */}
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-2xl border border-white/80 shadow-lg shadow-slate-200/50 space-y-5 ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Grade-Wise Enrollment</h3>
              <p className="text-[11px] text-slate-400">Total registered students distribution per grade</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {gradeDistribution.map(g => {
              const percentage = Math.round((g.count / maxGradeCount) * 100)
              return (
                <div key={g.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{g.name}</span>
                    <span className="text-slate-500 font-mono font-bold">{g.count} students</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${g.count > 0 ? Math.max(percentage, 10) : 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Operational Metrics Card */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-2xl border border-white/80 shadow-lg shadow-slate-200/50 space-y-5 ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Operational Statistics</h3>
                <p className="text-[11px] text-slate-400">Curriculum activity and school health indicators</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="divide-y divide-slate-100/90 text-xs">
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Faculty Student-Ratio</span>
                <span className="font-extrabold text-slate-900 px-3 py-1 bg-slate-100 border border-slate-200/70 rounded-xl font-mono">{studentTeacherRatio}</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Active Subjects Configured</span>
                <span className="font-extrabold text-slate-900 px-3 py-1 bg-slate-100 border border-slate-200/70 rounded-xl font-mono">{subjectCount} Subjects</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Assignments Published</span>
                <span className="font-extrabold text-slate-900 px-3 py-1 bg-slate-100 border border-slate-200/70 rounded-xl font-mono">{assignmentCount}</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Submissions Received</span>
                <span className="font-extrabold text-slate-900 px-3 py-1 bg-slate-100 border border-slate-200/70 rounded-xl font-mono">{submissionCount}</span>
              </div>
              <div className="py-3 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Attendance Records Logged</span>
                <span className="font-extrabold text-slate-900 px-3 py-1 bg-slate-100 border border-slate-200/70 rounded-xl font-mono">{totalAttendance} records</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
