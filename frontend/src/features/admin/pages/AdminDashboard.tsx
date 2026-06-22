import { BarChart3, BookOpen, Building2, ShieldCheck, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { DataTable } from '@/components/ui/Table'

interface UserRow {
  id: string
  name: string
  role: 'admin' | 'faculty' | 'student' | 'advisor'
  department: string
  status: 'Active' | 'Invited' | 'Review'
}

interface DepartmentMetric {
  id: string
  name: string
  students: number
  attendance: string
  risk: string
  fill: string
}

const users: UserRow[] = [
  { id: 'USR-001', name: 'Ayesha Noor', role: 'admin', department: 'Registrar', status: 'Active' },
  { id: 'USR-114', name: 'Farhan Islam', role: 'faculty', department: 'Computer Science', status: 'Active' },
  { id: 'USR-227', name: 'Maliha Chowdhury', role: 'advisor', department: 'Student Success', status: 'Invited' },
  { id: 'USR-482', name: 'Tanvir Hossain', role: 'student', department: 'Computer Science', status: 'Review' },
]

const departmentMetrics: DepartmentMetric[] = [
  { id: 'dept-cse', name: 'Computer Science', students: 486, attendance: '92%', risk: '18 alerts', fill: 'w-[78%]' },
  { id: 'dept-bba', name: 'Business Administration', students: 352, attendance: '89%', risk: '11 alerts', fill: 'w-[62%]' },
  { id: 'dept-eee', name: 'Electrical Engineering', students: 291, attendance: '94%', risk: '7 alerts', fill: 'w-[48%]' },
]

const statusTone: Record<UserRow['status'], 'moss' | 'amber' | 'terracotta'> = {
  Active: 'moss',
  Invited: 'amber',
  Review: 'terracotta',
}

export function AdminDashboard() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Institutional view</p>
          <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">Admin Dashboard</h2>
        </div>
        <Badge tone="neutral">System healthy</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Students" value="1,248" detail="Active academic records" icon={Users} tone="neutral" />
        <StatCard label="Faculty" value="84" detail="Teaching this semester" icon={ShieldCheck} tone="moss" />
        <StatCard label="Courses" value="86" detail="Across all departments" icon={BookOpen} tone="amber" />
        <StatCard label="Risk alerts" value="23" detail="Awaiting intervention" icon={BarChart3} tone="terracotta" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-serif text-xl font-normal text-ink">User management</h3>
            <span className="text-sm text-ink-60">Latest account activity</span>
          </div>
          <DataTable
            data={users}
            getRowKey={(user) => user.id}
            columns={[
              {
                key: 'name',
                header: 'User',
                render: (user) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} role={user.role} />
                    <div>
                      <p className="font-medium text-ink">{user.name}</p>
                      <p className="text-xs text-ink-60">{user.id}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'role', header: 'Role', render: (user) => <span className="capitalize">{user.role}</span> },
              { key: 'department', header: 'Department' },
              { key: 'status', header: 'Status', render: (user) => <Badge tone={statusTone[user.status]}>{user.status}</Badge> },
            ]}
          />
        </section>

        <aside className="rounded-lg border border-ink-10 bg-white p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-ink-60" aria-hidden="true" />
            <h3 className="font-serif text-xl font-normal text-ink">Department analytics</h3>
          </div>
          <div className="mt-4 space-y-4">
            {departmentMetrics.map((department) => (
              <article key={department.id} className="rounded-sm border border-ink-10 bg-sand-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">{department.name}</p>
                    <p className="mt-1 text-sm text-ink-60">{department.students} students / {department.attendance} attendance</p>
                  </div>
                  <Badge tone="terracotta">{department.risk}</Badge>
                </div>
                <div className="mt-4 h-2 rounded-full bg-sand-200">
                  <div className={`h-2 rounded-full bg-terracotta ${department.fill}`} />
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
