import { CalendarClock, ClipboardCheck, HeartHandshake, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { StatCard } from '@/components/ui/StatCard'
import { DataTable } from '@/components/ui/Table'

type RiskLevel = 'low' | 'medium' | 'high'

interface AssignedStudent {
  id: string
  name: string
  program: string
  gpa: string
  lastContact: string
  risk: RiskLevel
}

interface InterventionPlan {
  id: string
  student: string
  focus: string
  nextStep: string
  status: 'Open' | 'In progress' | 'Monitoring'
  tone: 'terracotta' | 'amber' | 'moss'
}

const assignedStudents: AssignedStudent[] = [
  { id: 'ST-1042', name: 'Nadia Rahman', program: 'BSc CSE', gpa: '2.74', lastContact: 'Yesterday', risk: 'high' },
  { id: 'ST-1187', name: 'Imran Karim', program: 'BSc CSE', gpa: '3.08', lastContact: 'Jun 18', risk: 'medium' },
  { id: 'ST-1264', name: 'Raisa Sultana', program: 'BBA', gpa: '3.44', lastContact: 'Jun 17', risk: 'low' },
  { id: 'ST-1320', name: 'Sofia Ahmed', program: 'BSc CSE', gpa: '3.71', lastContact: 'Jun 15', risk: 'low' },
]

const plans: InterventionPlan[] = [
  { id: 'plan-1', student: 'Nadia Rahman', focus: 'Attendance recovery', nextStep: 'Guardian call scheduled', status: 'Open', tone: 'terracotta' },
  { id: 'plan-2', student: 'Imran Karim', focus: 'Weekly tutoring', nextStep: 'Check quiz improvement', status: 'In progress', tone: 'amber' },
  { id: 'plan-3', student: 'Raisa Sultana', focus: 'Course load balance', nextStep: 'Review after midterm', status: 'Monitoring', tone: 'moss' },
]

export function AdvisorDashboard() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Advising view</p>
          <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">Advisor Dashboard</h2>
        </div>
        <Badge tone="moss">42 assigned students</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Assigned" value="42" detail="Students in active advising" icon={Users} tone="moss" />
        <StatCard label="Open plans" value="11" detail="Interventions underway" icon={ClipboardCheck} tone="terracotta" />
        <StatCard label="Meetings" value="7" detail="Scheduled this week" icon={CalendarClock} tone="amber" />
        <StatCard label="Stabilized" value="16" detail="Students moved to low risk" icon={HeartHandshake} tone="neutral" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl font-normal text-ink">Assigned students</h3>
            <span className="text-sm text-ink-60">Sorted by risk priority</span>
          </div>
          <DataTable
            data={assignedStudents}
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
                      <p className="text-xs text-ink-60">{student.id}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'program', header: 'Program' },
              { key: 'gpa', header: 'GPA' },
              { key: 'lastContact', header: 'Last contact' },
              { key: 'risk', header: 'Risk', render: (student) => <RiskBadge level={student.risk} /> },
            ]}
          />
        </section>

        <aside className="rounded-lg border border-ink-10 bg-white p-5">
          <h3 className="font-serif text-xl font-normal text-ink">Intervention tracker</h3>
          <div className="mt-4 space-y-3">
            {plans.map((plan) => (
              <article key={plan.id} className="rounded-sm border border-ink-10 bg-sand-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{plan.student}</p>
                    <p className="mt-1 text-sm text-ink-60">{plan.focus}</p>
                  </div>
                  <Badge tone={plan.tone}>{plan.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-ink-60">{plan.nextStep}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
