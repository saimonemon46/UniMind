import { apiClient } from './client'

export interface Grade {
  id: number
  student: number
  student_name: string
  course: number
  course_code: string
  course_title: string
  credits: string
  letter: string
  points: string
  percentage: string
  remarks: string
}

export interface AssessmentGrade {
  id: number
  student: number
  course: number
  title: string
  category: string
  weight_percentage: string
  score_obtained: string
  max_score: string
  created_at: string
}

export async function fetchGrades(): Promise<Grade[]> {
  const res = await apiClient.get<any>('/grades/')
  const data = res.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}
