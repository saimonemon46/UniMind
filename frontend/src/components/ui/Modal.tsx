import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  children: ReactNode
  open: boolean
  onClose?: () => void
}

export function Modal({ title, children, open, onClose }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-sm px-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-150 bg-white p-6 shadow-2xl font-sans">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <h2 className="font-extrabold text-xl text-gray-900 tracking-tight">{title}</h2>
          {onClose ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-slate-50 transition-colors"
              aria-label="Close modal"
              onClick={onClose}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  )
}
