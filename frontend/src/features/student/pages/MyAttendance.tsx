import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAttendanceRecords, AttendanceRecord } from '@/api/attendance.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { CheckCircle2, XCircle, Clock, Search, ChevronDown, ChevronUp, Calendar, AlertCircle } from 'lucide-react'

export function MyAttendance() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: fetchAttendanceRecords,
  })

  // Group records by Course
  const courseGroups = records.reduce((acc, curr) => {
    const courseCode = curr.course_code || 'Other'
    if (!acc[courseCode]) {
      acc[courseCode] = {
        code: courseCode,
        title: curr.course_title || 'Course Details',
        list: [],
      }
    }
    acc[courseCode].list.push(curr)
    return acc
  }, {} as Record<string, { code: string; title: string; list: AttendanceRecord[] }>)

  // Convert to array and filter by Search Term
  const filteredCourses = Object.values(courseGroups).filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const presentCount = records.filter((r) => r.status === 'present').length
  const lateCount = records.filter((r) => r.status === 'late').length
  const absentCount = records.filter((r) => r.status === 'absent').length
  const totalCount = records.length
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0

  const toggleExpand = (courseCode: string) => {
    setExpandedCourse(expandedCourse === courseCode ? null : courseCode)
  }

  return (
    <>
      <PageHeader label="Attendance Records" title="My Class Attendance" />

      <div className="mt-5 grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Attendance Summary Widgets */}
        <div className="space-y-4">
          <Card className="p-5 bg-white border border-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Overall Attendance Rate</p>
            <p className="mt-3 text-4xl font-extrabold text-gray-900">{attendanceRate}%</p>
            <div className="w-full bg-gray-150 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  attendanceRate >= 80 ? 'bg-emerald-500' : attendanceRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500 font-medium">
              {presentCount + lateCount} classes attended out of {totalCount} total
            </p>
          </Card>

          <Card className="p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide border-b pb-2 mb-2">Summary Metrics</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" /> Present
              </span>
              <span className="font-extrabold text-gray-900">{presentCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-amber-700 font-semibold">
                <Clock className="w-4.5 h-4.5 text-amber-500" /> Late
              </span>
              <span className="font-extrabold text-gray-900">{lateCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-rose-700 font-semibold">
                <XCircle className="w-4.5 h-4.5 text-rose-500" /> Absent
              </span>
              <span className="font-extrabold text-gray-900">{absentCount}</span>
            </div>
          </Card>
        </div>

        {/* Detailed Attendance List (Organized Course-Wise) */}
        <div className="space-y-4">
          {/* Search and Sort Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-gray-200">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search course code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Sort Class Log:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded-2xl">
              Loading class logs...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded-2xl">
              No matching course attendance records found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCourses.map((group) => {
                const cTotal = group.list.length
                const cPresent = group.list.filter((r) => r.status === 'present').length
                const cLate = group.list.filter((r) => r.status === 'late').length
                const cAbsent = group.list.filter((r) => r.status === 'absent').length
                const cRate = cTotal > 0 ? Math.round(((cPresent + cLate) / cTotal) * 100) : 0
                const isExpanded = expandedCourse === group.code

                // Sort logs inside this course
                const sortedLogs = [...group.list].sort((a, b) => {
                  return sortOrder === 'newest'
                    ? b.class_date.localeCompare(a.class_date)
                    : a.class_date.localeCompare(b.class_date)
                })

                return (
                  <div key={group.code} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow transition-shadow">
                    {/* Header Banner */}
                    <button
                      onClick={() => toggleExpand(group.code)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50/20 text-left transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded">
                            {group.code}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">{cTotal} Class Entries</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mt-1">{group.title}</h4>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-gray-900">{cRate}% Attendance</p>
                          <p className="text-[10px] text-gray-500">
                            {cPresent}P · {cLate}L · {cAbsent}A
                          </p>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </button>

                    {/* Expandable Class Logs List */}
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-150 bg-white space-y-2">
                        {sortedLogs.map((log) => (
                          <div key={log.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 text-xs font-medium">
                            <span className="flex items-center gap-1.5 text-gray-700">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {log.class_date}
                            </span>

                            <div>
                              {log.status === 'present' && (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                                  Present
                                </span>
                              )}
                              {log.status === 'late' && (
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                                  Late
                                </span>
                              )}
                              {log.status === 'absent' && (
                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
                                  Absent
                                </span>
                              )}
                              {log.status === 'excused' && (
                                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                                  Excused
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
