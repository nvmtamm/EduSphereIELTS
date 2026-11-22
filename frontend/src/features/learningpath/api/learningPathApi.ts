import { apiClient } from '@/shared/lib/axios'

export interface LessonSummary {
  id: string
  code: string
  orderInStage: number
  title: string
  skill: string
  completed: boolean
}
export interface PathStage {
  stageNumber: number
  title: string
  totalLessons: number
  completedLessons: number
  lessons: LessonSummary[]
}
export interface LearningPath {
  totalLessons: number
  completedLessons: number
  stages: PathStage[]
}
export interface LessonItem {
  type: 'exercise' | 'vocabulary' | 'test'
  title: string
  route: string
}
export interface LessonDetail {
  id: string
  code: string
  stageNumber: number
  stageTitle: string
  orderInStage: number
  title: string
  skill: string
  summaryMarkdown: string
  itemsJson: string
  completed: boolean
  previousCode: string | null
  nextCode: string | null
}

export const learningPathApi = {
  getPath: async (): Promise<LearningPath> => (await apiClient.get<LearningPath>('/learningpath')).data,
  getLesson: async (code: string): Promise<LessonDetail> =>
    (await apiClient.get<LessonDetail>(`/learningpath/lessons/${code}`)).data,
  complete: async (code: string): Promise<void> => {
    await apiClient.post(`/learningpath/lessons/${code}/complete`)
  }
}
