import { API_PATHS } from '@/constants/apiPaths'
import type { Role } from '@/constants/roles'
import { apiClient } from './client'

interface TokenResponse {
  access: string
  refresh: string
}

interface CurrentUserResponse {
  data: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    role: Role
    department_name?: string | null
    avatar_url?: string
  }
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(API_PATHS.token, { username, password })
  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get<CurrentUserResponse>(API_PATHS.me)
  const user = response.data.data
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: user.full_name || user.username,
    role: user.role,
    department: user.department_name,
    avatarUrl: user.avatar_url,
  }
}
