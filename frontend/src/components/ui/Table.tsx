import type { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
}

export function Table({ children }: TableProps) {
  return <table className="w-full border-collapse text-left text-sm text-ink">{children}</table>
}

export function TableHeader({ children }: TableProps) {
  return <thead className="bg-sand-50 text-xs uppercase tracking-wider text-ink-30">{children}</thead>
}
