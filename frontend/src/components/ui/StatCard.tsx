interface StatCardProps {
  label: string
  value: string
  detail: string
}

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-lg border border-ink-10 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-widest text-ink-30">{label}</p>
      <p className="mt-3 font-serif text-3xl font-normal text-ink">{value}</p>
      <p className="mt-2 text-xs text-ink-60">{detail}</p>
    </div>
  )
}
