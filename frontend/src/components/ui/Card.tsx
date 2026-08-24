import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-lg border border-ink-10 bg-white ${className}`} {...props}>
      {children}
    </div>
  )
}
