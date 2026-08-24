import { useQuery } from '@tanstack/react-query'
import { fetchAssignments, fetchSubmissions } from '@/api/assignments.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Calendar, FileCheck, Clock } from 'lucide-react'

export function Assignments() {
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
  })

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions'],
    queryFn: fetchSubmissions,
  })

  const submissionMap = new Map(submissions.map((sub) => [sub.assignment, sub]))

  return (
    <>
      <PageHeader label="Coursework & Tasks" title="Assignments" />

      {loadingAssignments ? (
        <div className="mt-8 text-center text-sm text-gray-500">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="mt-8 text-center text-sm text-gray-500">No active assignments posted.</div>
      ) : (
        <div className="mt-5 space-y-4">
          {assignments.map((assignment) => {
            const submission = submissionMap.get(assignment.id)
            const isGraded = submission?.status === 'graded'
            const isSubmitted = submission?.status === 'submitted' || isGraded

            return (
              <Card key={assignment.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 uppercase tracking-wider mb-2">
                      {assignment.course_code || 'COURSE'}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Due: {new Date(assignment.due_at).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-gray-700">{assignment.points} Points Total</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isGraded ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        Graded ({submission.score} pts)
                      </span>
                    ) : isSubmitted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FileCheck className="w-4 h-4 text-blue-600" />
                        Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Pending Submission
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </>
  )
}
