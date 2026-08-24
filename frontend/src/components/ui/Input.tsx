import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={inputId} className="block">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{label}</span>
      <input
        id={inputId}
        className={`w-full rounded-xl border border-gray-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 ${className}`}
        {...props}
      />
    </label>
  )
}
