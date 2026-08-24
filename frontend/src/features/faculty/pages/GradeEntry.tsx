import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Course { id: number; code: string; title: string }
interface Student { id: number; full_name: string; username: string }
interface Envelope<T> { data: T }

function gradeFromPercentage(value: number) { if (value >= 80) return ['A+', 4]; if (value >= 75) return ['A', 3.75]; if (value >= 70) return ['A-', 3.5]; if (value >= 65) return ['B+', 3.25]; if (value >= 60) return ['B', 3]; if (value >= 55) return ['B-', 2.75]; if (value >= 50) return ['C+', 2.5]; if (value >= 45) return ['C', 2.25]; if (value >= 40) return ['D', 2]; return ['F', 0] }

export function GradeEntry() {
  const [courseId, setCourseId] = useState('')
  const [marks, setMarks] = useState<Record<number, string>>({})
  const courses = useQuery({ queryKey: ['courses'], queryFn: async () => (await apiClient.get<Envelope<Course[]>>('/courses/')).data.data })
  const students = useQuery({ queryKey: ['course-students', courseId], queryFn: async () => (await apiClient.get<Envelope<Student[]>>(`/courses/${courseId}/students/`)).data.data, enabled: Boolean(courseId) })
  const save = useMutation({ mutationFn: async () => Promise.all((students.data ?? []).filter((student) => marks[student.id] !== undefined && marks[student.id] !== '').map((student) => { const percentage = Number(marks[student.id]); const [letter, points] = gradeFromPercentage(percentage); return apiClient.post('/grades/', { course: Number(courseId), student: student.id, percentage, letter, points }) })) })

  return <><PageHeader label="Assessment" title="Grade entry" /><p className="mb-5 mt-2 text-sm text-ink-60">Enter final course marks. Letter grades and GPA points are calculated from the institutional scale.</p><Card className="p-5"><select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full rounded-sm border border-ink-10 px-3 py-2 text-sm"><option value="">Select a course</option>{(courses.data ?? []).map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select>{courseId && <div className="mt-5 divide-y divide-ink-10">{(students.data ?? []).map((student) => { const value = marks[student.id]; const [letter] = value ? gradeFromPercentage(Number(value)) : ['—']; return <div key={student.id} className="grid grid-cols-[1fr_110px_50px] items-center gap-3 py-3"><span className="text-sm text-ink">{student.full_name || student.username}</span><input type="number" min="0" max="100" placeholder="Mark %" value={value ?? ''} onChange={(event) => setMarks({ ...marks, [student.id]: event.target.value })} className="rounded-sm border border-ink-10 px-3 py-2 text-sm" /><span className="text-sm text-ink-60">{letter}</span></div>})}</div>}{courseId && <div className="mt-5 flex items-center gap-3"><Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? 'Saving...' : 'Save grades'}</Button>{save.isSuccess && <span className="text-sm text-moss">Grades saved.</span>}{save.isError && <span className="text-sm text-terracotta">Could not save grades. Existing grades must be edited.</span>}</div>}</Card></>
}
