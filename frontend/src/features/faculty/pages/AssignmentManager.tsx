import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { fetchAssignments, fetchSubmissions, Assignment, Submission } from '@/api/assignments.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import {
  FileText,
  Calendar,
  Plus,
  ChevronLeft,
  CheckCircle2,
  Clock,
  X,
  Search,
  AlertCircle,
  Award,
  BookOpen,
  Users,
  RefreshCw
} from 'lucide-react'

interface Course {
  id: number
  code: string
  title: string
}

interface Student {
  id: number
  full_name: string
  username: string
}

interface Envelope<T> {
  data: T
}

export function AssignmentManager() {
  const queryClient = useQueryClient()
  const [courseId, setCourseId] = useState('')
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null)
  
  // Create Assignment Modal Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createDue, setCreateDue] = useState('')
  const [createPoints, setCreatePoints] = useState('100')
  const [createCourseId, setCreateCourseId] = useState('')

  // Grading Modal Form State
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [gradingStudentName, setGradingStudentName] = useState('')

  // Query Courses
  const courses = useQuery({
    queryKey: ['courses'],
    queryFn: async () => (await apiClient.get<Envelope<Course[]>>('/courses/')).data.data,
  })

  // Query Assignments
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery<Assignment[]>({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
  })

  // Query Submissions
  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: fetchSubmissions,
  })

  // Query students for the active course section to build roster
  const { data: courseStudents = [] } = useQuery<Student[]>({
    queryKey: ['course-students', courseId],
    queryFn: async () => (await apiClient.get<Envelope<Student[]>>(`/courses/${courseId}/students/`)).data.data,
    enabled: Boolean(courseId),
  })

  // Mutations
  const createAssignmentMutation = useMutation({
    mutationFn: async (payload: { course: number; title: string; description: string; due_at: string; points: number }) => {
      return apiClient.post('/assignments/', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      setIsCreateOpen(false)
      setCreateTitle('')
      setCreateDesc('')
      setCreateDue('')
      setCreatePoints('100')
      setCreateCourseId('')
    },
  })

  const gradeSubmissionMutation = useMutation({
    mutationFn: async (payload: { submissionId: number; score: number; feedback: string }) => {
      return apiClient.patch(`/submissions/${payload.submissionId}/grade/`, {
        score: payload.score,
        feedback: payload.feedback,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      setGradingSubmission(null)
      setGradeScore('')
      setGradeFeedback('')
      setGradingStudentName('')
    },
  })

  // Helpers
  const activeCourseId = Number(courseId)
  const filteredAssignments = activeCourseId
    ? assignments.filter((a) => a.course === activeCourseId)
    : assignments

  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId)

  // Calculations for submissions roster of selected assignment
  const assignmentSubmissions = selectedAssignmentId
    ? submissions.filter((sub) => sub.assignment === selectedAssignmentId)
    : []

  const handleOpenCreateModal = () => {
    setCreateCourseId(courseId)
    setIsCreateOpen(true)
  }

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createCourseId || !createTitle || !createDue) return
    createAssignmentMutation.mutate({
      course: Number(createCourseId),
      title: createTitle,
      description: createDesc,
      due_at: new Date(createDue).toISOString(),
      points: Number(createPoints),
    })
  }

  const handleOpenGradeModal = (sub: Submission, studentName: string) => {
    setGradingSubmission(sub)
    setGradingStudentName(studentName)
    setGradeScore(sub.score !== null && sub.score !== undefined ? String(sub.score) : '')
    setGradeFeedback(sub.feedback || '')
  }

  const handleGradeSubmission = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gradingSubmission) return
    const scoreVal = Number(gradeScore)
    const maxPoints = selectedAssignment ? Number(selectedAssignment.points) : 100
    if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > maxPoints) {
      alert(`Score must be between 0 and ${maxPoints}`)
      return
    }

    gradeSubmissionMutation.mutate({
      submissionId: gradingSubmission.id,
      score: scoreVal,
      feedback: gradeFeedback,
    })
  }

  return (
    <>
      <PageHeader label="Coursework Management" title="Assignment Manager" />

      {/* Assignment Detail Panel Mode */}
      {selectedAssignmentId && selectedAssignment ? (
        <div className="space-y-6 font-sans">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedAssignmentId(null)}
              className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Assignment Details
              </span>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {selectedAssignment.title}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Card: Info Summary */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Parameters
                </h3>
                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">
                      Course Code
                    </span>
                    <span className="font-bold text-gray-900 uppercase">
                      {selectedAssignment.course_code || 'COURSE'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">
                      Maximum Points
                    </span>
                    <span className="font-bold text-indigo-600 font-mono">
                      {selectedAssignment.points} Points
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">
                      Due Date
                    </span>
                    <span className="font-bold text-gray-800 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(selectedAssignment.due_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedAssignment.description && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-1">
                        Instruction Summary
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-gray-100">
                        {selectedAssignment.description}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Card: Submissions Roster */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Student Submissions
                </h3>

                {/* Submissions Table/List */}
                {courseStudents.length === 0 ? (
                  <div className="h-48 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-gray-400 shadow-sm bg-white">
                    <Users className="w-10 h-10 mb-2 text-gray-300" />
                    <p className="font-bold text-gray-700 text-sm">No Enrolled Students</p>
                    <p className="text-xs text-gray-400 max-w-xs mt-0.5">
                      Ensure the correct course section filter was selected to load enrolled students.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-150">
                          <th className="px-4 py-3">Student Info</th>
                          <th className="px-4 py-3 text-center">Submission Status</th>
                          <th className="px-4 py-3 text-center">Score obtained</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {courseStudents.map((student) => {
                          const sub = assignmentSubmissions.find((s) => s.student === student.id)
                          const status = sub ? sub.status : 'pending'
                          const score = sub && sub.score !== null ? `${sub.score}/${selectedAssignment.points}` : '—'
                          
                          return (
                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-bold text-gray-900">{student.full_name || student.username}</div>
                                <div className="text-[9px] text-gray-400 font-mono">@{student.username}</div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {status === 'graded' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Graded
                                  </span>
                                ) : status === 'submitted' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 border border-blue-200 text-blue-700">
                                    <Clock className="w-3 h-3 text-blue-600 animate-pulse" /> Submitted
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-50 border border-gray-200 text-gray-400">
                                    <Clock className="w-3 h-3 text-gray-300" /> Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-gray-700">
                                {score}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {sub ? (
                                  <button
                                    onClick={() => handleOpenGradeModal(sub, student.full_name || student.username)}
                                    className="px-2.5 py-1.5 border border-indigo-200 hover:bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm"
                                  >
                                    {status === 'graded' ? 'Modify Grade' : 'Grade Submission'}
                                  </button>
                                ) : (
                                  <span className="text-gray-300 text-xs font-semibold select-none">—</span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Course Assignment Listing Mode */
        <div className="space-y-6 font-sans">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-5 border border-gray-150 rounded-2xl shadow-sm">
            {/* Course Filter Selector */}
            <div className="flex-1 max-w-sm">
              <label className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider mb-1.5">
                Filter by Course
              </label>
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-xs bg-slate-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer appearance-none"
                >
                  <option value="">All Course Sections</option>
                  {(courses.data ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} · {course.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md self-end sm:self-center"
            >
              <Plus className="w-4 h-4" /> Create Assignment
            </button>
          </div>

          {/* Grid list */}
          <div className="grid gap-4">
            {loadingAssignments ? (
              <div className="py-12 border border-gray-150 bg-white rounded-2xl flex items-center justify-center text-sm text-gray-500 shadow-sm">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
                Loading assignments...
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="h-64 border border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-6 text-gray-400 shadow-sm">
                <Award className="w-12 h-12 mb-3 text-gray-300" />
                <p className="font-bold text-gray-700">No Assignments Found</p>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  There are no assignments posted for this section. Click the button above to publish one.
                </p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => {
                const subCount = submissions.filter((s) => s.assignment === assignment.id).length
                const gradedCount = submissions.filter((s) => s.assignment === assignment.id && s.status === 'graded').length
                
                return (
                  <Card key={assignment.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-50 border border-indigo-150 text-indigo-700 uppercase tracking-wider">
                            {assignment.course_code || 'COURSE'}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-gray-900 leading-snug">{assignment.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-xl truncate">{assignment.description}</p>

                        <div className="flex items-center gap-4 mt-3.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> Due: {new Date(assignment.due_at).toLocaleDateString()}
                          </span>
                          <span className="font-bold text-indigo-600">Points: {assignment.points} pts</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 self-stretch justify-between md:justify-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Submissions</span>
                          <span className="font-bold text-gray-800 text-sm">
                            {subCount} submitted <span className="text-xs text-gray-400">({gradedCount} graded)</span>
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setCourseId(String(assignment.course))
                            setSelectedAssignmentId(assignment.id)
                          }}
                          className="px-3.5 py-2 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 text-gray-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          View Submissions
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {isCreateOpen && (
        <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Assignment">
          <form onSubmit={handleCreateAssignment} className="space-y-4 font-sans text-gray-800">
            {/* Target Course Select */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Target Course Section
              </label>
              <div className="relative">
                <select
                  value={createCourseId}
                  onChange={(e) => setCreateCourseId(e.target.value)}
                  required
                  className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-gray-800 cursor-pointer appearance-none"
                >
                  <option value="">Select course section...</option>
                  {(courses.data ?? []).map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} · {course.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <Input
                label="Assignment Title"
                type="text"
                required
                placeholder="e.g. Midterm Lab Assignment"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Description & Instructions
              </label>
              <textarea
                placeholder="Detail what is expected, formats, files, and rules..."
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                className="w-full min-h-[80px] rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Due Date */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Due Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={createDue}
                  onChange={(e) => setCreateDue(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 bg-slate-50/50 font-bold"
                />
              </div>

              {/* Max Points */}
              <div>
                <Input
                  label="Max Score Points"
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={createPoints}
                  onChange={(e) => setCreatePoints(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="px-4 py-2.5 border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-sm font-bold transition-all"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </button>
              <Button type="submit" disabled={createAssignmentMutation.isPending}>
                {createAssignmentMutation.isPending ? 'Publishing...' : 'Publish Assignment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* GRADING SUBMISSION MODAL */}
      {gradingSubmission && (
        <Modal
          open={Boolean(gradingSubmission)}
          onClose={() => setGradingSubmission(null)}
          title={`Grade Student Submission`}
        >
          <form onSubmit={handleGradeSubmission} className="space-y-4 font-sans text-gray-800">
            {/* Student Info */}
            <div className="bg-slate-50 p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Student</span>
                <span className="text-sm font-bold text-gray-900 block mt-0.5">{gradingStudentName}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Submission Date</span>
                <span className="text-xs font-semibold text-gray-600 block mt-0.5">
                  {new Date(gradingSubmission.submitted_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submission Content Text */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Student Submitted Work
              </label>
              <div className="w-full p-4 bg-slate-50 border border-gray-150 rounded-2xl text-xs leading-relaxed text-gray-700 font-mono overflow-y-auto max-h-[160px] whitespace-pre-wrap">
                {gradingSubmission.content || (
                  <span className="text-gray-400 italic">No content submitted.</span>
                )}
              </div>
              {gradingSubmission.file_url && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attachment:</span>
                  <a
                    href={gradingSubmission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-indigo-700 shadow-sm transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {gradingSubmission.file_url.split('/').pop() || 'Download File'}
                  </a>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 items-end">
              {/* Score Input */}
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Score obtained
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    required
                    min="0"
                    max={selectedAssignment ? Number(selectedAssignment.points) : 100}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    className="w-full text-center rounded-xl border border-gray-200 bg-slate-50/50 px-2 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 font-bold"
                  />
                  <span className="text-xs text-gray-400 ml-2 font-mono shrink-0">
                    / {selectedAssignment?.points}
                  </span>
                </div>
              </div>

              {/* Score limit tooltip alert */}
              <div className="col-span-2 text-[10px] text-gray-400 leading-tight pb-2 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                Score between 0 and {selectedAssignment?.points}
              </div>
            </div>

            {/* Feedback Remarks */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Faculty Feedback Comment
              </label>
              <textarea
                placeholder="Give constructive feedback, tips, or grade explanations..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                className="w-full min-h-[80px] rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="px-4 py-2.5 border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-sm font-bold transition-all"
                onClick={() => setGradingSubmission(null)}
              >
                Cancel
              </button>
              <Button type="submit" disabled={gradeSubmissionMutation.isPending}>
                {gradeSubmissionMutation.isPending ? 'Submitting...' : 'Submit Grade'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
