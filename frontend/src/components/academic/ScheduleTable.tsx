import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, MapPin } from 'lucide-react'
import { schedulingApi } from '@/api/scheduling.api'
import { Card } from '@/components/ui/Card'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function ScheduleTable() {
  const { data: classes = [], isLoading } = useQuery({ queryKey: ['class-schedules'], queryFn: schedulingApi.classSchedules })
  const { data: exams = [] } = useQuery({ queryKey: ['exam-schedules'], queryFn: schedulingApi.examSchedules })

  if (isLoading) return <Card><p className="text-sm text-ink-60">Loading your schedule?</p></Card>

  return <div className="space-y-5">
    <Card>
      <div className="mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-terracotta" /><h2 className="font-serif text-xl">Class routine</h2></div>
      {classes.length === 0 ? <p className="text-sm text-ink-60">No classes have been scheduled yet.</p> : <div className="divide-y divide-ink-10">{[...classes].sort((a, b) => days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week) || a.start_time.localeCompare(b.start_time)).map((item) => <div key={item.id} className="grid gap-2 py-3 text-sm md:grid-cols-[110px_1fr_auto]"><span className="capitalize text-ink-60">{item.day_of_week}</span><span><strong>{item.course_code}</strong> ? {item.course_title}</span><span className="flex gap-3 text-xs text-ink-60"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{item.start_time.slice(0, 5)}?{item.end_time.slice(0, 5)}</span><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{item.room_name}</span></span></div>)}</div>}
    </Card>
    <Card>
      <div className="mb-4 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-terracotta" /><h2 className="font-serif text-xl">Examinations</h2></div>
      {exams.length === 0 ? <p className="text-sm text-ink-60">No examinations are available.</p> : <div className="divide-y divide-ink-10">{exams.map((exam) => <div key={exam.id} className="py-3 text-sm"><strong>{exam.course_code}</strong> ? {exam.title}<p className="mt-1 text-xs text-ink-60">{new Date(exam.starts_at).toLocaleString()} ? {exam.room_name} ? {exam.status}</p></div>)}</div>}
    </Card>
  </div>
}
