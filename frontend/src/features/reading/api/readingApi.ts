import { apiClient } from '@/shared/lib/axios'
import type {
  PagedList,
  ReadingPassageItem,
  ReadingPassageDetail,
  SubmitReadingExamPayload,
  ReadingExamResult,
  BandRoadmap,
  BandVocabulary,
  AITutorMessage,
  DocumentIngestPayload,
  DocumentIngestResult
} from '../types/reading.types'

export const readingApi = {
  getPassages: async (params?: {
    page?: number
    pageSize?: number
    topic?: string
    difficulty?: string
    sourceType?: string
    targetBandTier?: string
    collectionName?: string
    search?: string
    isPersonalOnly?: boolean
  }): Promise<PagedList<ReadingPassageItem>> => {
    const res = await apiClient.get<PagedList<ReadingPassageItem>>('/reading/passages', { params })
    return res.data
  },

  getPassageById: async (id: string): Promise<ReadingPassageDetail> => {
    const res = await apiClient.get<ReadingPassageDetail>(`/reading/passages/${id}`)
    return res.data
  },

  getRoadmaps: async (): Promise<BandRoadmap[]> => {
    const res = await apiClient.get<BandRoadmap[]>('/reading/roadmaps')
    return res.data
  },

  getVocabularies: async (params?: { bandTier?: string; search?: string }): Promise<BandVocabulary[]> => {
    const res = await apiClient.get<BandVocabulary[]>('/reading/vocabularies', { params })
    return res.data
  },

  askAITutor: async (payload: {
    passageId: string
    question: string
    activeQuestionPrompt?: string
    isPostExamReview?: boolean
  }): Promise<AITutorMessage> => {
    const res = await apiClient.post<AITutorMessage>('/reading/ai-tutor', payload)
    return res.data
  },

  ingestDocument: async (payload: DocumentIngestPayload): Promise<DocumentIngestResult> => {
    const res = await apiClient.post<DocumentIngestResult>('/reading/ingest-document', payload)
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
