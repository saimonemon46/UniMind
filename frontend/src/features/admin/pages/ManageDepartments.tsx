import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Building2, GraduationCap } from 'lucide-react'

const DEPARTMENTS = [
  { name: 'Computer Science', code: 'CSE', desc: 'Department of Computer Science and Engineering' },
  { name: 'Software Engineering', code: 'SWE', desc: 'Department of Software Engineering' },
  { name: 'Electrical and Electronic Engineering', code: 'EEE', desc: 'Department of Electrical Engineering' },
  { name: 'Civil Engineering', code: 'CE', desc: 'Department of Civil Engineering' },
  { name: 'Mechanical Engineering', code: 'ME', desc: 'Department of Mechanical Engineering' },
  { name: 'Business Administration', code: 'BBA', desc: 'School of Business Administration' },
  { name: 'Economics', code: 'ECO', desc: 'Department of Economics' },
  { name: 'English', code: 'ENG', desc: 'Department of English Literature & Linguistics' },
  { name: 'Mathematics', code: 'MAT', desc: 'Department of Mathematics' },
  { name: 'Physics', code: 'PHY', desc: 'Department of Applied Physics' },
  { name: 'Chemistry', code: 'CHE', desc: 'Department of Chemistry' },
]

export function ManageDepartments() {
  return (
    <>
      <PageHeader label="Academic Organization" title="University Departments" />

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept) => (
          <Card key={dept.code} className="p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-xl font-bold text-sm">
                {dept.code}
              </div>
              <h3 className="font-bold text-gray-900 text-base">{dept.name}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{dept.desc}</p>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" /> Academic Faculty
              </span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
