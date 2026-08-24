import { apiClient } from './client'

export interface Announcement {
  id: number
  title: string
  body: string
  audience: 'all' | 'admin' | 'faculty' | 'student' | 'advisor'
  created_by: number
  created_by_name: string
  published_at: string
  created_at: string
  updated_at: string
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await apiClient.get<any>('/announcements/')
  const data = res.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function createAnnouncement(payload: { title: string; body: string; audience: string }): Promise<Announcement> {
  const res = await apiClient.post<any>('/announcements/', payload)
  return res.data?.data || res.data
}
