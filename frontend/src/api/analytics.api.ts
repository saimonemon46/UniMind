import { apiClient } from './client'

export interface DashboardEnvelope<T> { data: T; message: string; success: boolean }

/**
 * Fetch the generic dashboard data based on the authenticated user's role.
 * For advisors, this will contain assigned students and intervention plans.
 */
export const analyticsApi = {
  dashboard: async <T>() => (await apiClient.get<DashboardEnvelope<T>>('/analytics/dashboard/')).data.data,
  // Alias for clarity when fetching advisor-specific data
  advisorDashboard: async () => (await apiClient.get<DashboardEnvelope<any>>('/analytics/dashboard/')).data.data,
}
