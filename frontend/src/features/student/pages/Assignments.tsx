import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

interface Assignment { id: number; course_code: string; title: string; description: string; due_at: string; points: string }
interface Submission { assignment: number; status: string; score: string | null }
interface Envelope<T> { data: T }

export function Assignments() {
  const assignments = useQuery({ queryKey: ['assignments'], queryFn: async () => (await apiClient.get<Envelope<Assignment[]>>('/assignments/')).data.data })
  const submissions = useQuery({ queryKey: ['submissions'], queryFn: async () => (await apiClient.get<Envelope<Submission[]>>('/submissions/')).data.data })
  const byAssignment = new Map((submissions.data ?? []).map((item) => [item.assignment, item]))
  return <><PageHeader label="Coursework" title="Assignments" /><div className="mt-5 grid gap-3">{(assignments.data ?? []).map((assignment) => { const submission = byAssignment.get(assignment.id); return <Card key={assignment.id} className="p-5"><div className="flex justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-widest text-ink-30">{assignment.course_code}</p><h2 className="mt-2 font-serif text-xl">{assignment.title}</h2><p className="mt-2 text-sm text-ink-60">Due {new Date(assignment.due_at).toLocaleString()} · {assignment.points} points</p></div><p className="text-sm capitalize text-ink-60">{submission?.status ?? 'Not submitted'}</p></div></Card>})}</div></>
}
