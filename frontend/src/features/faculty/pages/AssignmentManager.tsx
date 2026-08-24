import { useQuery } from '@tanstack/react-query'
import { fetchAssignments } from '@/api/assignments.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { FileText, Calendar, Plus, CheckCircle2 } from 'lucide-react'

export function AssignmentManager() {
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
  })

  return (
    <>
      <PageHeader label="Coursework Management" title="Assignment Manager" />

      <div className="mt-5 flex justify-between items-center">
        <h2 className="text-base font-bold text-gray-900">Active Course Assignments</h2>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Create New Assignment
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No active assignments found.</div>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 uppercase">
                      {assignment.course_code || 'COURSE'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                      <Calendar className="w-3.5 h-3.5" /> Due Date
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{new Date(assignment.due_at).toLocaleDateString()}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">Max Points</div>
                    <div className="text-sm font-semibold text-indigo-600">{assignment.points} pts</div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
