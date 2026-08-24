import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Award,
  BookOpen,
  Search,
  Users,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Percent,
  CheckCircle,
  Printer,
  FileText
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

interface GradeRecord {
  id: number
  student: number
  course: number
  percentage: number
  letter: string
  points: number
  remarks?: string
}

interface Envelope<T> {
  data: T
}

function gradeFromPercentage(value: number) {
  if (value >= 80) return ['A+', 4.00]
  if (value >= 75) return ['A', 3.75]
  if (value >= 70) return ['A-', 3.50]
  if (value >= 65) return ['B+', 3.25]
  if (value >= 60) return ['B', 3.00]
  if (value >= 55) return ['B-', 2.75]
  if (value >= 50) return ['C+', 2.50]
  if (value >= 45) return ['C', 2.25]
  if (value >= 40) return ['D', 2.00]
  return ['F', 0.00]
}

function getGradeBadgeStyle(letter: string) {
  if (['A+', 'A', 'A-'].includes(letter)) {
    return 'bg-emerald-50 border-emerald-250 text-emerald-700'
  }
  if (['B+', 'B', 'B-'].includes(letter)) {
    return 'bg-indigo-50 border-indigo-250 text-indigo-700'
  }
  if (['C+', 'C', 'D'].includes(letter)) {
    return 'bg-amber-50 border-amber-250 text-amber-700'
  }
  return 'bg-rose-50 border-rose-200 text-rose-700'
}

export function GradeEntry() {
  const queryClient = useQueryClient()
  const [courseId, setCourseId] = useState('')
  const [viewMode, setViewMode] = useState<'entry' | 'report'>('entry')
  const [marks, setMarks] = useState<Record<number, {
    finalExam: string
    midTerm: string
    classTest: string
    assignment: string
    attendance: string
    recordId?: number
  }>>({})
  const [studentSearch, setStudentSearch] = useState('')

  const courses = useQuery({
    queryKey: ['courses'],
    queryFn: async () => (await apiClient.get<Envelope<Course[]>>('/courses/')).data.data,
  })

  const students = useQuery({
    queryKey: ['course-students', courseId],
    queryFn: async () => (await apiClient.get<Envelope<Student[]>>(`/courses/${courseId}/students/`)).data.data,
    enabled: Boolean(courseId),
  })

  // Fetch all grades for history and matching
  const allGrades = useQuery<GradeRecord[]>({
    queryKey: ['all-grades'],
    queryFn: async () => {
      const res = await apiClient.get<Envelope<GradeRecord[]>>('/grades/')
      return res.data.data || res.data || []
    },
  })

  // Load existing grade records when students or grades change
  useEffect(() => {
    if (students.data && students.data.length > 0 && allGrades.data) {
      const initial: Record<number, {
        finalExam: string
        midTerm: string
        classTest: string
        assignment: string
        attendance: string
        recordId?: number
      }> = {}
      
      // Default to empty
      students.data.forEach((student) => {
        initial[student.id] = {
          finalExam: '',
          midTerm: '',
          classTest: '',
          assignment: '',
          attendance: '',
        }
      })

      // Pre-fill existing grades for this course
      const courseGrades = allGrades.data.filter((g) => g.course === Number(courseId))
      courseGrades.forEach((record) => {
        let parsed = { finalExam: '', midTerm: '', classTest: '', assignment: '', attendance: '' }
        try {
          if (record.remarks) {
            const parsedRemarks = JSON.parse(record.remarks)
            parsed = {
              finalExam: parsedRemarks.finalExam !== undefined ? String(parsedRemarks.finalExam) : '',
              midTerm: parsedRemarks.midTerm !== undefined ? String(parsedRemarks.midTerm) : '',
              classTest: parsedRemarks.classTest !== undefined ? String(parsedRemarks.classTest) : '',
              assignment: parsedRemarks.assignment !== undefined ? String(parsedRemarks.assignment) : '',
              attendance: parsedRemarks.attendance !== undefined ? String(parsedRemarks.attendance) : '',
            }
          }
        } catch {
          // Fallback if parsing fails (legacy records)
        }

        // Fallback: if we have a percentage but no component scores, default the percentage to Final Exam
        if (!parsed.finalExam && !parsed.midTerm && !parsed.classTest && !parsed.assignment && !parsed.attendance && record.percentage !== null) {
          parsed.finalExam = String(record.percentage)
        }

        initial[record.student] = {
          ...parsed,
          recordId: record.id,
        }
      })

      setMarks(initial)
    } else {
      setMarks({})
    }
  }, [students.data, allGrades.data, courseId])

  const save = useMutation({
    mutationFn: async () => {
      const activeStudents = students.data ?? []
      const requests = activeStudents
        .filter((student) => {
          const item = marks[student.id]
          return (
            item &&
            (item.finalExam !== '' ||
              item.midTerm !== '' ||
              item.classTest !== '' ||
              item.assignment !== '' ||
              item.attendance !== '')
          )
        })
        .map((student) => {
          const item = marks[student.id]
          const finalVal = Number(item.finalExam || '0')
          const midVal = Number(item.midTerm || '0')
          const testVal = Number(item.classTest || '0')
          const assignmentVal = Number(item.assignment || '0')
          const attendanceVal = Number(item.attendance || '0')

          // Calculate weighted total out of 100
          const percentage = Number(
            ((finalVal * 0.50) +
             (midVal * 0.25) +
             (testVal * 0.10) +
             (assignmentVal * 0.10) +
             (attendanceVal * 0.05)).toFixed(2)
          )

          const [letter, points] = gradeFromPercentage(percentage)
          
          const payload = {
            course: Number(courseId),
            student: student.id,
            percentage,
            letter,
            points,
            remarks: JSON.stringify({
              finalExam: item.finalExam,
              midTerm: item.midTerm,
              classTest: item.classTest,
              assignment: item.assignment,
              attendance: item.attendance,
            }),
          }

          if (item.recordId) {
            // Update existing (PUT)
            return apiClient.put(`/grades/${item.recordId}/`, payload)
          } else {
            // Create new (POST)
            return apiClient.post('/grades/', payload)
          }
        })
      return Promise.all(requests)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-grades'] })
    },
  })

  const updateMark = (studentId: number, field: keyof typeof marks[number], value: string) => {
    if (value !== '') {
      const num = Number(value)
      if (isNaN(num) || num < 0 || num > 100) {
        return // Reject if not between 0 and 100
      }
    }
    setMarks((prev) => {
      const current = prev[studentId] || { finalExam: '', midTerm: '', classTest: '', assignment: '', attendance: '' }
      return {
        ...prev,
        [studentId]: {
          ...current,
          [field]: value
        }
      }
    })
  }

  // Filter students based on search
  const filteredStudents = (students.data ?? []).filter((s) => {
    const search = studentSearch.toLowerCase()
    return (
      s.full_name?.toLowerCase().includes(search) ||
      s.username?.toLowerCase().includes(search)
    )
  })

  // Analytics helper calculations
  const calculatedPercentages = (students.data ?? [])
    .map((s) => {
      const item = marks[s.id]
      if (!item) return null
      if (
        item.finalExam === '' &&
        item.midTerm === '' &&
        item.classTest === '' &&
        item.assignment === '' &&
        item.attendance === ''
      ) {
        return null
      }
      const finalVal = Number(item.finalExam || '0')
      const midVal = Number(item.midTerm || '0')
      const testVal = Number(item.classTest || '0')
      const assignmentVal = Number(item.assignment || '0')
      const attendanceVal = Number(item.attendance || '0')
      return (finalVal * 0.50) + (midVal * 0.25) + (testVal * 0.10) + (assignmentVal * 0.10) + (attendanceVal * 0.05)
    })
    .filter((v): v is number => v !== null)

  const hasCalculatedMarks = calculatedPercentages.length > 0
  const averageMark = hasCalculatedMarks
    ? Math.round(calculatedPercentages.reduce((a, b) => a + b, 0) / calculatedPercentages.length)
    : 0

  const passRate = hasCalculatedMarks
    ? Math.round((calculatedPercentages.filter((m) => m >= 40).length / calculatedPercentages.length) * 100)
    : 0

  // Count by grade bands
  const gradeBands = { A: 0, B: 0, C_D: 0, F: 0 }
  calculatedPercentages.forEach((m) => {
    const [letter] = gradeFromPercentage(m)
    if (['A+', 'A', 'A-'].includes(letter)) gradeBands.A++
    else if (['B+', 'B', 'B-'].includes(letter)) gradeBands.B++
    else if (['C+', 'C', 'D'].includes(letter)) gradeBands.C_D++
    else gradeBands.F++
  })

  const hasExistingRecords = (students.data ?? []).some((s) => marks[s.id]?.recordId !== undefined)

  return (
    <>
      <PageHeader label="Assessment" title="Grade Entry" />
      <p className="mb-6 mt-2 text-sm text-gray-500 font-sans">
        Enter final marks for each section out of 100. Total mark and grade are auto-calculated (Final Exam 50%, Mid Term 25%, Class Test 10%, Assignment 10%, Attendance 5%).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Left Column: Course Select & Analytics */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Course Section
            </h3>

            {/* Course Select */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Select Course
              </label>
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50/50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer appearance-none"
                >
                  <option value="">Choose a course...</option>
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
          </Card>

          {/* Analytics Summary */}
          {courseId && (students.data ?? []).length > 0 && (
            <Card className="p-6 bg-slate-50 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Performance Metrics
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white p-3 border border-gray-150 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Percent className="w-3 h-3 text-indigo-500" /> Class Avg
                  </span>
                  <span className="text-lg font-extrabold text-indigo-700 block mt-1">
                    {hasCalculatedMarks ? `${averageMark}%` : '—'}
                  </span>
                </div>
                <div className="bg-white p-3 border border-gray-150 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Pass Rate
                  </span>
                  <span className={`text-lg font-extrabold block mt-1 ${passRate >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {hasCalculatedMarks ? `${passRate}%` : '—'}
                  </span>
                </div>
              </div>

              {/* Band breakdown list */}
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                Grade Distribution
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Excellent (A range)
                  </span>
                  <span className="font-bold text-gray-900">{gradeBands.A} students</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" /> Good (B range)
                  </span>
                  <span className="font-bold text-gray-900">{gradeBands.B} students</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Satisfactory (C/D range)
                  </span>
                  <span className="font-bold text-gray-900">{gradeBands.C_D} students</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Failing (F range)
                  </span>
                  <span className="font-bold text-rose-600">{gradeBands.F} students</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Student Mark Entry */}
        <div className="lg:col-span-2">
          {!courseId ? (
            <div className="h-64 border border-dashed border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-center p-6 text-gray-400 shadow-sm">
              <Award className="w-12 h-12 mb-3 text-gray-300" />
              <p className="font-semibold text-gray-700">No Course Selected</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">
                Please select a course section from the left side panel to load student records.
              </p>
            </div>
          ) : students.isLoading ? (
            <div className="h-64 border border-gray-150 bg-white rounded-2xl flex items-center justify-center text-sm text-gray-500 shadow-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
              Loading student records...
            </div>
          ) : (students.data ?? []).length === 0 ? (
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

                <div className="flex flex-wrap items-center gap-3 justify-between sm:justify-end">
                  {hasExistingRecords && viewMode === 'entry' && (
                    <span className="text-indigo-600 px-3 py-1 bg-indigo-50 border border-indigo-150 rounded-xl text-xs font-bold shadow-sm">
                      Modifying Existing Grades
                    </span>
                  )}
                  
                  {/* Segmented Control */}
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setViewMode('entry')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                        viewMode === 'entry'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Grade Entry
                    </button>
                    <button
                      onClick={() => setViewMode('report')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                        viewMode === 'report'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <FileText className="w-3 h-3" /> Grade Report
                    </button>
                  </div>

                  {viewMode === 'report' && (
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  )}
                </div>
              </div>

              {viewMode === 'report' ? (
                <div className="space-y-6 print:p-6" id="grade-report-view">
                  {/* Header section (only shows in report mode) */}
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-base font-extrabold text-gray-900 tracking-tight">Academic Grade Report</h2>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Course Code: {courses.data?.find((c) => c.id === Number(courseId))?.code || 'N/A'}
                        </p>
                        <p className="text-xs font-bold text-gray-600 mt-1">
                          Course Title: {courses.data?.find((c) => c.id === Number(courseId))?.title || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Generated On</span>
                        <span className="text-[10px] font-bold text-gray-900 font-mono">
                          {new Date().toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid stats for the report */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 border border-gray-150 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Enrolled Students</span>
                      <span className="text-lg font-extrabold text-gray-900 block mt-0.5">{(students.data ?? []).length}</span>
                    </div>
                    <div className="bg-slate-50 p-3 border border-gray-150 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Average Score</span>
                      <span className="text-lg font-extrabold text-indigo-700 block mt-0.5">{hasCalculatedMarks ? `${averageMark}%` : '—'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 border border-gray-150 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Pass Rate</span>
                      <span className="text-lg font-extrabold text-emerald-600 block mt-0.5">{hasCalculatedMarks ? `${passRate}%` : '—'}</span>
                    </div>
                    <div className="bg-slate-50 p-3 border border-gray-150 rounded-xl">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">High / Low</span>
                      <span className="text-xs font-extrabold text-gray-900 block mt-1">
                        {hasCalculatedMarks ? `${Math.max(...calculatedPercentages)}% / ${Math.min(...calculatedPercentages)}%` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Report Table */}
                  <div className="overflow-x-auto border border-gray-150 rounded-xl">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-150">
                          <th className="px-3 py-2.5">Student Name</th>
                          <th className="px-2 py-2.5 text-center font-mono">Final (50)</th>
                          <th className="px-2 py-2.5 text-center font-mono">Mid (25)</th>
                          <th className="px-2 py-2.5 text-center font-mono">Test (10)</th>
                          <th className="px-2 py-2.5 text-center font-mono">Assign (10)</th>
                          <th className="px-2 py-2.5 text-center font-mono">Attend (5)</th>
                          <th className="px-3 py-2.5 text-center">Total Score</th>
                          <th className="px-3 py-2.5 text-center">Grade</th>
                          <th className="px-3 py-2.5 text-center">GPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-3 py-6 text-center text-gray-400">
                              No students match "{studentSearch}"
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student) => {
                            const studentMarks = marks[student.id] || { finalExam: '', midTerm: '', classTest: '', assignment: '', attendance: '' }
                            
                            const finalVal = Number(studentMarks.finalExam || '0')
                            const midVal = Number(studentMarks.midTerm || '0')
                            const testVal = Number(studentMarks.classTest || '0')
                            const assignmentVal = Number(studentMarks.assignment || '0')
                            const attendanceVal = Number(studentMarks.attendance || '0')

                            const calculatedTotal = Number(
                              ((finalVal * 0.50) +
                               (midVal * 0.25) +
                               (testVal * 0.10) +
                               (assignmentVal * 0.10) +
                               (attendanceVal * 0.05)).toFixed(2)
                            )

                            const isAnyMarkEntered =
                              studentMarks.finalExam !== '' ||
                              studentMarks.midTerm !== '' ||
                              studentMarks.classTest !== '' ||
                              studentMarks.assignment !== '' ||
                              studentMarks.attendance !== ''

                            const [letter, points] = isAnyMarkEntered ? gradeFromPercentage(calculatedTotal) : ['—', null]

                            return (
                              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-2">
                                  <div className="font-bold text-gray-900">{student.full_name || student.username}</div>
                                  <div className="text-[9px] text-gray-400 font-mono">@{student.username}</div>
                                </td>
                                <td className="px-2 py-2 text-center font-mono text-gray-600">{studentMarks.finalExam || '0'}</td>
                                <td className="px-2 py-2 text-center font-mono text-gray-600">{studentMarks.midTerm || '0'}</td>
                                <td className="px-2 py-2 text-center font-mono text-gray-600">{studentMarks.classTest || '0'}</td>
                                <td className="px-2 py-2 text-center font-mono text-gray-600">{studentMarks.assignment || '0'}</td>
                                <td className="px-2 py-2 text-center font-mono text-gray-600">{studentMarks.attendance || '0'}</td>
                                <td className="px-3 py-2 text-center font-extrabold text-indigo-700">
                                  {isAnyMarkEntered ? `${calculatedTotal}%` : '—'}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {isAnyMarkEntered ? (
                                    <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-extrabold border ${getGradeBadgeStyle(String(letter))}`}>
                                      {letter}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300 font-bold">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center font-bold text-gray-700">
                                  {points !== null ? points.toFixed(2) : '—'}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest pt-2">
                    End of Grade Report
                  </div>
                </div>
              ) : (
                <>
                  {/* Responsive Scrollable Container */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[700px]">
                      {/* Roster header */}
                      <div className="grid grid-cols-[1.2fr_68px_68px_68px_68px_68px_68px_76px] gap-2 mb-3 bg-slate-50/80 px-4 py-2.5 rounded-xl text-[10px] font-bold text-gray-500 items-center justify-items-center">
                        <span className="justify-self-start">Student Info</span>
                        <span>Final (50)</span>
                        <span>Mid (25)</span>
                        <span>Test (10)</span>
                        <span>Assign (10)</span>
                        <span>Attend (5)</span>
                        <span>Total %</span>
                        <span>Grade</span>
                      </div>

                      {/* Student Entry Rows */}
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                        {filteredStudents.length === 0 ? (
                          <div className="text-center py-8 text-xs text-gray-400">
                            No students match "{studentSearch}"
                          </div>
                        ) : (
                          filteredStudents.map((student) => {
                            const studentMarks = marks[student.id] || { finalExam: '', midTerm: '', classTest: '', assignment: '', attendance: '' }
                            
                            const finalVal = Number(studentMarks.finalExam || '0')
                            const midVal = Number(studentMarks.midTerm || '0')
                            const testVal = Number(studentMarks.classTest || '0')
                            const assignmentVal = Number(studentMarks.assignment || '0')
                            const attendanceVal = Number(studentMarks.attendance || '0')

                            const calculatedTotal = Number(
                              ((finalVal * 0.50) +
                               (midVal * 0.25) +
                               (testVal * 0.10) +
                               (assignmentVal * 0.10) +
                               (attendanceVal * 0.05)).toFixed(2)
                            )

                            const isAnyMarkEntered =
                              studentMarks.finalExam !== '' ||
                              studentMarks.midTerm !== '' ||
                              studentMarks.classTest !== '' ||
                              studentMarks.assignment !== '' ||
                              studentMarks.attendance !== ''

                            const [letter, points] = isAnyMarkEntered ? gradeFromPercentage(calculatedTotal) : ['—', null]
                            
                            return (
                              <div
                                key={student.id}
                                className="grid grid-cols-[1.2fr_68px_68px_68px_68px_68px_68px_76px] gap-2 p-3 border border-gray-100 rounded-2xl hover:border-gray-200 hover:bg-slate-50/30 transition-colors items-center justify-items-center"
                              >
                                {/* Student Details */}
                                <div className="flex items-center gap-2 min-w-0 justify-self-start">
                                  <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                                    {student.full_name ? student.full_name.split(' ').map((n: string) => n[0]).join('') : student.username[0]}
                                  </div>
                                  <div className="truncate">
                                    <span className="font-bold text-xs text-gray-900 block leading-tight truncate">
                                      {student.full_name || student.username}
                                    </span>
                                    <span className="text-[9px] text-gray-400 font-mono">@{student.username}</span>
                                  </div>
                                </div>

                                {/* Final Exam Input (50%) */}
                                <div className="flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    value={studentMarks.finalExam}
                                    onChange={(e) => updateMark(student.id, 'finalExam', e.target.value)}
                                    className="w-12 text-center rounded-xl border border-gray-200 bg-slate-50/50 px-1 py-1.5 text-xs text-gray-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 font-semibold"
                                  />
                                </div>

                                {/* Mid Term Input (25%) */}
                                <div className="flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    value={studentMarks.midTerm}
                                    onChange={(e) => updateMark(student.id, 'midTerm', e.target.value)}
                                    className="w-12 text-center rounded-xl border border-gray-200 bg-slate-50/50 px-1 py-1.5 text-xs text-gray-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 font-semibold"
                                  />
                                </div>

                                {/* Class Test Input (10%) */}
                                <div className="flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    value={studentMarks.classTest}
                                    onChange={(e) => updateMark(student.id, 'classTest', e.target.value)}
                                    className="w-12 text-center rounded-xl border border-gray-200 bg-slate-50/50 px-1 py-1.5 text-xs text-gray-900 outline-none focus:border-indigo-550 focus:bg-white focus:ring-2 focus:ring-indigo-100 font-semibold"
                                  />
                                </div>

                                {/* Assignment Input (10%) */}
                                <div className="flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    value={studentMarks.assignment}
                                    onChange={(e) => updateMark(student.id, 'assignment', e.target.value)}
                                    className="w-12 text-center rounded-xl border border-gray-200 bg-slate-50/50 px-1 py-1.5 text-xs text-gray-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 font-semibold"
                                  />
                                </div>

                                {/* Attendance Input (5%) */}
                                <div className="flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    value={studentMarks.attendance}
                                    onChange={(e) => updateMark(student.id, 'attendance', e.target.value)}
                                    className="w-12 text-center rounded-xl border border-gray-200 bg-slate-50/50 px-1 py-1.5 text-xs text-gray-900 outline-none focus:border-indigo-550 focus:bg-white focus:ring-2 focus:ring-indigo-100 font-semibold"
                                  />
                                </div>

                                {/* Calculated Total */}
                                <div className="text-center font-extrabold text-indigo-700 text-xs">
                                  {isAnyMarkEntered ? `${calculatedTotal}%` : '—'}
                                </div>

                                {/* Grade Preview Badge */}
                                <div className="flex justify-center">
                                  {isAnyMarkEntered ? (
                                    <span
                                      className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${getGradeBadgeStyle(
                                        String(letter)
                                      )} shadow-sm flex flex-col items-center min-w-[48px]`}
                                    >
                                      <span>{letter}</span>
                                      <span className="text-[7px] font-bold opacity-60">
                                        {points !== null ? points.toFixed(2) : ''}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-300 font-bold text-xs">—</span>
                                  )}
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      Calculated grades can be saved or modified in bulk.
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <Button
                        onClick={() => save.mutate()}
                        disabled={save.isPending}
                        className="w-full sm:w-auto"
                      >
                        {save.isPending ? 'Saving...' : hasExistingRecords ? 'Update Saved Grades' : 'Save Grades'}
                      </Button>
                      {save.isSuccess && (
                        <span className="text-sm font-bold text-emerald-600">
                          Grades saved successfully!
                        </span>
                      )}
                      {save.isError && (
                        <span className="text-sm font-bold text-red-600">
                          Error: Failed to save.
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
