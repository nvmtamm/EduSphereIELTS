import { apiClient } from '@/shared/lib/axios'
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User
} from '@/shared/types/auth.types'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', { refreshToken })
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>('/auth/profile', data)
    return response.data
  },

  changePassword: async (data: ChangePasswordRequest): Promise<string> => {
    const response = await apiClient.post<string>('/auth/change-password', data)
    return response.data
  },

  updateTargetScore: async (targetBandScore: number): Promise<number> => {
    const response = await apiClient.put<number>('/auth/target-score', { targetBandScore })
    return response.data
  },

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/google', { idToken })
    return response.data
  },

  forgotPassword: async (email: string): Promise<string> => {
    const response = await apiClient.post<string>('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (data: { email: string; token: string; newPassword: string }): Promise<string> => {
    const response = await apiClient.post<string>('/auth/reset-password', data)
    return response.data
  }
}
