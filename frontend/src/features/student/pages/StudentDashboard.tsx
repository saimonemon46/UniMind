import { useQuery } from '@tanstack/react-query'
import { fetchCurrentStudentProfile } from '@/api/students.api'
import { fetchMyEnrollments } from '@/api/courses.api'
import { fetchGrades } from '@/api/grades.api'
import { DatabaseDashboard } from '@/components/dashboard/DatabaseDashboard'
import { Card } from '@/components/ui/Card'
import { GraduationCap, Award, BookOpen, CheckCircle, ShieldAlert } from 'lucide-react'

export function StudentDashboard() {
  const { data: profile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: fetchCurrentStudentProfile,
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: fetchMyEnrollments,
  })

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: fetchGrades,
  })

  return (
    <div className="space-y-6">
      {/* Student Welcome Header Banner */}
      {profile && (
        <Card className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl border-none shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                {profile.program_name || 'Undergraduate Degree'}
              </span>
              <h1 className="text-2xl font-bold mt-2">
                Welcome back, {profile.user.first_name} {profile.user.last_name}!
              </h1>
              <p className="text-sm text-indigo-200 mt-1">
                Student ID: <span className="font-mono font-bold text-white">{profile.university_id}</span> · Department of {profile.department_name}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {profile.financial_hold ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Financial Hold
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> {profile.academic_standing}
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-700/50">
            <div>
              <div className="text-xs text-indigo-300 font-medium">Cumulative GPA</div>
              <div className="text-2xl font-bold text-white mt-1">{profile.cgpa}</div>
            </div>
            <div>
              <div className="text-xs text-indigo-300 font-medium">Credits Earned</div>
              <div className="text-2xl font-bold text-white mt-1">{profile.credits_completed} Cr</div>
            </div>
            <div>
              <div className="text-xs text-indigo-300 font-medium">Enrolled Courses</div>
              <div className="text-2xl font-bold text-white mt-1">{enrollments.length} Active</div>
            </div>
            <div>
              <div className="text-xs text-indigo-300 font-medium">Advisor</div>
              <div className="text-sm font-semibold text-white mt-1.5 truncate">
                {profile.advisor_name || 'Assigned Advisor'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Database Dashboard Overview */}
      <DatabaseDashboard />
    </div>
  )
}
