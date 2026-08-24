import { useQuery } from '@tanstack/react-query'
import { fetchCurrentStudentProfile } from '@/api/students.api'
import { fetchGrades } from '@/api/grades.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Award, BookOpen, CheckCircle2, GraduationCap } from 'lucide-react'

export function AcademicProgress() {
  const { data: profile } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: fetchCurrentStudentProfile,
  })

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: fetchGrades,
  })

  const completedCredits = profile?.credits_completed || 30
  const requiredCredits = 130
  const progressPercentage = Math.min(100, Math.round((completedCredits / requiredCredits) * 100))

  return (
    <>
      <PageHeader label="Degree Audit" title="Academic Progress & Clearance" />

      {/* Progress Overview Card */}
      <Card className="mt-5 p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-semibold uppercase tracking-wider">
              {profile?.program_name || 'BSc Computer Science'}
            </span>
            <h2 className="text-xl font-bold mt-2">Degree Completion Progress</h2>
            <p className="text-xs text-indigo-200 mt-1">
              {completedCredits} of {requiredCredits} Total Credit Hours Fulfilled
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-extrabold text-white">{progressPercentage}%</div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Good Academic Standing
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-indigo-950/80 h-3 rounded-full mt-6 overflow-hidden border border-indigo-700/50">
          <div className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-full rounded-full" style={{ width: `${progressPercentage}%` }} />
        </div>
      </Card>

      {/* Completed Courses Audit List */}
      <Card className="mt-6 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Completed Core & Elective Requirements</h3>

        {grades.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No completed courses on audit file.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Course Requirement</span>
              <span>Credits</span>
              <span>Grade Earned</span>
            </div>

            {grades.map((grade) => (
              <div key={grade.id} className="grid grid-cols-[2fr_1fr_1fr] gap-4 py-3 text-sm items-center">
                <div>
                  <span className="font-bold text-gray-900">{grade.course_code}</span>
                  <span className="text-xs text-gray-500 block">{grade.course_title}</span>
                </div>
                <span className="text-gray-700 text-xs font-medium">{grade.credits} Credits</span>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Passed ({grade.letter})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
