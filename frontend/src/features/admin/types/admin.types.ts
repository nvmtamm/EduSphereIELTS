export interface AdminRecentActivity {
  id: string
  studentName: string
  studentEmail: string
  examType: 'Reading' | 'Listening' | 'Writing'
  title: string
  bandScore: number
  submittedAt: string
}

export interface AdminDashboardStats {
  totalLearners: number
  totalSubmissions: number
  averageBandScore: number
  totalReadingPassages: number
  totalListeningTests: number
  totalWritingPrompts: number
  recentActivities: AdminRecentActivity[]
}

export interface AdminUserListItem {
  id: string
  fullName: string
  email: string
  role: 'Student' | 'Admin'
  isActive: boolean
  targetBandScore?: number | null
  totalSubmissions: number
  createdAt: string
}

export interface AdminUserDetail {
  id: string
  fullName: string
  email: string
  role: 'Student' | 'Admin'
  isActive: boolean
  targetBandScore?: number | null
  createdAt: string
  recentActivities: AdminRecentActivity[]
}

export interface AdminExamBankOverview {
  readingPassagesCount: number
  listeningTestsCount: number
  writingPromptsCount: number
}

export interface CreateWritingPromptPayload {
  taskType: 'Task1' | 'Task2'
  title: string
  topic: string
  promptText: string
  imageUrl?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  recommendedTimeMinutes?: number
  minWordCount?: number
  sampleBand8Answer?: string
}

export interface UpdateWritingPromptPayload {
  title: string
  topic: string
  promptText: string
  imageUrl?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  recommendedTimeMinutes: number
  minWordCount: number
  sampleBand8Answer?: string
}
