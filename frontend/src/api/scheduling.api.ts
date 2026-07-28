import { apiClient } from './client'

export interface Room { id: number; code: string; name: string; building: string; capacity: number; is_active: boolean }
export interface ClassSchedule { id: number; course: number; course_code: string; course_title: string; room: number; room_name: string; day_of_week: string; start_time: string; end_time: string }
export interface ExamSchedule { id: number; course: number; course_code: string; course_title: string; room: number; room_name: string; title: string; starts_at: string; ends_at: string; status: 'draft' | 'published' | 'completed'; invigilators: number[]; invigilator_names: string[] }

interface ApiEnvelope<T> { data: T }

export const schedulingApi = {
  classSchedules: async () => (await apiClient.get<ApiEnvelope<ClassSchedule[]>>('/class-schedules/')).data.data,
  examSchedules: async () => (await apiClient.get<ApiEnvelope<ExamSchedule[]>>('/exam-schedules/')).data.data,
  rooms: async () => (await apiClient.get<ApiEnvelope<Room[]>>('/rooms/')).data.data,
  createClassSchedule: async (payload: Omit<ClassSchedule, 'id' | 'course_code' | 'course_title' | 'room_name'>) => (await apiClient.post('/class-schedules/', payload)).data,
  createExamSchedule: async (payload: Omit<ExamSchedule, 'id' | 'course_code' | 'course_title' | 'room_name' | 'invigilator_names'>) => (await apiClient.post('/exam-schedules/', payload)).data,
}
