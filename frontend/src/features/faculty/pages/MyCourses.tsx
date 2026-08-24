import { useQuery } from '@tanstack/react-query'
import { fetchCourses } from '@/api/courses.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { BookOpen, Users, Clock } from 'lucide-react'

export function MyCourses() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  })

  return (
    <>
      <PageHeader label="Faculty Teaching Sections" title="My Assigned Courses" />

      {isLoading ? (
        <div className="mt-8 text-center text-sm text-gray-500">Loading course assignments...</div>
      ) : courses.length === 0 ? (
        <div className="mt-8 text-center text-sm text-gray-500">No courses currently assigned.</div>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 9).map((course) => (
            <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-extrabold rounded-lg uppercase">
                  {course.code}
                </span>
                <span className="text-xs text-gray-500 font-medium">{course.credits} Credits</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-4">{course.description}</p>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" /> Max Capacity: {course.capacity}
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <Clock className="w-4 h-4" /> Active Term
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
