export interface ListeningTest {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sectionType: 'Section1_SocialDialogue' | 'Section2_SocialMonologue' | 'Section3_AcademicDiscussion' | 'Section4_AcademicLecture' | 'FullTest_4Sections';
  sectionNumber: number;
  durationSeconds: number;
  audioUrl: string;
  accent: 'British' | 'American' | 'Australian' | 'Canadian' | 'Mixed';
  totalQuestions: number;
  questionTypes: string[];
  sourceType: string;
  collectionName: string;
  targetBandTier: string;
  uploadedByUserId?: string | null;
  isCommunityShared: boolean;
  createdAt: string;
}

export interface ListeningQuestion {
  id: string;
  sectionNumber: number;
  questionNumber: number;
  questionType: string;
  prompt: string;
  options: string[];
  diagramImageUrl?: string | null;
  timestampSeconds: number;
}

export interface ListeningTranscript {
  id: string;
  sectionNumber: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  speaker: string;
  textContent: string;
  linkedQuestionNumber?: number | null;
}

export interface ListeningTestDetail {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sectionType: string;
  sectionNumber: number;
  audioUrl: string;
  durationSeconds: number;
  accent: string;
  sourceType: string;
  collectionName: string;
  targetBandTier: string;
  instructions: string;
  uploadedByUserId?: string | null;
  isCommunityShared: boolean;
  questions: ListeningQuestion[];
  transcripts: ListeningTranscript[];
}

export interface UserListeningAnswerSubmission {
  questionId: string;
  userAnswer: string;
}

export interface SubmitListeningExamRequest {
  durationSeconds: number;
  answers: UserListeningAnswerSubmission[];
}

export interface ListeningSectionBreakdown {
  sectionNumber: number;
  sectionTitle: string;
  rawScore: number;
  totalQuestions: number;
  accuracyPercentage: number;
}

export interface ListeningAnswerResult {
  questionId: string;
  sectionNumber: number;
  questionNumber: number;
  questionType: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  timestampSeconds: number;
  audioTimestampEndSeconds?: number | null;
}

export interface ListeningResult {
  submissionId: string;
  testId: string;
  testTitle: string;
  rawScore: number;
  totalQuestions: number;
  accuracyPercentage: number;
  bandScore: number;
  durationSeconds: number;
  completedAt: string;
  sectionBreakdowns: ListeningSectionBreakdown[];
  answers: ListeningAnswerResult[];
  transcripts: ListeningTranscript[];
}

export interface ListeningHistoryItem {
  submissionId: string;
  testId: string;
  testTitle: string;
  rawScore: number;
  totalQuestions: number;
  accuracyPercentage: number;
  bandScore: number;
  durationSeconds: number;
  completedAt: string;
  accent: string;
  sectionType: string;
}

export interface PagedList<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ListeningFilterParams {
  page?: number;
  pageSize?: number;
  sectionNumber?: number;
  accent?: string;
  topic?: string;
  difficulty?: string;
  sourceType?: string;
  targetBandTier?: string;
  collectionName?: string;
  search?: string;
  isPersonalOnly?: boolean;
}
