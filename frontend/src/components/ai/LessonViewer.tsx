interface LessonViewerProps {
  title: string
  summary: string
}

export function LessonViewer({ title, summary }: LessonViewerProps) {
  return (
    <article className="rounded-lg border border-ink-10 bg-white p-5">
      <h2 className="font-serif text-2xl font-normal tracking-tight text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-60">{summary}</p>
    </article>
  )
}
