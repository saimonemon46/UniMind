import { BookOpen, CalendarClock, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'

interface AssignmentItem {
  id: string
  title: string
  course: string
  due: string
  status: 'Not started' | 'Draft saved' | 'Ready'
}

interface RecommendationItem {
  id: string
  title: string
  detail: string
  tone: 'terracotta' | 'amber' | 'moss'
}

const assignments: AssignmentItem[] = [
  { id: 'as-1', title: 'Indexing lab report', course: 'Database Systems', due: 'Tonight, 11:59', status: 'Draft saved' },
  { id: 'as-2', title: 'AVL tree exercise', course: 'Data Structures', due: 'Tue, 09:00', status: 'Not started' },
  { id: 'as-3', title: 'Sprint reflection', course: 'Software Engineering', due: 'Fri, 17:00', status: 'Ready' },
]

const recommendations: RecommendationItem[] = [
  { id: 'rec-1', title: 'Review joins and indexes', detail: 'Your quiz pattern suggests a 25 minute practice set before the lab.', tone: 'amber' },
  { id: 'rec-2', title: 'Protect attendance streak', detail: 'One more absence in CSE 220 will move the course into watch status.', tone: 'terracotta' },
  { id: 'rec-3', title: 'Good momentum', detail: 'Software Engineering submissions are consistently ahead of deadline.', tone: 'moss' },
]

export function StudentDashboard() {
  const attendance = 94
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (attendance / 100) * circumference

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Personal view</p>
          <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">Student Dashboard</h2>
        </div>
        <Badge tone="amber">CSE Program</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="GPA" value="3.62" detail="Current cumulative average" icon={TrendingUp} tone="amber" />
        <StatCard label="Credits" value="78" detail="Completed toward degree" icon={BookOpen} tone="neutral" />
        <StatCard label="Assignments" value="5" detail="Due in the next week" icon={CalendarClock} tone="terracotta" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr_320px]">
        <section className="rounded-lg border border-ink-10 bg-white p-5">
          <h3 className="font-serif text-xl font-normal text-ink">Attendance</h3>
          <div className="mt-5 flex items-center justify-center">
            <div className="relative h-40 w-40">
              <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120" role="img" aria-label="Attendance 94 percent">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#E5DDD0" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#D4821A"
                  strokeLinecap="round"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-serif text-3xl text-ink">{attendance}%</p>
                  <p className="text-xs text-ink-60">Overall</p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-ink-60">Strong standing across enrolled courses.</p>
        </section>

        <section className="rounded-lg border border-ink-10 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl font-normal text-ink">Upcoming assignments</h3>
            <Badge tone="neutral">This week</Badge>
          </div>
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <article key={assignment.id} className="flex flex-col gap-3 rounded-sm border border-ink-10 bg-sand-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink">{assignment.title}</p>
                  <p className="mt-1 text-sm text-ink-60">{assignment.course} / {assignment.due}</p>
                </div>
                <Badge tone={assignment.status === 'Ready' ? 'moss' : assignment.status === 'Draft saved' ? 'amber' : 'terracotta'}>
                  {assignment.status}
                </Badge>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-lg border border-ink-10 bg-white p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber" aria-hidden="true" />
            <h3 className="font-serif text-xl font-normal text-ink">AI recommendations</h3>
          </div>
          <div className="mt-4 space-y-3">
            {recommendations.map((item) => (
              <div key={item.id} className="rounded-sm border border-ink-10 bg-sand-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-moss" aria-hidden="true" />
                  <p className="font-medium text-ink">{item.title}</p>
                </div>
                <p className="mt-2 text-sm text-ink-60">{item.detail}</p>
                <div className="mt-3"><Badge tone={item.tone}>Recommended</Badge></div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
