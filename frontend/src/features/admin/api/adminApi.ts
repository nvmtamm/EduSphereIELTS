import { apiClient } from '@/shared/lib/axios'
import type {
  AdminDashboardStats,
  AdminExamBankOverview,
  AdminUserListItem,
  AdminUserDetail,
  CreateWritingPromptPayload,
  UpdateWritingPromptPayload
} from '../types/admin.types'

export interface UserQueryParams {
  search?: string
  role?: 'Student' | 'Admin'
  isActive?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface PagedUsersResult {
  items: AdminUserListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export const adminApi = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const res = await apiClient.get<AdminDashboardStats>('/admin/dashboard/stats')
    return res.data
  },

  getExamBankOverview: async (): Promise<AdminExamBankOverview> => {
    const res = await apiClient.get<AdminExamBankOverview>('/admin/dashboard/exam-bank/overview')
    return res.data
  },

  getUsers: async (params?: UserQueryParams): Promise<PagedUsersResult> => {
    const res = await apiClient.get<PagedUsersResult>('/admin/users', { params })
    return res.data
  },

  getUserById: async (id: string): Promise<AdminUserDetail> => {
    const res = await apiClient.get<AdminUserDetail>(`/admin/users/${id}`)
    return res.data
  },

  updateUserRole: async (id: string, role: 'Student' | 'Admin'): Promise<boolean> => {
    const res = await apiClient.put<boolean>(`/admin/users/${id}/role`, { role })
    return res.data
  },

  toggleUserStatus: async (id: string, isActive: boolean): Promise<boolean> => {
    const res = await apiClient.patch<boolean>(`/admin/users/${id}/status`, { isActive })
    return res.data
  },

  createWritingPrompt: async (payload: CreateWritingPromptPayload): Promise<string> => {
    const res = await apiClient.post<string>('/admin/writing/prompts', payload)
    return res.data
  },

  updateWritingPrompt: async (id: string, payload: UpdateWritingPromptPayload): Promise<boolean> => {
    const res = await apiClient.put<boolean>(`/admin/writing/prompts/${id}`, payload)
    return res.data
  },

  deleteWritingPrompt: async (id: string): Promise<boolean> => {
    const res = await apiClient.delete<boolean>(`/admin/writing/prompts/${id}`)
    return res.data
  }
}
