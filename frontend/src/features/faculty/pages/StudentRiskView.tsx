import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAllStudents } from '@/api/students.api'
import { fetchRiskAssessment } from '@/api/ai.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { AlertTriangle, ShieldCheck, Sparkles, UserCheck, Loader2 } from 'lucide-react'

export function StudentRiskView() {
  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['allStudents'],
    queryFn: fetchAllStudents,
  })

  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [assessmentResult, setAssessmentResult] = useState<any>(null)
  const [evaluating, setEvaluating] = useState(false)

  const handleEvaluate = async (student: any) => {
    setSelectedStudentId(student.university_id)
    setEvaluating(true)
    try {
      const attendanceRate = 78.5
      const gpa = parseFloat(student.cgpa || '3.20')
      const res = await fetchRiskAssessment(student.university_id, `${student.user.first_name} ${student.user.last_name}`, attendanceRate, gpa, 1)
      setAssessmentResult(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <>
      <PageHeader label="AI Student Retention" title="Student Risk & Retention Monitor" />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Student Roster Card */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Enrolled Students Roster</h3>

          {loadingStudents ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading student profiles...</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1">
              {students.slice(0, 15).map((student) => (
                <div key={student.id} className="flex items-center justify-between py-3.5 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {student.user.first_name} {student.user.last_name}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      ID: {student.university_id} · CGPA: <strong className="text-gray-800">{student.cgpa}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => handleEvaluate(student)}
                    disabled={evaluating && selectedStudentId === student.university_id}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {evaluating && selectedStudentId === student.university_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    )}
                    Run AI Risk Check
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Risk Assessment Details */}
        <div>
          {assessmentResult ? (
            <Card className="p-6 border border-indigo-200 bg-gradient-to-b from-indigo-50/30 to-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">AI Assessment Result</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    assessmentResult.risk_level === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : assessmentResult.risk_level === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {assessmentResult.risk_level} RISK ({assessmentResult.risk_score}%)
                </span>
              </div>

              <h4 className="text-lg font-bold text-gray-900">{assessmentResult.student_name}</h4>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-white p-3 rounded-xl border border-gray-200">
                {assessmentResult.ai_summary}
              </p>

              <div className="mt-4">
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Recommended Interventions</h5>
                <ul className="space-y-2 text-xs text-gray-700">
                  {assessmentResult.recommendations?.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-indigo-50 p-2.5 rounded-lg">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center text-gray-500 py-12 border-dashed border-2 border-gray-200">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">No Student Selected</p>
              <p className="text-xs text-gray-500 mt-1">Select a student from the roster to run real-time Groq AI risk evaluation.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
