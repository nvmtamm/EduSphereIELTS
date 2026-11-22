import { apiClient } from '@/shared/lib/axios'
import type {
  WritingPrompt,
  WritingSubmissionDetail,
  WritingSubmissionSummary,
  SubmitWritingPayload,
  WritingTaskType
} from '../types/writing.types'

export interface WritingFilterParams {
  taskType?: WritingTaskType
  topic?: string
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export const writingApi = {
  getPrompts: async (params?: WritingFilterParams): Promise<PagedResult<WritingPrompt>> => {
    const res = await apiClient.get<PagedResult<WritingPrompt>>('/writing/prompts', { params })
    return res.data
  },

  getPromptById: async (id: string): Promise<WritingPrompt> => {
    const res = await apiClient.get<WritingPrompt>(`/writing/prompts/${id}`)
    return res.data
  },

  submitWriting: async (payload: SubmitWritingPayload): Promise<WritingSubmissionDetail> => {
    const res = await apiClient.post<WritingSubmissionDetail>('/writing/submissions', payload)
    return res.data
  },

  getSubmissionById: async (id: string): Promise<WritingSubmissionDetail> => {
    const res = await apiClient.get<WritingSubmissionDetail>(`/writing/submissions/${id}`)
    return res.data
  },

  getMySubmissions: async (pageNumber = 1, pageSize = 10): Promise<PagedResult<WritingSubmissionSummary>> => {
    const res = await apiClient.get<PagedResult<WritingSubmissionSummary>>('/writing/my-submissions', {
      params: { pageNumber, pageSize }
    })
    return res.data
  },

  streamChat: async (
    submissionId: string,
    message: string,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError?: (err: Error) => void
  ) => {
    try {
      const token =
        localStorage.getItem('edusphere_access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
      const response = await fetch(`${baseUrl}/writing/submissions/${submissionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is empty')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              onDone()
              return
            }
            onChunk(data)
          }
        }
      }

      onDone()
    } catch (err: any) {
      if (onError) onError(err)
      else onDone()
    }
  }
}
