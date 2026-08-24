import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarClock, ClipboardCheck, HeartHandshake, Users, Sparkles, Search, Bot, AlertTriangle, CheckCircle2, Loader2, BrainCircuit, RefreshCw } from 'lucide-react'
import { analyticsApi } from '@/api/analytics.api'
import { fetchRiskAssessment } from '@/api/ai.api'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { StatCard } from '@/components/ui/StatCard'
import { DataTable } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

type RiskLevel = 'low' | 'medium' | 'high'

interface AssignedStudent {
  id: string
  name: string
  program: string
  gpa: string | number
  attendance_rate?: number
  lastContact?: string
  risk: RiskLevel
}

interface InterventionPlan {
  id: string
  student: string
  focus: string
  nextStep: string
  status: string
  tone?: 'terracotta' | 'amber' | 'moss'
}

const fallbackStudents: AssignedStudent[] = [
  { id: 'ST-1042', name: 'Nadia Rahman', program: 'BSc CSE', gpa: '2.74', attendance_rate: 68, lastContact: 'Yesterday', risk: 'high' },
  { id: 'ST-1187', name: 'Imran Karim', program: 'BSc CSE', gpa: '3.08', attendance_rate: 78, lastContact: 'Jun 18', risk: 'medium' },
  { id: 'ST-1264', name: 'Raisa Sultana', program: 'BBA', gpa: '3.44', attendance_rate: 92, lastContact: 'Jun 17', risk: 'low' },
  { id: 'ST-1320', name: 'Sofia Ahmed', program: 'BSc CSE', gpa: '3.71', attendance_rate: 95, lastContact: 'Jun 15', risk: 'low' },
  { id: 'ST-1405', name: 'Tariq Hasan', program: 'EEE', gpa: '2.40', attendance_rate: 62, lastContact: '3 days ago', risk: 'high' },
  { id: 'ST-1512', name: 'Ayesha Chowdhury', program: 'BBA', gpa: '3.15', attendance_rate: 85, lastContact: 'Jun 10', risk: 'medium' },
]

const fallbackPlans: InterventionPlan[] = [
  { id: 'plan-1', student: 'Nadia Rahman', focus: 'Attendance recovery', nextStep: 'Guardian call scheduled', status: 'Open', tone: 'terracotta' },
  { id: 'plan-2', student: 'Imran Karim', focus: 'Weekly tutoring', nextStep: 'Check quiz improvement', status: 'In progress', tone: 'amber' },
  { id: 'plan-3', student: 'Raisa Sultana', focus: 'Course load balance', nextStep: 'Review after midterm', status: 'Monitoring', tone: 'moss' },
]

export function AdvisorDashboard() {
  const { data: dashboardData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['advisorDashboard'],
    queryFn: analyticsApi.advisorDashboard,
    staleTime: 30000,
  })

  // State filters & pagination
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 5

  // AI Modal state
  const [selectedStudentForAI, setSelectedStudentForAI] = useState<AssignedStudent | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  // Merge backend data with fallback if backend list is empty
  const rawStudents: AssignedStudent[] = useMemo(() => {
    if (dashboardData?.students && dashboardData.students.length > 0) {
      return dashboardData.students.map((s: any) => ({
        id: String(s.id),
        name: s.name || 'Student',
        program: s.program || 'Undergraduate',
        gpa: typeof s.gpa === 'number' ? s.gpa.toFixed(2) : String(s.gpa ?? '0.00'),
        attendance_rate: s.attendance_rate ?? 80,
        lastContact: s.lastContact || 'Recent',
        risk: (s.risk as RiskLevel) || 'low',
      }))
    }
    return fallbackStudents
  }, [dashboardData])

  const plans: InterventionPlan[] = useMemo(() => {
    if (dashboardData?.plans && dashboardData.plans.length > 0) {
      return dashboardData.plans.map((p: any) => {
        const studentName = p.student__first_name ? `${p.student__first_name} ${p.student__last_name || ''}` : (p.student || 'Student')
        let tone: 'terracotta' | 'amber' | 'moss' = 'amber'
        if (p.status?.toLowerCase().includes('open') || p.status?.toLowerCase().includes('high')) tone = 'terracotta'
        else if (p.status?.toLowerCase().includes('monitor') || p.status?.toLowerCase().includes('closed')) tone = 'moss'
        return {
          id: String(p.id),
          student: studentName,
          focus: p.focus || 'Academic intervention',
          nextStep: p.next_step || 'Follow up scheduled',
          status: p.status || 'Active',
          tone,
        }
      })
    }
    return fallbackPlans
  }, [dashboardData])

  // Filter students
  const filteredStudents = useMemo(() => {
    return rawStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.program.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase())
      const matchesRisk = riskFilter === 'all' || s.risk === riskFilter
      return matchesSearch && matchesRisk
    })
  }, [rawStudents, search, riskFilter])

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredStudents.slice(start, start + pageSize)
  }, [filteredStudents, page, pageSize])

  // Handle AI Risk Assessment call
  const handleRunAiAssessment = async (student: AssignedStudent) => {
    setSelectedStudentForAI(student)
    setAiLoading(true)
    setAiResult(null)
    setAiError(null)

    try {
      const gpaNum = typeof student.gpa === 'string' ? parseFloat(student.gpa) : student.gpa
      const attNum = student.attendance_rate ?? 75
      const res = await fetchRiskAssessment(student.id, student.name, attNum, gpaNum, student.risk === 'high' ? 2 : 0)
      setAiResult(res?.data || res)
    } catch (err: any) {
      console.error('AI Risk Assessment error:', err)
      setAiError(err?.response?.data?.detail || err?.message || 'Unable to connect to AI Service. Please ensure AI Service is running.')
    } finally {
      setAiLoading(false)
    }
  }

  // Stats calculation
  const totalCount = dashboardData?.stats?.assigned_students ?? rawStudents.length
  const highRiskCount = dashboardData?.stats?.high_risk ?? rawStudents.filter((s) => s.risk === 'high').length
  const openPlansCount = dashboardData?.stats?.open_plans ?? plans.length
  const avgGpa = dashboardData?.stats?.average_gpa ?? (rawStudents.reduce((acc, curr) => acc + (parseFloat(String(curr.gpa)) || 0), 0) / rawStudents.length).toFixed(2)

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center bg-gradient-to-r from-sand-100/80 via-white to-sand-50/50 p-6 rounded-2xl border border-ink-10 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-40">Advising Intelligence Portal</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-moss-light px-2 py-0.5 text-[10px] font-medium text-moss-dim">
              <Sparkles className="h-3 w-3 text-moss" /> AI Enhanced
            </span>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-normal tracking-tight text-ink">Advisor Dashboard</h2>
          <p className="mt-1 text-sm text-ink-60">Monitor student academic health, track intervention plans, and generate AI insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg border border-ink-10 bg-white px-3 py-2 text-xs font-medium text-ink-60 shadow-sm hover:bg-sand-50 transition-colors disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Badge tone="moss">
            {totalCount} Active Students
          </Badge>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned Students" value={String(totalCount)} detail={`Avg GPA: ${avgGpa}`} icon={Users} tone="moss" />
        <StatCard label="At-Risk Priority" value={String(highRiskCount)} detail="Require immediate intervention" icon={AlertTriangle} tone="terracotta" />
        <StatCard label="Active Interventions" value={String(openPlansCount)} detail="Plans in progress or open" icon={ClipboardCheck} tone="amber" />
        <StatCard label="Stabilized Rate" value="84%" detail="Moved to low risk this semester" icon={HeartHandshake} tone="neutral" />
      </div>

      {/* Main Grid: Student Table & Intervention Side Panel */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Student Risk & Academic Overview */}
        <div className="space-y-4 rounded-2xl border border-ink-10 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-10">
            <div>
              <h3 className="font-serif text-xl font-normal text-ink">Assigned Students</h3>
              <p className="text-xs text-ink-60">Evaluate academic progress & launch AI risk assessment</p>
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-sand-100/60 p-1 rounded-lg">
              {['all', 'high', 'medium', 'low'].map((level) => (
                <button
                  key={level}
                  onClick={() => { setRiskFilter(level); setPage(1); }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                    riskFilter === level
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink-60 hover:text-ink hover:bg-white/50'
                  }`}
                >
                  {level === 'all' ? 'All Risks' : `${level} risk`}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar & Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-40" />
              <input
                type="text"
                placeholder="Search by student name, ID, or program..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-xl border border-ink-10 bg-sand-50/50 pl-9 pr-4 py-2 text-sm text-ink focus:border-ink-40 focus:bg-white focus:outline-none transition-all placeholder:text-ink-30"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-60 justify-end">
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-ink-10 px-2.5 py-1.5 bg-white disabled:opacity-40 hover:bg-sand-50 text-xs"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-ink-10 px-2.5 py-1.5 bg-white disabled:opacity-40 hover:bg-sand-50 text-xs"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          {isLoading ? (
            <div className="py-12 text-center text-sm text-ink-40">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-ink-40" />
              Loading student advising records...
            </div>
          ) : (
            <DataTable
              data={paginatedStudents}
              getRowKey={(student) => student.id}
              columns={[
                {
                  key: 'name',
                  header: 'Student',
                  render: (student) => (
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} role="student" />
                      <div>
                        <p className="font-medium text-ink">{student.name}</p>
                        <p className="text-xs text-ink-40">{student.id}</p>
                      </div>
                    </div>
                  ),
                },
                { key: 'program', header: 'Program' },
                {
                  key: 'gpa',
                  header: 'GPA',
                  render: (student) => <span className="font-mono text-sm font-semibold">{student.gpa}</span>,
                },
                {
                  key: 'attendance_rate',
                  header: 'Attendance',
                  render: (student) => (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      (student.attendance_rate ?? 100) < 75 ? 'bg-terracotta-light text-terracotta-dim' : 'bg-sand-100 text-ink-60'
                    }`}>
                      {student.attendance_rate ?? 80}%
                    </span>
                  ),
                },
                {
                  key: 'risk',
                  header: 'Risk Level',
                  render: (student) => <RiskBadge level={student.risk} />,
                },
                {
                  key: 'id',
                  header: 'AI Action',
                  render: (student) => (
                    <button
                      type="button"
                      onClick={() => handleRunAiAssessment(student)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-amber/40 bg-amber-light/30 text-amber-dim hover:bg-amber-light/60 transition-colors"
                    >
                      <Sparkles className="h-3 w-3 text-amber" />
                      Analyze AI
                    </button>
                  ),
                },
              ]}
            />
          )}
        </div>

        {/* Right Side: AI Assistant Banner & Intervention Tracker */}
        <aside className="space-y-5">
          {/* AI Advisor Card */}
          <div className="rounded-2xl border border-amber/30 bg-gradient-to-br from-amber-light/40 via-white to-sand-50/80 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <BrainCircuit className="w-32 h-32 text-amber" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-light text-amber-dim">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium text-ink text-sm">UniMind AI Advisor</h4>
                <p className="text-[11px] text-ink-60">Groq LLM Powered Analytics</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-60">
              Click <strong className="text-ink">"Analyze AI"</strong> on any student to generate an instant risk diagnosis, early warnings, and tailor-made academic intervention plans.
            </p>
          </div>

          {/* Intervention Tracker */}
          <div className="rounded-2xl border border-ink-10 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-ink-10">
              <h3 className="font-serif text-lg font-normal text-ink">Intervention Tracker</h3>
              <Badge tone="moss">{plans.length} active</Badge>
            </div>
            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {plans.map((plan) => (
                <article key={plan.id} className="rounded-xl border border-ink-10 bg-sand-50/60 p-4 transition-all hover:bg-sand-50 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm text-ink">{plan.student}</p>
                      <p className="mt-0.5 text-xs text-ink-60">{plan.focus}</p>
                    </div>
                    <Badge tone={plan.tone || 'amber'}>{plan.status}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-60 border-t border-ink-10/40 pt-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-moss" />
                    <span>Next step: {plan.nextStep}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* AI Assessment Modal */}
      <Modal
        open={Boolean(selectedStudentForAI)}
        onClose={() => setSelectedStudentForAI(null)}
        title={`AI Risk Assessment: ${selectedStudentForAI?.name || ''}`}
      >
        <div className="space-y-4">
          {aiLoading ? (
            <div className="py-10 text-center text-ink-60 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber" />
              <p className="text-sm">Running Groq AI Risk Model for {selectedStudentForAI?.name}...</p>
              <p className="text-xs text-ink-40">Analyzing attendance patterns, GPA trajectory, and course performance.</p>
            </div>
          ) : aiError ? (
            <div className="rounded-xl border border-terracotta-light bg-terracotta-light/30 p-4 text-terracotta-dim text-xs space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-terracotta" /> AI Service Notice
              </p>
              <p>{aiError}</p>
            </div>
          ) : aiResult ? (
            <div className="space-y-4 text-xs">
              {/* Summary Header */}
              <div className="rounded-xl bg-sand-50 p-4 border border-ink-10 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-light flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-amber-dim" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-ink">Assessment Result</h4>
                  <p className="text-ink-60 mt-0.5 leading-relaxed">
                    {typeof aiResult === 'string'
                      ? aiResult
                      : aiResult.assessment || aiResult.summary || aiResult.reply || (aiResult.risk_level ? `Risk Level: ${aiResult.risk_level}. ${aiResult.recommendations?.join(', ') || ''}` : JSON.stringify(aiResult, null, 2))}
                  </p>
                </div>
              </div>

              {/* Student Metadata snapshot */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-sand-100/50">
                  <p className="text-[10px] text-ink-40 uppercase">GPA</p>
                  <p className="font-mono text-sm font-bold text-ink">{selectedStudentForAI?.gpa}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-sand-100/50">
                  <p className="text-[10px] text-ink-40 uppercase">Attendance</p>
                  <p className="font-mono text-sm font-bold text-ink">{selectedStudentForAI?.attendance_rate ?? 80}%</p>
                </div>
                <div className="p-2.5 rounded-lg bg-sand-100/50">
                  <p className="text-[10px] text-ink-40 uppercase">Risk Level</p>
                  <p className="font-mono text-sm font-bold capitalize text-ink">{selectedStudentForAI?.risk}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-ink-10">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForAI(null)}
                  className="px-3 py-2 rounded-xl border border-ink-10 bg-white text-ink-60 text-xs font-medium hover:bg-sand-50"
                >
                  Close
                </button>
                <Button
                  onClick={() => {
                    alert(`Intervention plan initiated for ${selectedStudentForAI?.name}`)
                    setSelectedStudentForAI(null)
                  }}
                >
                  Create Plan from AI
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </section>
  )
}
