import { useQuery } from '@tanstack/react-query'
import { fetchAllStudents } from '@/api/students.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { UserCheck, Award, AlertCircle } from 'lucide-react'

export function AssignedStudents() {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: fetchAllStudents,
  })

  return (
    <>
      <PageHeader label="Advising Roster" title="Assigned Advisees" />

      <Card className="mt-5 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900">Student Advisee List</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
            {students.length} Advisees Assigned
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading advisee list...</div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1">
            <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Student Name</span>
              <span>University ID</span>
              <span>Program</span>
              <span>CGPA</span>
              <span>Standing</span>
            </div>

            {students.map((student) => (
              <div key={student.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 py-3.5 text-sm items-center">
                <div>
                  <span className="font-bold text-gray-900">
                    {student.user.first_name} {student.user.last_name}
                  </span>
                  <span className="text-xs text-gray-500 block">{student.user.email}</span>
                </div>
                <span className="font-mono text-xs text-gray-700 font-semibold">{student.university_id}</span>
                <span className="text-xs text-gray-600 font-medium">{student.program_name || 'BSc CSE'}</span>
                <span className="font-bold text-indigo-700">{student.cgpa}</span>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {student.academic_standing}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
