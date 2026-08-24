import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { schedulingApi } from '@/api/scheduling.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ScheduleTable } from '@/components/academic/ScheduleTable'

interface Course { id: number; code: string; title: string }
interface Envelope<T> { data: T }

export function ManageSchedules() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ course: '', room: '', day_of_week: 'monday', start_time: '09:00', end_time: '10:30' })
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: async () => (await apiClient.get<Envelope<Course[]>>('/courses/')).data.data })
  const { data: rooms = [] } = useQuery({ queryKey: ['rooms'], queryFn: schedulingApi.rooms })
  const create = useMutation({ mutationFn: () => schedulingApi.createClassSchedule({ course: Number(form.course), room: Number(form.room), day_of_week: form.day_of_week, start_time: form.start_time, end_time: form.end_time }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['class-schedules'] }) })

  function submit(event: FormEvent) { event.preventDefault(); create.mutate() }

  return <><PageHeader label="Academic administration" title="Class & examination schedules" /><p className="mb-5 mt-2 text-sm text-ink-60">Create routines, allocate rooms, and publish examination schedules.</p>
    <Card className="mb-5 p-5"><h2 className="font-serif text-xl">Add class routine</h2><form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-5"><select required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="rounded-sm border border-ink-10 bg-white px-3 py-2 text-sm"><option value="">Course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select><select required value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="rounded-sm border border-ink-10 bg-white px-3 py-2 text-sm"><option value="">Room</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.code} · {room.name}</option>)}</select><select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })} className="rounded-sm border border-ink-10 bg-white px-3 py-2 text-sm">{['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((day) => <option key={day} value={day}>{day}</option>)}</select><div className="flex gap-2"><input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full rounded-sm border border-ink-10 px-2 py-2 text-sm" /><input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full rounded-sm border border-ink-10 px-2 py-2 text-sm" /></div><Button type="submit" disabled={create.isPending}>{create.isPending ? 'Saving...' : 'Add routine'}</Button></form>{create.isError && <p className="mt-3 text-sm text-terracotta">Unable to save this routine. Check for a timetable conflict.</p>}</Card>
    <ScheduleTable />
  </>
}

