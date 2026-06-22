import { AlertTriangle, BookOpen, ClipboardCheck, GraduationCap, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { StatCard } from '@/components/ui/StatCard'
import { DataTable } from '@/components/ui/Table'

type RiskLevel = 'low' | 'medium' | 'high'

interface RiskStudent {
  id: string
  name: string
  course: string
  attendance: string
  lastScore: string
  risk: RiskLevel
}

interface CourseSummary {
  code: string
  title: string
  section: string
  enrolled: number
  nextSession: string
}

interface FacultyAlert {
  id: string
  title: string
  detail: string
  tone: 'terracotta' | 'amber' | 'moss'
}

const riskStudents: RiskStudent[] = [
  { id: 'ST-1042', name: 'Nadia Rahman', course: 'Data Structures', attendance: '68%', lastScore: '72', risk: 'high' },
  { id: 'ST-1187', name: 'Imran Karim', course: 'Database Systems', attendance: '77%', lastScore: '81', risk: 'medium' },
  { id: 'ST-1320', name: 'Sofia Ahmed', course: 'Software Engineering', attendance: '91%', lastScore: '88', risk: 'low' },
]

const courses: CourseSummary[] = [
  { code: 'CSE 220', title: 'Data Structures', section: 'A', enrolled: 42, nextSession: 'Today, 10:00' },
  { code: 'CSE 310', title: 'Database Systems', section: 'B', enrolled: 38, nextSession: 'Tue, 12:30' },
  { code: 'CSE 420', title: 'Software Engineering', section: 'A', enrolled: 34, nextSession: 'Wed, 09:00' },
]

const alerts: FacultyAlert[] = [
  { id: 'alert-1', title: 'Attendance drop', detail: '3 students missed two consecutive sessions.', tone: 'terracotta' },
  { id: 'alert-2', title: 'Grading queue', detail: '37 submissions need review before Friday.', tone: 'amber' },
  { id: 'alert-3', title: 'Course health', detail: 'Software Engineering average improved by 6%.', tone: 'moss' },
]

export function FacultyDashboard() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Course view</p>
          <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">Faculty Dashboard</h2>
        </div>
        <Badge tone="terracotta">Spring 2026</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Courses" value="4" detail="Active this semester" icon={BookOpen} tone="terracotta" />
        <StatCard label="Students" value="156" detail="Across all sections" icon={Users} tone="neutral" />
        <StatCard label="Attendance" value="91%" detail="Average across courses" icon={ClipboardCheck} tone="moss" />
        <StatCard label="Submissions" value="37" detail="Need grading" icon={GraduationCap} tone="amber" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-serif text-xl font-normal text-ink">Student risk</h3>
              <span className="text-sm text-ink-60">Updated 12 minutes ago</span>
            </div>
            <DataTable
              data={riskStudents}
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
                { key: 'course', header: 'Course' },
                { key: 'attendance', header: 'Attendance' },
                { key: 'lastScore', header: 'Last score' },
                { key: 'risk', header: 'Risk', render: (student) => <RiskBadge level={student.risk} /> },
              ]}
            />
          </section>

          <section className="rounded-lg border border-ink-10 bg-white p-5">
            <h3 className="font-serif text-xl font-normal text-ink">Course list</h3>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {courses.map((course) => (
                <article key={course.code} className="rounded-sm border border-ink-10 bg-sand-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-ink-30">{course.code} / Section {course.section}</p>
                  <h4 className="mt-2 font-medium text-ink">{course.title}</h4>
                  <div className="mt-4 flex items-center justify-between text-sm text-ink-60">
                    <span>{course.enrolled} enrolled</span>
                    <span>{course.nextSession}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-lg border border-ink-10 bg-white p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-terracotta" aria-hidden="true" />
            <h3 className="font-serif text-xl font-normal text-ink">Alerts</h3>
          </div>
          <div className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-sm border border-ink-10 bg-sand-50 p-4">
                <Badge tone={alert.tone}>{alert.title}</Badge>
                <p className="mt-3 text-sm text-ink-60">{alert.detail}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
