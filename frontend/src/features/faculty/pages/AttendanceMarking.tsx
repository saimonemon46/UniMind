import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
  BookOpen,
  Calendar,
  Users,
  AlertCircle,
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

interface AttendanceRecord {
  id: number
  course: number
  student: number
  class_date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
}

interface Envelope<T> {
  data: T
}

export function AttendanceMarking() {
  const queryClient = useQueryClient()
  const [courseId, setCourseId] = useState('')
  const [classDate, setClassDate] = useState(new Date().toISOString().slice(0, 10))
  const [statuses, setStatuses] = useState<Record<number, { status: string; recordId?: number }>>({})
  const [studentSearch, setStudentSearch] = useState('')

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => (await apiClient.get<Envelope<Course[]>>('/courses/')).data.data,
  })

  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['course-students', courseId],
    queryFn: async () => (await apiClient.get<Envelope<Student[]>>(`/courses/${courseId}/students/`)).data.data,
    enabled: Boolean(courseId),
  })

  // Fetch all attendance records for this course to construct history and pre-fill existing marks
  const { data: courseRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ['course-attendance', courseId],
    queryFn: async () => {
      const res = await apiClient.get<Envelope<AttendanceRecord[]>>(`/attendance/course/${courseId}/`)
      return res.data.data || res.data || []
    },
    enabled: Boolean(courseId),
  })

  // Dynamically extract unique class dates that already have attendance records
  const historyDates = Array.from(
    new Set(courseRecords.map((r) => r.class_date))
  ).sort((a, b) => b.localeCompare(a))

  // Initialize and synchronize roster statuses when students, date, or history records load
  useEffect(() => {
    if (students && students.length > 0) {
      const initial: Record<number, { status: string; recordId?: number }> = {}
      
      // 1. Default all students to present
      students.forEach((student) => {
        initial[student.id] = { status: 'present' }
      })

      // 2. Overwrite with any existing attendance records for the selected date
      const dayRecords = courseRecords.filter((r) => r.class_date === classDate)
      dayRecords.forEach((record) => {
        initial[record.student] = { status: record.status, recordId: record.id }
      })

      setStatuses(initial)
    } else {
      setStatuses({})
    }
  }, [students, courseRecords, classDate])

  // Save or update attendance records
  const submit = useMutation({
    mutationFn: async () => {
      const requests = students.map((student) => {
        const item = statuses[student.id] ?? { status: 'present' }
        if (item.recordId) {
          // If record already exists, perform update (PUT)
          return apiClient.put(`/attendance/${item.recordId}/`, {
            course: Number(courseId),
            student: student.id,
            class_date: classDate,
            status: item.status,
          })
        } else {
          // If no record exists, perform creation (POST)
          return apiClient.post('/attendance/', {
            course: Number(courseId),
            student: student.id,
            class_date: classDate,
            status: item.status,
          })
        }
      })
      return Promise.all(requests)
    },
    onSuccess: () => {
      // Invalidate queries to fetch the updated history/records immediately
      queryClient.invalidateQueries({ queryKey: ['course-attendance', courseId] })
    },
  })

  // Quick mark actions
  const handleMarkAll = (status: string) => {
    const updated = { ...statuses }
    students.forEach((s) => {
      const existing = updated[s.id] || {}
      updated[s.id] = { ...existing, status }
    })
    setStatuses(updated)
  }

  // Filter students based on search input
  const filteredStudents = students.filter((s) => {
    const search = studentSearch.toLowerCase()
    return (
      (s.full_name || '').toLowerCase().includes(search) ||
      (s.username || '').toLowerCase().includes(search)
    )
  })

  // Dynamic Count Summaries
  const totalCount = students.length
  const presentCount = students.filter((s) => (statuses[s.id]?.status ?? 'present') === 'present').length
  const absentCount = students.filter((s) => statuses[s.id]?.status === 'absent').length
  const lateCount = students.filter((s) => statuses[s.id]?.status === 'late').length
  const excusedCount = students.filter((s) => statuses[s.id]?.status === 'excused').length

  const hasExistingRecordsForDay = courseRecords.some((r) => r.class_date === classDate)

  const todayStr = new Date().toLocaleDateString('en-CA')
  const isFutureDate = classDate > todayStr

  return (
    <>
      <PageHeader label="Course delivery" title="Take Attendance" />
      <p className="mb-6 mt-2 text-sm text-gray-500 font-sans">
        Select an active course section, verify the class session date, and record student attendance.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Left Column: Selection controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Session Parameters
            </h3>
            
            <div className="space-y-4">
              {/* Course Select */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Select Course Section
                </label>
                <div className="relative">
                  <select
                    value={courseId}
                    onChange={(event) => setCourseId(event.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer appearance-none"
                  >
                    <option value="">Choose a course...</option>
                    {courses.map((course) => (
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

              {/* Class Date Input */}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Class Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={classDate}
                    max={todayStr}
                    onChange={(event) => setClassDate(event.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                {isFutureDate && (
                  <div className="mt-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Future dates are not permitted.
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Dynamic Stats Panel */}
          {courseId && students.length > 0 && (
            <Card className="p-6 bg-slate-50 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Session Stats
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 border border-gray-150 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Present</span>
                  <span className="text-lg font-extrabold text-emerald-600 block">{presentCount}</span>
                </div>
                <div className="bg-white p-3 border border-gray-150 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Absent</span>
                  <span className="text-lg font-extrabold text-red-600 block">{absentCount}</span>
                </div>
                <div className="bg-white p-3 border border-gray-150 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Late</span>
                  <span className="text-lg font-extrabold text-amber-600 block">{lateCount}</span>
                </div>
                <div className="bg-white p-3 border border-gray-150 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Excused</span>
                  <span className="text-lg font-extrabold text-slate-500 block">{excusedCount}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs font-semibold text-gray-500">
                <span>Roster Size</span>
                <span className="text-gray-900 font-bold">{totalCount} Students</span>
              </div>
            </Card>
          )}

          {/* History Panel */}
          {courseId && historyDates.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Attendance History
              </h3>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Select a previous date to load, view, or modify its recorded student statuses:
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {historyDates.map((date) => {
                  const isActive = classDate === date
                  return (
                    <button
                      key={date}
                      onClick={() => setClassDate(date)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border flex justify-between items-center ${
                        isActive
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {date}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        Load
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Roster & Attendance selection */}
        <div className="lg:col-span-2">
          {!courseId ? (
            <div className="h-64 border border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-6 text-gray-400 shadow-sm">
              <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-semibold text-gray-700">No Course Selected</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Please select a course section from the left side panel to view the student roster.
              </p>
            </div>
          ) : isLoadingStudents ? (
            <div className="h-64 border border-gray-150 bg-white rounded-2xl flex items-center justify-center text-sm text-gray-500 shadow-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
              Loading student roster...
            </div>
          ) : students.length === 0 ? (
            <div className="h-64 border border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-6 text-gray-400 shadow-sm">
              <Users className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-semibold text-gray-700">Empty Class Roster</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                There are no students enrolled in this course section.
              </p>
            </div>
          ) : (
            <Card className="p-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students in roster..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50/50"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleMarkAll('present')}
                    className="px-3 py-1.5 border border-emerald-100 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => handleMarkAll('absent')}
                    className="px-3 py-1.5 border border-red-100 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Status Header Bar */}
              <div className="mb-4 bg-slate-50/80 px-4 py-2 rounded-xl flex items-center justify-between text-xs font-bold text-gray-500">
                <span>Roster Listing</span>
                {hasExistingRecordsForDay && (
                  <span className="text-indigo-600 px-2 py-0.5 bg-indigo-50 border border-indigo-150 rounded-md">
                    Editing Saved Records
                  </span>
                )}
              </div>

              {/* Students List */}
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-400">
                    No students match "{studentSearch}"
                  </div>
                ) : (
                  filteredStudents.map((student) => {
                    const currentStatus = statuses[student.id]?.status ?? 'present'
                    
                    return (
                      <div
                        key={student.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 hover:bg-slate-50/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {student.full_name ? student.full_name.split(' ').map((n: string) => n[0]).join('') : student.username[0]}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">
                              {student.full_name || student.username}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">@{student.username}</span>
                          </div>
                        </div>

                        {/* Status Pills */}
                        <div className="flex items-center gap-1.5">
                          {/* Present Pill */}
                          <button
                            type="button"
                            onClick={() => setStatuses({
                              ...statuses,
                              [student.id]: { ...(statuses[student.id] || {}), status: 'present' }
                            })}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                                : 'bg-slate-50 border-transparent text-gray-400 hover:bg-slate-100 hover:text-gray-600'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Present
                          </button>

                          {/* Absent Pill */}
                          <button
                            type="button"
                            onClick={() => setStatuses({
                              ...statuses,
                              [student.id]: { ...(statuses[student.id] || {}), status: 'absent' }
                            })}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                                : 'bg-slate-50 border-transparent text-gray-400 hover:bg-slate-100 hover:text-gray-600'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Absent
                          </button>

                          {/* Late Pill */}
                          <button
                            type="button"
                            onClick={() => setStatuses({
                              ...statuses,
                              [student.id]: { ...(statuses[student.id] || {}), status: 'late' }
                            })}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                              currentStatus === 'late'
                                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                                : 'bg-slate-50 border-transparent text-gray-400 hover:bg-slate-100 hover:text-gray-600'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Late
                          </button>

                          {/* Excused Pill */}
                          <button
                            type="button"
                            onClick={() => setStatuses({
                              ...statuses,
                              [student.id]: { ...(statuses[student.id] || {}), status: 'excused' }
                            })}
                            className={`px-3 py-1.5 border rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                              currentStatus === 'excused'
                                ? 'bg-slate-150 border-slate-350 text-slate-700 shadow-sm'
                                : 'bg-slate-50 border-transparent text-gray-400 hover:bg-slate-100 hover:text-gray-600'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Excused
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Submit panel */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  Please verify statuses before submitting.
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button
                    onClick={() => submit.mutate()}
                    disabled={submit.isPending || !students.length || isFutureDate}
                    className="w-full sm:w-auto"
                  >
                    {submit.isPending ? 'Saving...' : hasExistingRecordsForDay ? 'Update Saved Attendance' : 'Submit Attendance'}
                  </Button>
                  {submit.isSuccess && (
                    <span className="text-sm font-bold text-emerald-600">
                      Saved successfully!
                    </span>
                  )}
                  {submit.isError && (
                    <span className="text-sm font-bold text-red-600">
                      Error: Failed to save.
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
