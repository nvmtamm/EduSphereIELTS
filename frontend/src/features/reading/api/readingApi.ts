import { apiClient } from '@/shared/lib/axios'
import type {
  PagedList,
  ReadingPassageItem,
  ReadingPassageDetail,
  SubmitReadingExamPayload,
  ReadingExamResult
} from '../types/reading.types'

export const readingApi = {
  getPassages: async (params?: {
    page?: number
    pageSize?: number
    topic?: string
    difficulty?: string
    search?: string
  }): Promise<PagedList<ReadingPassageItem>> => {
    const res = await apiClient.get<PagedList<ReadingPassageItem>>('/reading/passages', { params })
    return res.data
  },

  getPassageById: async (id: string): Promise<ReadingPassageDetail> => {
    const res = await apiClient.get<ReadingPassageDetail>(`/reading/passages/${id}`)
    return res.data
  },

  submitExam: async (payload: SubmitReadingExamPayload): Promise<ReadingExamResult> => {
    const res = await apiClient.post<ReadingExamResult>('/reading/submissions', payload)
    return res.data
  },

  getSubmissionById: async (id: string): Promise<ReadingExamResult> => {
    const res = await apiClient.get<ReadingExamResult>(`/reading/submissions/${id}`)
    return res.data
  }
}
