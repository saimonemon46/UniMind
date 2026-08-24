import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { fetchAssignments, fetchSubmissions, uploadAttachment, Assignment, Submission } from '@/api/assignments.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import {
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Award,
  BookOpen,
  Send,
  AlertCircle,
  FileText
} from 'lucide-react'

interface Course {
  id: number
  code: string
  title: string
}

interface Envelope<T> {
  data: T
}

export function Assignments() {
  const queryClient = useQueryClient()
  const [courseId, setCourseId] = useState('')
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<number | null>(null)
  
  // Submit Modal state
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  // Query Courses (enrolled)
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

  // Mutation to submit assignment work
  const submitWorkMutation = useMutation({
    mutationFn: async (payload: { assignmentId: number; content: string; file_url?: string }) => {
      return apiClient.post(`/assignments/${payload.assignmentId}/submit/`, {
        content: payload.content,
        file_url: payload.file_url || '',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      setSubmittingAssignment(null)
      setSubmissionText('')
      setAttachmentFile(null)
      setAttachmentUrl('')
    },
  })

  // Filter assignments based on selected course
  const activeCourseId = Number(courseId)
  const filteredAssignments = activeCourseId
    ? assignments.filter((a) => a.course === activeCourseId)
    : assignments

  const submissionMap = new Map(submissions.map((sub) => [sub.assignment, sub]))

  const handleOpenSubmitModal = (e: React.MouseEvent, assignment: Assignment) => {
    e.stopPropagation() // Prevent card toggle expansion
    setSubmittingAssignment(assignment)
    setSubmissionText('')
    setAttachmentFile(null)
    setAttachmentUrl('')
    setUploading(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const res = await uploadAttachment(file)
      setAttachmentFile(file)
      setAttachmentUrl(res.file_url)
    } catch (err) {
      console.error('Failed to upload attachment:', err)
      alert('Failed to upload file attachment. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setAttachmentFile(null)
    setAttachmentUrl('')
  }

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault()
    if (!submittingAssignment) return
    if (!submissionText.trim() && !attachmentUrl) return
    submitWorkMutation.mutate({
      assignmentId: submittingAssignment.id,
      content: submissionText,
      file_url: attachmentUrl,
    })
  }

  const toggleExpand = (assignmentId: number) => {
    setExpandedAssignmentId((prev) => (prev === assignmentId ? null : assignmentId))
  }

  return (
    <>
      <PageHeader label="Coursework & Tasks" title="Assignments" />

      <div className="mt-5 space-y-6 font-sans">
        {/* Course Filter Panel */}
        <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="flex-1 max-w-sm">
            <label className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider mb-1.5">
              Filter by Enrolled Course
            </label>
            <div className="relative">
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-xs bg-slate-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer appearance-none"
              >
                <option value="">All Registered Courses</option>
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
        </div>

        {/* Assignments List */}
        <div className="grid gap-4">
          {loadingAssignments ? (
            <div className="py-12 border border-gray-150 bg-white rounded-2xl flex items-center justify-center text-sm text-gray-500 shadow-sm">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading assignments...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="h-64 border border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-6 text-gray-400 shadow-sm">
              <Award className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-bold text-gray-700">No Assignments Posted</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                You have no active assignments for the selected course section.
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => {
              const submission = submissionMap.get(assignment.id)
              const status = submission ? submission.status : 'pending'
              const isExpanded = expandedAssignmentId === assignment.id

              return (
                <Card
                  key={assignment.id}
                  className="p-5 hover:shadow-md transition-shadow cursor-pointer border border-gray-150"
                  onClick={() => toggleExpand(assignment.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-slate-50 border border-gray-250 text-gray-500 uppercase tracking-wider">
                          {assignment.course_code || 'COURSE'}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900 leading-snug flex items-center gap-1">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 max-w-2xl">{assignment.description}</p>

                      <div className="flex items-center gap-4 pt-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" /> Due: {new Date(assignment.due_at).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-gray-700">Points: {assignment.points} pts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      {status === 'graded' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-250 text-emerald-700 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Graded ({submission?.score} pts)
                        </span>
                      ) : status === 'submitted' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-250 text-blue-700 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Submitted
                        </span>
                      ) : (
                        <Button
                          onClick={(e) => handleOpenSubmitModal(e, assignment)}
                          className="px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 shadow-sm shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Work
                        </Button>
                      )}
                      
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Panel: Submission Content & Feedback */}
                  {isExpanded && (
                    <div
                      className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans"
                      onClick={(e) => e.stopPropagation()} // Prevent card toggle collapse when clicking inside details
                    >
                      {/* Left Side: Student Submission Content */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Your Submission
                        </h4>
                        <div className="w-full p-4 bg-slate-50 border border-gray-150 rounded-2xl leading-relaxed text-gray-700 font-mono whitespace-pre-wrap">
                          {submission ? (
                            <div className="space-y-3 font-sans text-xs">
                              {submission.content && <p className="font-mono whitespace-pre-wrap text-gray-700">{submission.content}</p>}
                              {submission.file_url && (
                                <div className="pt-2.5 border-t border-gray-200/60 flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attachment:</span>
                                  <a
                                    href={submission.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-indigo-700 shadow-sm transition-all"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    {submission.file_url.split('/').pop() || 'Download File'}
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No work has been submitted yet.</span>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Faculty Grading & Feedback details */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Grade & Feedback
                        </h4>
                        
                        {status === 'graded' && submission ? (
                          <div className="bg-slate-50 border border-gray-150 p-4 rounded-2xl space-y-3.5">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Score Obtained</span>
                                <span className="text-base font-extrabold text-indigo-700 font-mono mt-0.5 block">
                                  {submission.score} / {assignment.points} points
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Graded By</span>
                                <span className="text-xs font-bold text-gray-800 mt-0.5 block">
                                  {submission.graded_by_name || 'Faculty Advisor'}
                                </span>
                              </div>
                            </div>
                            
                            {submission.feedback && (
                              <div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Faculty Comments</span>
                                <p className="text-xs text-gray-600 leading-normal bg-white p-2.5 rounded-xl border border-gray-100 font-sans">
                                  {submission.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : status === 'submitted' ? (
                          <div className="p-4 bg-slate-50 border border-gray-150 rounded-2xl flex items-center gap-2 text-gray-500 font-semibold">
                            <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />
                            Your submission is currently waiting to be reviewed and graded by the instructor.
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 border border-gray-150 rounded-2xl flex items-center gap-2 text-gray-400">
                            <AlertCircle className="w-4 h-4 text-gray-300" />
                            Please submit your coursework response to receive scores and constructive feedback.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* SUBMIT WORK MODAL */}
      {submittingAssignment && (
        <Modal
          open={Boolean(submittingAssignment)}
          onClose={() => setSubmittingAssignment(null)}
          title="Submit Assignment Response"
        >
          <form onSubmit={handleSubmitWork} className="space-y-4 font-sans text-gray-800">
            {/* Context parameters */}
            <div className="bg-slate-50 p-4 border border-gray-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Maximum Score</span>
                <span className="text-sm font-extrabold text-indigo-700 block mt-0.5">
                  {submittingAssignment.points} Points
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Due Date Deadline</span>
                <span className="text-xs font-semibold text-rose-600 block mt-0.5">
                  {new Date(submittingAssignment.due_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Instruction Summary */}
            {submittingAssignment.description && (
              <div className="p-3.5 bg-slate-50 border border-gray-150 rounded-2xl">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Task Instructions
                </span>
                <p className="text-xs text-gray-600 leading-normal">{submittingAssignment.description}</p>
              </div>
            )}

            {/* Textarea submission content */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Your coursework submission content
              </label>
              <textarea
                required={!attachmentUrl}
                placeholder="Type or paste your completed assignment solution here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="w-full min-h-[160px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 bg-slate-50/50 font-mono"
              />
            </div>

            {/* File attachment */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Upload File Attachment
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="attachment-file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="attachment-file"
                  className="px-4 py-2 border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  {attachmentFile ? 'Change File' : 'Choose File'}
                </label>
                {attachmentFile && (
                  <div className="flex items-center gap-2 bg-slate-50 border border-gray-150 px-3 py-1.5 rounded-xl text-xs">
                    <span className="font-semibold text-gray-750 truncate max-w-[200px]">
                      {attachmentFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-sm leading-none"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
              {uploading && (
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider animate-pulse mt-1.5">Uploading attachment...</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                className="px-4 py-2.5 border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-sm font-bold transition-all"
                onClick={() => setSubmittingAssignment(null)}
              >
                Cancel
              </button>
              <Button type="submit" disabled={submitWorkMutation.isPending}>
                {submitWorkMutation.isPending ? 'Submitting...' : 'Submit Work'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
