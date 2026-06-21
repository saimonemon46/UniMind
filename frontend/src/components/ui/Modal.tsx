import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  open: boolean
}

export function Modal({ title, children, open }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 px-4">
      <section className="w-full max-w-lg rounded-lg border border-ink-10 bg-white p-5">
        <h2 className="font-serif text-2xl font-normal tracking-tight text-ink">{title}</h2>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  )
}
