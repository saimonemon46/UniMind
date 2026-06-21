import { StatCard } from '@/components/ui/StatCard'

export function AdminDashboard() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">Institutional view</p>
        <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Students" value="1,248" detail="Active academic records" />
        <StatCard label="Courses" value="86" detail="Across all departments" />
        <StatCard label="Risk alerts" value="23" detail="Awaiting intervention" />
      </div>
    </section>
  )
}
