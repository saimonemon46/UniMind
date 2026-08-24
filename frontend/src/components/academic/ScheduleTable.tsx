import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock, MapPin, Award, BookOpen, Calendar, HelpCircle } from 'lucide-react'
import { schedulingApi } from '@/api/scheduling.api'
import { Card } from '@/components/ui/Card'

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export function ScheduleTable() {
  const [activeTab, setActiveTab] = useState<'classes' | 'exams'>('classes')
  const [selectedDay, setSelectedDay] = useState<string>('monday')

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['class-schedules'],
    queryFn: schedulingApi.classSchedules,
  })

  const { data: exams = [], isLoading: loadingExams } = useQuery({
    queryKey: ['exam-schedules'],
    queryFn: schedulingApi.examSchedules,
  })

  // Group classes by day of the week
  const classesByDay = classes.reduce((acc, curr) => {
    const day = curr.day_of_week.toLowerCase()
    if (!acc[day]) acc[day] = []
    acc[day].push(curr)
    return acc
  }, {} as Record<string, typeof classes>)

  // Sort classes on each day by start time
  Object.keys(classesByDay).forEach((day) => {
    classesByDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time))
  })

  if (loadingClasses || loadingExams) {
    return (
      <Card className="p-8 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-3">
        <Clock className="w-8 h-8 text-indigo-500 animate-spin" />
        Loading your academic timetable...
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Premium Tab Selection Header */}
      <div className="flex border-b border-gray-200 bg-white p-1 rounded-xl shadow-sm max-w-md">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'classes'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Class Routine
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'exams'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Examinations
        </button>
      </div>

      {activeTab === 'classes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
          {/* Day Selection Sidebar */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {DAYS_OF_WEEK.map((day) => {
              const count = classesByDay[day]?.length || 0
              const isActive = selectedDay === day
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl flex items-center justify-between gap-3 text-left transition-all flex-shrink-0 lg:flex-shrink ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white hover:bg-indigo-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  <span className="capitalize">{day}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Daily Schedule Card */}
          <Card className="p-6 border border-gray-200 bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" />
                {selectedDay} Schedule
              </h3>
              <span className="text-xs font-semibold text-gray-500 bg-gray-150 px-2.5 py-1 rounded-full">
                SPR-2026 Semester
              </span>
            </div>

            {!classesByDay[selectedDay] || classesByDay[selectedDay].length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-2xl">
                No classes scheduled for {selectedDay}. Enjoy your day off!
              </div>
            ) : (
              <div className="relative border-l border-indigo-100 ml-4 pl-6 space-y-6">
                {classesByDay[selectedDay].map((item) => (
                  <div key={item.id} className="relative">
                    {/* Time Marker Dot */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm" />

                    <div className="bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/60 p-4 rounded-2xl transition-all hover:shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-extrabold rounded uppercase">
                              {item.course_code}
                            </span>
                            <span className="text-xs text-gray-500">Class Session</span>
                          </div>
                          <h4 className="text-base font-bold text-gray-900">{item.course_title}</h4>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
                          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            {item.start_time.slice(0, 5)} – {item.end_time.slice(0, 5)}
                          </span>
                          <span className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {item.room_name || 'Classroom'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Examinations Schedule Tab */
        <Card className="p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Published Exam Timetable
            </h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-150 px-2.5 py-1 rounded-full">
              Final Examinations
            </span>
          </div>

          {exams.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-2xl">
              No examination schedules published yet.
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 border border-gray-150 rounded-2xl bg-white hover:shadow-sm transition-shadow"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-extrabold rounded uppercase">
                        {exam.course_code}
                      </span>
                      <span className="text-xs text-gray-500">Academic Exam</span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900">{exam.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Date: <span className="font-semibold text-gray-700">{new Date(exam.starts_at).toLocaleDateString()}</span> · Starts at <span className="font-semibold text-gray-700">{new Date(exam.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {exam.room_name || 'Exam Hall'}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        exam.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
