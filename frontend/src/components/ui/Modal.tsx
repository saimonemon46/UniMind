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
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4">
      <section className="w-full max-w-lg rounded-lg border border-ink-10 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-ink">{title}</h2>
          {onClose ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-ink-10 text-ink-60 hover:bg-sand-100"
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
