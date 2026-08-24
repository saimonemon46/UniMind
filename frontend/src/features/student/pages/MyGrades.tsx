import { useQuery } from '@tanstack/react-query'
import { fetchGrades } from '@/api/grades.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Award, BookOpen } from 'lucide-react'

export function MyGrades() {
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: fetchGrades,
  })

  // Calculate CGPA dynamically from real grades
  const totalPoints = grades.reduce((acc, g) => acc + (parseFloat(g.points) * parseFloat(g.credits || '3.0')), 0)
  const totalCredits = grades.reduce((acc, g) => acc + parseFloat(g.credits || '3.0'), 0)
  const calculatedCGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '3.50'

  return (
    <>
      <PageHeader label="Academic Performance" title="My Grades & Transcript" />

      {/* Summary Stat Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-emerald-50/50 border border-emerald-200">
          <div className="p-3 bg-emerald-500 text-white rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-emerald-800">Current CGPA</div>
            <div className="text-2xl font-bold text-emerald-950">{calculatedCGPA} / 4.00</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-indigo-50/50 border border-indigo-200">
          <div className="p-3 bg-indigo-500 text-white rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-indigo-800">Completed Courses</div>
            <div className="text-2xl font-bold text-indigo-950">{grades.length} Courses</div>
          </div>
        </Card>
      </div>

      {/* Grades List Card */}
      <Card className="mt-5 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Enrolled Course Grades</h3>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading academic records...</div>
        ) : grades.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No grade records available for this semester.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 pb-3 font-semibold text-xs text-gray-500 uppercase tracking-wider">
              <span>Course</span>
              <span>Credits</span>
              <span>Score</span>
              <span>Grade</span>
            </div>

            {grades.map((grade) => (
              <div key={grade.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 py-3.5 items-center text-sm">
                <div>
                  <span className="font-semibold text-gray-900">{grade.course_code}</span>
                  <span className="text-gray-600 block text-xs">{grade.course_title}</span>
                </div>
                <span className="text-gray-700 font-medium">{grade.credits} Credits</span>
                <span className="text-gray-700">{grade.percentage ? `${grade.percentage}%` : '—'}</span>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {grade.letter} ({grade.points})
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
