import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Course { id: number; code: string; title: string }
interface Student { id: number; full_name: string; username: string }
interface Envelope<T> { data: T }

export function AttendanceMarking() {
  const [courseId, setCourseId] = useState('')
  const [classDate, setClassDate] = useState(new Date().toISOString().slice(0, 10))
  const [statuses, setStatuses] = useState<Record<number, string>>({})
  const courses = useQuery({ queryKey: ['courses'], queryFn: async () => (await apiClient.get<Envelope<Course[]>>('/courses/')).data.data })
  const students = useQuery({ queryKey: ['course-students', courseId], queryFn: async () => (await apiClient.get<Envelope<Student[]>>(`/courses/${courseId}/students/`)).data.data, enabled: Boolean(courseId) })
  const submit = useMutation({ mutationFn: async () => Promise.all((students.data ?? []).map((student) => apiClient.post('/attendance/', { course: Number(courseId), student: student.id, class_date: classDate, status: statuses[student.id] ?? 'present' }))) })

  return <><PageHeader label="Course delivery" title="Take attendance" /><p className="mb-5 mt-2 text-sm text-ink-60">Select a course and record attendance for the class date.</p><Card className="p-5"><div className="grid gap-3 md:grid-cols-2"><select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="rounded-sm border border-ink-10 px-3 py-2 text-sm"><option value="">Select a course</option>{(courses.data ?? []).map((course) => <option key={course.id} value={course.id}>{course.code} — {course.title}</option>)}</select><input type="date" value={classDate} onChange={(event) => setClassDate(event.target.value)} className="rounded-sm border border-ink-10 px-3 py-2 text-sm" /></div>{courseId && <div className="mt-5 divide-y divide-ink-10">{students.isLoading ? <p className="py-3 text-sm text-ink-60">Loading students…</p> : (students.data ?? []).map((student) => <div key={student.id} className="flex items-center justify-between gap-4 py-3"><span className="text-sm text-ink">{student.full_name || student.username}</span><select value={statuses[student.id] ?? 'present'} onChange={(event) => setStatuses({ ...statuses, [student.id]: event.target.value })} className="rounded-sm border border-ink-10 px-3 py-1.5 text-sm"><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="excused">Excused</option></select></div>)}</div>}{courseId && <div className="mt-5 flex items-center gap-3"><Button onClick={() => submit.mutate()} disabled={submit.isPending || !students.data?.length}>{submit.isPending ? 'Saving…' : 'Submit attendance'}</Button>{submit.isSuccess && <span className="text-sm text-moss">Attendance saved.</span>}{submit.isError && <span className="text-sm text-terracotta">Could not save. Attendance may already exist for this date.</span>}</div>}</Card></>
}
