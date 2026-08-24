import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCourses, createCourse } from '@/api/courses.api'
import { apiClient } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Plus, X, GraduationCap, Users, BookOpen, AlertCircle, Save } from 'lucide-react'

interface Department { id: number; name: string; code: string }
interface Semester { id: number; name: string }
interface User { id: number; full_name: string; role: string }
interface Envelope<T> { data: T }

export function ManageCourses() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [credits, setCredits] = useState('3.0')
  const [capacity, setCapacity] = useState(40)
  const [departmentId, setDepartmentId] = useState('')
  const [semesterId, setSemesterId] = useState('')
  const [facultyId, setFacultyId] = useState('')

  // Queries
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await apiClient.get<Envelope<Department[]>>('/departments/')
      return res.data?.data || []
    },
  })

  const { data: semesters = [] } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await apiClient.get<Envelope<Semester[]>>('/semesters/')
      return res.data?.data || []
    },
  })

  const { data: faculty = [] } = useQuery({
    queryKey: ['faculty-users'],
    queryFn: async () => {
      const res = await apiClient.get<User[]>('/users/')
      const data = Array.isArray(res.data) ? res.data : []
      return data.filter((u) => u.role === 'faculty')
    },
  })

  // Mutation
  const addCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      setShowModal(false)
      // Reset Form
      setCode('')
      setTitle('')
      setDescription('')
      setCredits('3.0')
      setCapacity(40)
      setDepartmentId('')
      setSemesterId('')
      setFacultyId('')
      setErrorMsg('')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message
      if (typeof msg === 'object' && msg !== null) {
        const formatted = Object.entries(msg)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(' ') : String(errors)}`)
          .join(' | ')
        setErrorMsg(formatted)
      } else {
        setErrorMsg(msg || 'Failed to create course. Please check fields.')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!departmentId || !semesterId || !facultyId) {
      setErrorMsg('Please select a department, semester, and instructor.')
      return
    }

    addCourseMutation.mutate({
      code: code.trim(),
      title: title.trim(),
      description: description.trim(),
      credits,
      capacity: Number(capacity),
      department: Number(departmentId),
      semester: Number(semesterId),
      faculty: Number(facultyId),
    })
  }

  return (
    <>
      <PageHeader label="Academic Catalog" title="Course Directory & Management" />

      <div className="mt-5 flex justify-between items-center">
        <h3 className="text-base font-bold text-gray-900">Active University Courses ({courses.length})</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Course
        </button>
      </div>

      <Card className="mt-4 p-6">
        {loadingCourses ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading course catalog...</div>
        ) : courses.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No courses defined in the catalog.</div>
        ) : (
          <div className="divide-y divide-gray-150 max-h-[500px] overflow-y-auto pr-1">
            <div className="grid grid-cols-[1fr_3fr_1fr_1fr] gap-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span>Code</span>
              <span>Course Title</span>
              <span>Credits</span>
              <span>Capacity</span>
            </div>

            {courses.map((course) => (
              <div key={course.id} className="grid grid-cols-[1fr_3fr_1fr_1fr] gap-4 py-3 text-sm items-center hover:bg-slate-50 transition-colors rounded px-2">
                <span className="font-extrabold text-indigo-700">{course.code}</span>
                <div>
                  <span className="font-bold text-gray-900">{course.title}</span>
                  <span className="text-xs text-gray-500 block truncate max-w-lg">{course.description}</span>
                  {course.faculty_name && (
                    <span className="text-[10px] text-gray-400 mt-0.5 block">Instructor: {course.faculty_name}</span>
                  )}
                </div>
                <span className="text-gray-700 font-medium">
                  {typeof course.credits === 'object' && course.credits !== null
                    ? (course.credits as any).credits || String(course.credits)
                    : String(course.credits)} Credits
                </span>
                <span className="text-gray-700">{course.capacity} Students</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Course Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Add New Academic Course
            </h3>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CSE302"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Credits</label>
                  <select
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1.0">1.0 Credit</option>
                    <option value="2.0">2.0 Credits</option>
                    <option value="3.0">3.0 Credits</option>
                    <option value="4.0">4.0 Credits</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Compiler Design"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Department</label>
                  <select
                    required
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} · {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Semester</label>
                  <select
                    required
                    value={semesterId}
                    onChange={(e) => setSemesterId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Instructor (Faculty)</label>
                  <select
                    required
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Instructor</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Course catalog description details..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCourseMutation.isPending}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  {addCourseMutation.isPending ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
