export type WritingTaskType = 'Task1' | 'Task2'

export interface WritingPrompt {
  id: string
  taskType: WritingTaskType
  title: string
  topic: string
  promptText: string
  imageUrl?: string | null
  difficulty: 'Easy' | 'Medium' | 'Hard'
  recommendedTimeMinutes: number
  minWordCount: number
  sampleBand8Answer?: string | null
  isActive: boolean
  createdAt: string
}

export interface CriteriaScore {
  score: number
  bandDescriptor: string
  strengths: string[]
  areasForImprovement: string[]
  feedback: string
}

export interface GrammarError {
  originalSentence: string
  errorExplanation: string
  suggestedCorrection: string
  band8Paraphrase: string
}

export interface VocabularySuggestion {
  originalWordOrPhrase: string
  academicAlternatives: string[]
  contextualExample: string
}

export interface WritingEvaluationResult {
  taskAchievement: CriteriaScore
  coherenceCohesion: CriteriaScore
  lexicalResource: CriteriaScore
  grammaticalRange: CriteriaScore
  overallBand: number
  generalSummary: string
  grammarErrors: GrammarError[]
  vocabularySuggestions: VocabularySuggestion[]
}

export interface WritingSubmissionDetail {
  id: string
  promptId: string
  promptTitle: string
  taskType: WritingTaskType
  promptText: string
  content: string
  wordCount: number
  timeSpentSeconds: number
  taskAchievementScore: number
  coherenceCohesionScore: number
  lexicalResourceScore: number
  grammaticalRangeScore: number
  overallBandScore: number
  evaluationResult: WritingEvaluationResult
  generalFeedback: string
  status: 'Pending' | 'Evaluating' | 'Completed' | 'Failed'
  createdAt: string
}

export interface WritingSubmissionSummary {
  id: string
  promptId: string
  promptTitle: string
  taskType: WritingTaskType
  wordCount: number
  timeSpentSeconds: number
  overallBandScore: number
  status: string
  createdAt: string
}

export interface SubmitWritingPayload {
  promptId: string
  content: string
  timeSpentSeconds: number
}
