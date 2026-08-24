import React, { createContext, useState, useEffect, useCallback } from 'react'
import { User, LoginRequest, RegisterRequest } from '../types/auth.types'
import { authApi } from '@/features/auth/api/authApi'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => void
  updateTargetScore: (score: number) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('edusphere_user')
    return cached ? JSON.parse(cached) : null
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const logout = useCallback(() => {
    localStorage.removeItem('edusphere_access_token')
    localStorage.removeItem('edusphere_refresh_token')
    localStorage.removeItem('edusphere_user')
    setUser(null)
  }, [])

  useEffect(() => {
    const handleAuthLogout = () => {
      logout()
    }

    window.addEventListener('auth:logout', handleAuthLogout)
    return () => window.removeEventListener('auth:logout', handleAuthLogout)
  }, [logout])

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('edusphere_access_token')
      if (token) {
        try {
          const profile = await authApi.getProfile()
          setUser(profile)
          localStorage.setItem('edusphere_user', JSON.stringify(profile))
        } catch {
          logout()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [logout])

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(credentials)
      localStorage.setItem('edusphere_access_token', response.accessToken)
      localStorage.setItem('edusphere_refresh_token', response.refreshToken)
      localStorage.setItem('edusphere_user', JSON.stringify(response.user))
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(data)
      localStorage.setItem('edusphere_access_token', response.accessToken)
      localStorage.setItem('edusphere_refresh_token', response.refreshToken)
      localStorage.setItem('edusphere_user', JSON.stringify(response.user))
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.googleLogin(idToken)
      localStorage.setItem('edusphere_access_token', response.accessToken)
      localStorage.setItem('edusphere_refresh_token', response.refreshToken)
      localStorage.setItem('edusphere_user', JSON.stringify(response.user))
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTargetScore = async (score: number) => {
    await authApi.updateTargetScore(score)
    if (user) {
      const updatedUser = { ...user, targetBandScore: score }
      setUser(updatedUser)
      localStorage.setItem('edusphere_user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateTargetScore
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
