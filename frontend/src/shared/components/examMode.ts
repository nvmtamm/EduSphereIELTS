export type ExamMode = 'practice' | 'exam'

export const parseExamMode = (value: string | null): ExamMode | null =>
  value === 'practice' || value === 'exam' ? value : null
