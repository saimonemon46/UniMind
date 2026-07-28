import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/api/analytics.api'
import { Card } from '@/components/ui/Card'

interface DashboardData { role: string; stats: Record<string, number>; active_semester?: { name: string } | null; profile?: { name: string; department: string | null; program: string | null }; courses?: Array<{ id: number; code: string; title: string; enrolled: number; attendance_rate: number }>; assignments?: Array<{ id: number; title: string; course: string; due_at: string; submission_status: string | null }>; students?: Array<{ id: number; name: string; program: string; gpa: number; attendance_rate: number; risk: string }>; departments?: Array<{ id: number; name: string; students: number; attendance_rate: number; courses: number }> }
interface Envelope<T> { data: T; message: string; success: boolean }

export function DatabaseDashboard() {
  const query = useQuery({ queryKey: ['analytics', 'dashboard'], queryFn: async () => (await analyticsApi.dashboard<DashboardData>()) })
  if (query.isLoading) return <p className="text-sm text-ink-60">Loading live university data...</p>
  if (query.isError || !query.data) return <p className="text-sm text-terracotta">Unable to load dashboard data.</p>
  const data = query.data
  return <section className="space-y-5"><div><p className="text-xs font-medium uppercase tracking-widest text-ink-30">Live database view</p><h2 className="mt-2 font-serif text-2xl text-ink">{data.profile?.name ?? `${data.role} dashboard`}</h2><p className="mt-2 text-sm text-ink-60">{data.profile?.program ?? data.profile?.department ?? data.active_semester?.name ?? 'University records'}</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Object.entries(data.stats).map(([label, value]) => <Card key={label} className="p-5"><p className="text-xs font-medium uppercase tracking-widest text-ink-30">{label.replace(/_/g, ' ')}</p><p className="mt-2 font-serif text-3xl text-ink">{typeof value === 'number' ? value.toLocaleString() : value}</p></Card>)}</div>{data.courses && <Card className="p-5"><h3 className="font-serif text-xl">Courses</h3><div className="mt-4 space-y-2">{data.courses.map((course) => <p key={course.id} className="text-sm text-ink">{course.code} · {course.title} — {course.enrolled} enrolled, {course.attendance_rate}% attendance</p>)}</div></Card>}{data.assignments && <Card className="p-5"><h3 className="font-serif text-xl">Upcoming assignments</h3><div className="mt-4 space-y-2">{data.assignments.map((assignment) => <p key={assignment.id} className="text-sm text-ink">{assignment.course} · {assignment.title} · due {new Date(assignment.due_at).toLocaleString()}</p>)}</div></Card>}</section>
}

