export type QuestionType =
  | 'TrueFalseNotGiven'
  | 'YesNoNotGiven'
  | 'MultipleChoice'
  | 'MatchingHeadings'
  | 'SummaryCompletion'
  | 'SentenceCompletion'

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard'

export type PassageSourceType =
  | 'OfficialCambridge'
  | 'PastActualTest'
  | 'BritishCouncilIdp'
  | 'PublisherSeries'
  | 'UserUploaded'
  | 'AIGenerated'

export type TargetBandTier =
  | 'PreIelts'
  | 'Band4_0_4_5'
  | 'Band5_0_5_5'
  | 'Band6_0_6_5'
  | 'Band7_0_7_5'
  | 'Band8_0_Plus'

export interface ReadingPassageItem {
  id: string
  title: string
  topic: string
  difficulty: DifficultyLevel
  estimatedTimeMinutes: number
  totalQuestions: number
  questionTypes: QuestionType[]
  sourceType: PassageSourceType
  collectionName: string
  targetBandTier: TargetBandTier
  uploadedByUserId?: string | null
  isCommunityShared?: boolean
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
  sourceType: PassageSourceType
  collectionName: string
  targetBandTier: TargetBandTier
  uploadedByUserId?: string | null
  isCommunityShared?: boolean
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

export interface BandMilestone {
  id: string
  stepNumber: number
  title: string
  targetSkill: string
  description: string
  readingPassageId?: string | null
  minAccuracyToUnlockNext: number
  isCompleted: boolean
  userBestAccuracy?: number | null
}

export interface BandRoadmap {
  id: string
  bandTier: TargetBandTier
  title: string
  description: string
  targetSkillsSummary: string
  totalMilestones: number
  vocabularyCount: number
  currentUserStep: number
  userMasteryPercentage: number
  earnedBadge?: string | null
  milestones: BandMilestone[]
}

export interface BandVocabulary {
  id: string
  bandTier: TargetBandTier
  word: string
  phonetic: string
  meaning: string
  partOfSpeech: string
  academicLevel: string
  exampleSentence: string
  collocations: string[]
  synonyms: string[]
}

export interface AITutorMessage {
  role: 'user' | 'assistant'
  message: string
  relevantParagraph?: string | null
  highlightKeywords?: string[]
}

export interface DocumentIngestPayload {
  rawText: string
  fileName: string
  collectionName?: string
  targetBandTier?: string
  isCommunityShared?: boolean
}

export interface DocumentIngestResult {
  passageId: string
  title: string
  topic: string
  difficulty: string
  questionCount: number
  collectionName: string
  processingLogs: string[]
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
