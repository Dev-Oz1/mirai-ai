import type { User, Job, CoverLetter, AuthResponse } from './index'

export type { User, Job, CoverLetter, AuthResponse }

export interface WeeklyTrend {
  label: string
  value: number
}

export interface DashboardStats {
  total_jobs: number
  active_applications: number
  interviews: number
  offers: number
}

export interface AITip {
  id: string
  title: string
  description: string
}

export interface Notification {
  id: string
  message: string
  read: boolean
  created_at?: string
}

export interface JobDropdownItem {
  id: number
  title: string
}

export interface GeneratedContent {
  id?: number
  content: string
}