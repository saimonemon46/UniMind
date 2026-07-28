import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

interface Attendance { id: number; course_code: string; class_date: string; status: string }
interface Envelope<T> { data: T }

export function MyAttendance() {
  const query = useQuery({ queryKey: ['attendance'], queryFn: async () => (await apiClient.get<Envelope<Attendance[]>>('/attendance/')).data.data })
  const records = query.data ?? []; const present = records.filter((item) => item.status === 'present' || item.status === 'late').length; const rate = records.length ? Math.round((present / records.length) * 100) : 0
  return <><PageHeader label="Academic records" title="My attendance" /><div className="mt-5 grid gap-5 lg:grid-cols-[240px_1fr]"><Card className="p-5"><p className="text-xs font-medium uppercase tracking-widest text-ink-30">Overall attendance</p><p className="mt-3 font-serif text-4xl text-ink">{rate}%</p><p className="mt-2 text-sm text-ink-60">{present} present or late out of {records.length} records</p></Card><Card className="p-5"><div className="divide-y divide-ink-10">{records.map((item) => <div key={item.id} className="flex justify-between py-3 text-sm"><span>{item.course_code}</span><span>{item.class_date}</span><span className="capitalize">{item.status}</span></div>)}</div></Card></div></>
}
