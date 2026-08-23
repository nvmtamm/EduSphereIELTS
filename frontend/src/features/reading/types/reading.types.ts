export type QuestionType =
  | 'TrueFalseNotGiven'
  | 'YesNoNotGiven'
  | 'MultipleChoice'
  | 'MatchingHeadings'
  | 'SummaryCompletion'
  | 'SentenceCompletion'

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard'

export interface ReadingPassageItem {
  id: string
  title: string
  topic: string
  difficulty: DifficultyLevel
  estimatedTimeMinutes: number
  totalQuestions: number
  questionTypes: QuestionType[]
  createdAt: string
}

export interface ReadingQuestion {
  id: string
  questionNumber: number
  questionType: QuestionType
  prompt: string
  options: string[]
}

export interface ReadingPassageDetail {
  id: string
  title: string
  topic: string
  difficulty: DifficultyLevel
  estimatedTimeMinutes: number
  content: string
  questions: ReadingQuestion[]
}

export interface UserAnswerInput {
  questionId: string
  userAnswer: string
}

export interface SubmitReadingExamPayload {
  passageId: string
  durationSeconds: number
  answers: UserAnswerInput[]
}

export interface ReadingAnswerResult {
  questionId: string
  questionNumber: number
  questionType: QuestionType
  prompt: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string
}

export interface ReadingExamResult {
  submissionId: string
  passageId: string
  passageTitle: string
  rawScore: number
  totalQuestions: number
  accuracyPercentage: number
  bandScore: number
  durationSeconds: number
  submittedAt: string
  answers: ReadingAnswerResult[]
}

export interface PagedList<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
