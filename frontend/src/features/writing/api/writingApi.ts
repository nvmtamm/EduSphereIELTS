import { apiClient } from '@/shared/lib/axios'

export interface WritingPromptItem {
  id: string
  taskType: 'Task1Academic' | 'Task1General' | 'Task2'
  essayType: string
  title: string
  topic: string
  minWords: number
  suggestedMinutes: number
}
export interface WritingPromptDetail extends WritingPromptItem {
  promptText: string
  dataText: string | null
}
export interface WritingError {
  quote: string
  correction: string
  category: string
  explanation: string
}
export interface WritingFeedback {
  summary: string
  criterionComments: Record<string, string>
  errors: WritingError[]
  vocabularySuggestions: string[]
  gradedBy: string
  lengthPenaltyApplied: boolean
}
export interface WritingSubmission {
  id: string
  promptId: string
  promptTitle: string
  taskType: string
  promptText: string
  dataText: string | null
  essay: string
  wordCount: number
  durationSeconds: number
  taskResponse: number
  coherenceCohesion: number
  lexicalResource: number
  grammaticalRange: number
  overallBand: number
  feedback: WritingFeedback
  outline: string
  modelEssay: string
  modelBand: number
  submittedAt: string
}
export interface WritingHistoryItem {
  id: string
  promptTitle: string
  taskType: string
  overallBand: number
  wordCount: number
  submittedAt: string
}

export const taskLabel = (t: string) =>
  t === 'Task2' ? 'Task 2' : t === 'Task1General' ? 'Task 1 · General' : 'Task 1 · Academic'

export const writingApi = {
  getPrompts: async (params?: { taskType?: string; essayType?: string; search?: string }) =>
    (await apiClient.get<WritingPromptItem[]>('/writing/prompts', { params })).data,
  getPrompt: async (id: string) => (await apiClient.get<WritingPromptDetail>(`/writing/prompts/${id}`)).data,
  submit: async (payload: { promptId: string; essay: string; durationSeconds: number }) =>
    (await apiClient.post<WritingSubmission>('/writing/submit', payload)).data,
  getSubmission: async (id: string) => (await apiClient.get<WritingSubmission>(`/writing/submissions/${id}`)).data,
  getHistory: async () => (await apiClient.get<WritingHistoryItem[]>('/writing/history')).data
}
