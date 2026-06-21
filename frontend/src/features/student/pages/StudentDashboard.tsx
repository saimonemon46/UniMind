import { StatCard } from '@/components/ui/StatCard'

export function StudentDashboard() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Personal view</p>
        <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">Student Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="GPA" value="3.62" detail="Current cumulative average" />
        <StatCard label="Attendance" value="94%" detail="Across enrolled courses" />
        <StatCard label="Assignments" value="5" detail="Due in the next week" />
      </div>
    </section>
  )
}
