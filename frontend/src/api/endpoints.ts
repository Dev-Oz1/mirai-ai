import { apiClient } from './client'
import type {
  AuthResponse,
  User,
  DashboardStats,
  WeeklyTrend,
  AITip,
  Notification,
  Job,
  JobDropdownItem,
  CoverLetter,
  GeneratedContent,
} from '../types/api'

export const authApi = {
  login: (data: any) => apiClient.post<AuthResponse>('/auth/login', data),
  register: (data: any) => apiClient.post<User>('/auth/register', data),
  me: () => apiClient.get<User>('/users/me'),
}

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/dashboard/stats'),
  getTrends: (period = '4weeks') =>
    apiClient.get<{ trends: WeeklyTrend[] }>(
      `/dashboard/trends?period=${period}`,
    ),
  getTips: () => apiClient.get<{ tips: AITip[] }>('/dashboard/ai-tips'),
  getRecentJobs: (limit = 5) =>
    apiClient.get<Job[]>(`/dashboard/recent-jobs?limit=${limit}`),
}

export const notificationsApi = {
  list: (unreadOnly = false) =>
    apiClient.get<Notification[]>(`/notifications?unread_only=${unreadOnly}`),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`, {}),
  markAllRead: () => apiClient.patch('/notifications/read-all', {}),
}

export const jobsApi = {
  list: (
    params: {
      status?: string
      skip?: number
      limit?: number
      search?: string
    } = {},
  ) => {
    const query = new URLSearchParams()
    if (params.status && params.status !== 'all') {
      query.append('status', params.status)
    }
    if (params.skip) query.append('skip', params.skip.toString())
    if (params.limit) query.append('limit', params.limit.toString())
    return apiClient.get<Job[]>(`/jobs?${query.toString()}`)
  },
  get: (id: string) => apiClient.get<Job>(`/jobs/${id}`),
  create: (data: any) => apiClient.post<Job>('/jobs', data),
  update: (id: string, data: any) => apiClient.patch<Job>(`/jobs/${id}`, data),
  delete: (id: string) => apiClient.delete(`/jobs/${id}`),
  analyze: (id: string) => apiClient.post<Job>(`/jobs/${id}/analyze`, {}),
}

export const coverLettersApi = {
  list: () => apiClient.get<CoverLetter[]>('/cover-letters'),
  generate: (data: { jobId: string; tone: string }) =>
    apiClient.post<GeneratedContent>('/cover-letters/generate', data),
  getJobsForDropdown: () =>
    apiClient.get<JobDropdownItem[]>('/cover-letters/jobs-for-generation'),
  exportPdf: (id: string) =>
    apiClient.get<{ downloadUrl: string }>(`/cover-letters/${id}/export/pdf`),
}