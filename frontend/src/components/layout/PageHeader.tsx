interface PageHeaderProps {
  label: string
  title: string
}

export function PageHeader({ label, title }: PageHeaderProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-ink-30">{label}</p>
      <h1 className="mt-2 font-serif text-2xl font-normal tracking-tight text-ink">{title}</h1>
    </div>
  )
}
