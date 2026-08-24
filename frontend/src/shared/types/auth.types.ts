export interface User {
  id: string
  fullName: string
  email: string
  role: 'Student' | 'Admin'
  targetBandScore?: number
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  targetBandScore?: number
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
}
