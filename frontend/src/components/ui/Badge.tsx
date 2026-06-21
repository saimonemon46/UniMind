import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'terracotta' | 'amber' | 'moss'
}

const tones = {
  neutral: 'bg-sand-200 text-ink-60',
  terracotta: 'bg-terracotta-light text-terracotta-dim',
  amber: 'bg-amber-light text-amber-dim',
  moss: 'bg-moss-light text-moss-dim',
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>
}
