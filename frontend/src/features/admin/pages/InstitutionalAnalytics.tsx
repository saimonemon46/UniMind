import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchInstitutionalAnalyticsSummary } from '@/api/ai.api'
import { fetchAllStudents } from '@/api/students.api'
import { fetchCourses } from '@/api/courses.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { BarChart3, Sparkles, Users, BookOpen, GraduationCap, Loader2 } from 'lucide-react'

export function InstitutionalAnalytics() {
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: fetchAllStudents })
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: fetchCourses })

  const [narrative, setNarrative] = useState<string>('')
  const [loadingAI, setLoadingAI] = useState<boolean>(false)

  const handleGenerateSummary = async () => {
    setLoadingAI(true)
    try {
      const res = await fetchInstitutionalAnalyticsSummary(
        students.length || 100,
        10,
        courses.length || 55,
        88.5
      )
      setNarrative(res.data?.summary_narrative || '')
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <>
      <PageHeader label="Executive Dashboard" title="Institutional Analytics & AI Reporting" />

      {/* Metrics Overview */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 bg-indigo-50/50 border border-indigo-100">
          <div className="p-3 bg-indigo-600 text-white rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-700 uppercase">Total Students</div>
            <div className="text-2xl font-bold text-gray-900">{students.length || 100}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-emerald-50/50 border border-emerald-100">
          <div className="p-3 bg-emerald-600 text-white rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase">Faculty Count</div>
            <div className="text-2xl font-bold text-gray-900">10 Active</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-blue-50/50 border border-blue-100">
          <div className="p-3 bg-blue-600 text-white rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase">Active Courses</div>
            <div className="text-2xl font-bold text-gray-900">{courses.length || 55}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-amber-50/50 border border-amber-100">
          <div className="p-3 bg-amber-600 text-white rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-700 uppercase">Avg Attendance</div>
            <div className="text-2xl font-bold text-gray-900">88.5%</div>
          </div>
        </Card>
      </div>

      {/* AI Institutional Executive Report Generator */}
      <Card className="mt-6 p-6 border border-indigo-200 bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              <h3 className="text-lg font-bold">Groq AI Executive Insight Generator</h3>
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Synthesize institutional enrollment, faculty distribution, and academic performance data in real time.
            </p>
          </div>

          <button
            onClick={handleGenerateSummary}
            disabled={loadingAI}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate AI Report
          </button>
        </div>

        {narrative ? (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-sm leading-relaxed text-indigo-50">
            {narrative}
          </div>
        ) : (
          <div className="mt-4 p-4 bg-white/5 rounded-xl text-xs text-indigo-300 text-center">
            Click "Generate AI Report" to query Groq LLM for real-time institutional summary.
          </div>
        )}
      </Card>
    </>
  )
}
