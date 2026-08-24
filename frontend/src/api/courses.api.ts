import { apiClient } from './client'

export interface Course {
  id: number
  department: number
  department_name?: string
  program?: number
  semester: number
  faculty: number
  faculty_name?: string
  code: string
  title: string
  description: string
  credits: string
  capacity: number
  is_active: boolean
}

export interface Enrollment {
  id: number
  student: number
  student_name?: string
  course: Course
  status: string
  enrolled_on: string
}

export async function fetchCourses(): Promise<Course[]> {
  const res = await apiClient.get<any>('/courses/')
  const data = res.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function fetchMyEnrollments(): Promise<Enrollment[]> {
  const res = await apiClient.get<any>('/enrollments/')
  const data = res.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function createCourse(payload: {
  code: string
  title: string
  description: string
  credits: string
  capacity: number
  department: number
  semester: number
  faculty: number
}): Promise<Course> {
  const res = await apiClient.post<any>('/courses/', payload)
  return res.data?.data || res.data
}
