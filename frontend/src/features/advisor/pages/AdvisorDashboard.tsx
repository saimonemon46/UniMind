import { RiskBadge } from '@/components/ui/RiskBadge'
import { StatCard } from '@/components/ui/StatCard'

export function AdvisorDashboard() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Advising view</p>
        <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">Advisor Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assigned" value="42" detail="Students in active advising" />
        <StatCard label="Plans" value="11" detail="Intervention plans open" />
        <StatCard label="Meetings" value="7" detail="Scheduled this week" />
      </div>
      <div className="rounded-lg border border-ink-10 bg-white p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Priority students</p>
        <div className="mt-4 flex items-center justify-between border-t border-ink-10 pt-4 text-sm">
          <span>Sample Advisee</span>
          <RiskBadge level="high" />
        </div>
      </div>
    </section>
  )
}
