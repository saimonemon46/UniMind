import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, id, children, className = '', ...props }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={selectId} className="block">
      <span className="text-xs font-medium uppercase tracking-widest text-ink-30">{label}</span>
      <select id={selectId} className={`mt-2 w-full rounded-sm border border-ink-10 bg-white px-3 py-2 text-sm text-ink ${className}`} {...props}>
        {children}
      </select>
    </label>
  )
}
