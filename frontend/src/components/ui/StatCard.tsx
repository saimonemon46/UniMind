import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  detail: string
  icon?: LucideIcon
  tone?: 'neutral' | 'terracotta' | 'amber' | 'moss'
}

const toneClasses = {
  neutral: 'bg-sand-100 text-ink-60',
  terracotta: 'bg-terracotta-light text-terracotta-dim',
  amber: 'bg-amber-light text-amber-dim',
  moss: 'bg-moss-light text-moss-dim',
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-ink-10 bg-white p-5 shadow-sm shadow-ink/5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-widest text-ink-30">{label}</p>
        {Icon ? (
          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${toneClasses[tone]}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-serif text-3xl font-normal text-ink">{value}</p>
      <p className="mt-2 text-xs text-ink-60">{detail}</p>
    </div>
  )
}
