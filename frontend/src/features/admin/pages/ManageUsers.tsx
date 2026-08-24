import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAllStudents } from '@/api/students.api'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Search, ArrowUpDown, UserCheck, ShieldAlert, Award, GraduationCap, User } from 'lucide-react'

export function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: fetchAllStudents,
  })

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const s = searchTerm.toLowerCase()
    const fullName = `${student.user.first_name} ${student.user.last_name}`.toLowerCase()
    const username = (student.user.username || '').toLowerCase()
    const email = (student.user.email || '').toLowerCase()
    const uniId = (student.university_id || '').toLowerCase()
    const dept = (student.department_name || '').toLowerCase()
    const prog = (student.program_name || '').toLowerCase()
    const adv = (student.advisor_name || '').toLowerCase()

    return (
      fullName.includes(s) ||
      username.includes(s) ||
      email.includes(s) ||
      uniId.includes(s) ||
      dept.includes(s) ||
      prog.includes(s) ||
      adv.includes(s)
    )
  })

  // Sort filtered students based on selection
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'name-asc') {
      const nameA = `${a.user.first_name} ${a.user.last_name}`.toLowerCase()
      const nameB = `${b.user.first_name} ${b.user.last_name}`.toLowerCase()
      return nameA.localeCompare(nameB)
    }
    if (sortBy === 'name-desc') {
      const nameA = `${a.user.first_name} ${a.user.last_name}`.toLowerCase()
      const nameB = `${b.user.first_name} ${b.user.last_name}`.toLowerCase()
      return nameB.localeCompare(nameA)
    }
    if (sortBy === 'id-asc') {
      return (a.university_id || '').localeCompare(b.university_id || '')
    }
    if (sortBy === 'id-desc') {
      return (b.university_id || '').localeCompare(a.university_id || '')
    }
    if (sortBy === 'dept-asc') {
      return (a.department_name || '').localeCompare(b.department_name || '')
    }
    if (sortBy === 'cgpa-desc') {
      return parseFloat(b.cgpa || '0') - parseFloat(a.cgpa || '0')
    }
    if (sortBy === 'credits-desc') {
      return (b.credits_completed || 0) - (a.credits_completed || 0)
    }
    if (sortBy === 'standing-asc') {
      return (a.academic_standing || '').localeCompare(b.academic_standing || '')
    }
    return 0
  })

  // Get academic standing badge styling
  const getStandingBadge = (standing: string) => {
    const s = (standing || '').toLowerCase()
    if (s.includes('good') || s.includes('honor')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    if (s.includes('probation') || s.includes('warning')) {
      return 'bg-amber-50 text-amber-700 border-amber-200'
    }
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }

  return (
    <>
      <PageHeader label="User Management" title="System Accounts & Users" />

      <Card className="mt-5 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900">Registered University Accounts</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading
                ? 'Loading accounts...'
                : `Showing ${sortedStudents.length} of ${students.length} accounts`}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            {students.length} Enrolled Students
          </span>
        </div>

        {/* Search and Sort controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, ID, department, advisor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-50/50"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-gray-700 cursor-pointer appearance-none"
              >
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
                <option value="id-asc">Sort: Student ID (Asc)</option>
                <option value="id-desc">Sort: Student ID (Desc)</option>
                <option value="dept-asc">Sort: Department (A-Z)</option>
                <option value="cgpa-desc">Sort: CGPA (High to Low)</option>
                <option value="credits-desc">Sort: Completed Credits (High to Low)</option>
                <option value="standing-asc">Sort: Academic Standing</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading user accounts...</div>
        ) : sortedStudents.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
            No matching accounts found for "{searchTerm}"
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px] divide-y divide-gray-150">
              <div className="grid grid-cols-[2.5fr_2fr_2fr_1.5fr] gap-4 pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-white z-10 border-b border-gray-150">
                <span>Student Info</span>
                <span>Department & Program</span>
                <span>Academic Record</span>
                <span>Advisor</span>
              </div>

              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-1">
                {sortedStudents.map((student) => (
                  <div key={student.id} className="grid grid-cols-[2.5fr_2fr_2fr_1.5fr] gap-4 py-4 text-sm items-center hover:bg-slate-50/70 px-2 -mx-2 rounded-lg transition-colors">
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                        {student.user.first_name[0]}{student.user.last_name[0]}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                          {student.user.first_name} {student.user.last_name}
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                            {student.university_id}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono block">@{student.user.username} · {student.user.email}</span>
                      </div>
                    </div>

                    {/* Department & Program */}
                    <div>
                      <span className="font-bold text-gray-900 block text-xs truncate">
                        {student.department_name}
                      </span>
                      <span className="text-xs text-gray-500 block mt-0.5 truncate">
                        {student.program_name}
                      </span>
                    </div>

                    {/* Academic Record */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-gray-900 text-xs">{student.cgpa} <span className="text-gray-400 font-normal">GPA</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                        <span className="font-bold text-gray-900 text-xs">{student.credits_completed} <span className="text-gray-400 font-normal">CR</span></span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStandingBadge(student.academic_standing)}`}>
                        {student.academic_standing}
                      </span>
                    </div>

                    {/* Advisor */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-700">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium truncate">
                        {student.advisor_name || <span className="text-gray-400 italic">Unassigned</span>}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}
