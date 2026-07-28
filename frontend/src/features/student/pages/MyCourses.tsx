import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'

interface Course { id: number; code: string; title: string; credits: string; faculty_name: string; semester_name: string }
interface Envelope<T> { data: T }

export function MyCourses() {
  const query = useQuery({ queryKey: ['courses'], queryFn: async () => (await apiClient.get<Envelope<Course[]>>('/courses/')).data.data })
  return <><PageHeader label="Academic records" title="My courses" /><div className="mt-5 grid gap-3 md:grid-cols-2">{query.isLoading && <p className="text-sm text-ink-60">Loading enrolled courses...</p>}{(query.data ?? []).map((course) => <Card key={course.id} className="p-5"><p className="text-xs font-medium uppercase tracking-widest text-ink-30">{course.code}</p><h2 className="mt-2 font-serif text-xl">{course.title}</h2><p className="mt-3 text-sm text-ink-60">{course.credits} credits · {course.semester_name}</p><p className="mt-1 text-sm text-ink-60">Instructor: {course.faculty_name}</p></Card>)}</div></>
}
