import { RiskBadge } from '@/components/ui/RiskBadge'

interface RiskCardProps {
  level: 'low' | 'medium' | 'high'
  explanation: string
}

export function RiskCard({ level, explanation }: RiskCardProps) {
  return (
    <div className="rounded-lg border border-ink-10 bg-white p-5">
      <RiskBadge level={level} />
      <p className="mt-3 text-sm text-ink-60">{explanation}</p>
    </div>
  )
}
