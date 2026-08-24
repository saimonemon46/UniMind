import { apiClient } from './client'

export interface AttendanceRecord {
  id: number
  course: number
  course_code?: string
  course_title?: string
  student: number
  student_name?: string
  class_date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
}

export async function fetchAttendanceRecords(): Promise<AttendanceRecord[]> {
  const res = await apiClient.get<any>('/attendance/')
  const data = res.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}
