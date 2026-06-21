type Risk = 'low' | 'medium' | 'high'

const config = {
  low: { bg: 'bg-moss-light', text: 'text-moss-dim', dot: 'bg-moss' },
  medium: { bg: 'bg-amber-light', text: 'text-amber-dim', dot: 'bg-amber' },
  high: { bg: 'bg-terracotta-light', text: 'text-terracotta-dim', dot: 'bg-terracotta' },
}

export function RiskBadge({ level }: { level: Risk }) {
  const c = config[level]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}
