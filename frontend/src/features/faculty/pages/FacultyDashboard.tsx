import { RiskBadge } from '@/components/ui/RiskBadge'
import { StatCard } from '@/components/ui/StatCard'

export function FacultyDashboard() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Course view</p>
        <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">Faculty Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Courses" value="4" detail="This semester" />
        <StatCard label="Attendance" value="91%" detail="Average across courses" />
        <StatCard label="Submissions" value="37" detail="Need grading" />
      </div>
      <div className="rounded-lg border border-ink-10 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Student risk</p>
        <div className="mt-4 flex items-center justify-between border-t border-ink-10 pt-4 text-sm">
          <span>Sample Student</span>
          <RiskBadge level="medium" />
        </div>
      </div>
    </section>
  )
}
