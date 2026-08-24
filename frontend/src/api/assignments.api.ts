import { apiClient } from './client'

export interface Assignment {
  id: number
  course: number
  course_code?: string
  title: string
  description: string
  due_at: string
  points: string
}

export interface Submission {
  id: number
  assignment: number
  student: number
  content: string
  file_url?: string
  status: string
  score?: string
  feedback?: string
  submitted_at: string
  graded_by_name?: string
}

export async function fetchAssignments(): Promise<Assignment[]> {
  const res = await apiClient.get<any>('/assignments/')
  const data = res.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function fetchSubmissions(): Promise<Submission[]> {
  const res = await apiClient.get<any>('/submissions/')
  const data = res.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function uploadAttachment(file: File): Promise<{ file_url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await apiClient.post<{ file_url: string }>('/assignments/upload-attachment/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return res.data
}
