import { apiClient } from './client'
export interface DashboardEnvelope<T> { data: T; message: string; success: boolean }
export const analyticsApi = { dashboard: async <T>() => (await apiClient.get<DashboardEnvelope<T>>('/analytics/dashboard/')).data.data }
