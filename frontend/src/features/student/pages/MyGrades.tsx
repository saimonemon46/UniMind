import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

interface Grade { id: number; course_code: string; course_title: string; credits: string; letter: string; points: string; percentage: string | null }
interface Envelope<T> { data: T }

export function MyGrades() {
  const query = useQuery({ queryKey: ['grades'], queryFn: async () => (await apiClient.get<Envelope<Grade[]>>('/grades/')).data.data })
  return <><PageHeader label="Academic records" title="My grades" /><Card className="mt-5 p-5"><div className="divide-y divide-ink-10">{(query.data ?? []).map((grade) => <div key={grade.id} className="grid grid-cols-[1fr_auto_auto] gap-4 py-3 text-sm"><span><strong>{grade.course_code}</strong> · {grade.course_title}</span><span>{grade.percentage ?? '—'}%</span><span>{grade.letter} ({grade.points})</span></div>)}</div></Card></>
}
