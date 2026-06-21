import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={inputId} className="block">
      <span className="text-xs font-medium uppercase tracking-widest text-ink-30">{label}</span>
      <input
        id={inputId}
        className={`mt-2 w-full rounded-sm border border-ink-10 bg-white px-3 py-2 text-sm text-ink outline-none ring-terracotta/20 focus:ring-4 ${className}`}
        {...props}
      />
    </label>
  )
}
