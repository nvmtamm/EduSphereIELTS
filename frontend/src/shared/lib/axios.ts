import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { AuthResponse } from '../types/auth.types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5005/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Track token refreshing state & queued requests
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// 1. Request Interceptor: Attach Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('edusphere_access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 2. Response Interceptor: Handle 401 & Silent Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is not 401 or request was already retried once
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Do not attempt refresh if the failed request was login or register
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register') || originalRequest.url?.includes('/auth/refresh-token')) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    const currentRefreshToken = localStorage.getItem('edusphere_refresh_token')

    if (!currentRefreshToken) {
      isRefreshing = false
      localStorage.removeItem('edusphere_access_token')
      localStorage.removeItem('edusphere_refresh_token')
      localStorage.removeItem('edusphere_user')
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(error)
    }

    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken: currentRefreshToken
      })

      const { accessToken, refreshToken: newRefreshToken, user } = response.data

      localStorage.setItem('edusphere_access_token', accessToken)
      localStorage.setItem('edusphere_refresh_token', newRefreshToken)
      localStorage.setItem('edusphere_user', JSON.stringify(user))

      processQueue(null, accessToken)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
      }

      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError as Error, null)
      localStorage.removeItem('edusphere_access_token')
      localStorage.removeItem('edusphere_refresh_token')
      localStorage.removeItem('edusphere_user')
      window.dispatchEvent(new Event('auth:logout'))
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
