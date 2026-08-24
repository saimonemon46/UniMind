import { apiClient } from './client'

export interface StudentProfile {
  id: number
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    role: string
    department?: { id: number; name: string; code: string }
    phone?: string
    avatar_url?: string
  }
  university_id: string
  program: number
  program_name: string
  department_name: string
  advisor?: number
  advisor_name?: string
  enrollment_date: string
  cgpa: string
  credits_completed: number
  academic_standing: string
  financial_hold: boolean
}

export async function fetchCurrentStudentProfile(): Promise<StudentProfile> {
  const res = await apiClient.get<any>('/students/me/')
  return res.data?.data || res.data
}

export async function fetchAllStudents(): Promise<StudentProfile[]> {
  const res = await apiClient.get<any>('/students/')
  const data = res.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}
