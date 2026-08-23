import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { ReadingPassageDetail, UserAnswerInput } from '../types/reading.types'
import { ExamTimer } from '../components/ExamTimer'
import { ReadingWorkspace } from '../components/ReadingWorkspace'

export const ReadingExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [passage, setPassage] = useState<ReadingPassageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [secondsSpent, setSecondsSpent] = useState(0)

  const initialTimeSeconds = (passage?.estimatedTimeMinutes ?? 20) * 60

  useEffect(() => {
    if (!id) return

    const loadPassage = async () => {
      try {
        setLoading(true)
        const data = await readingApi.getPassageById(id)
        setPassage(data)
      } catch (err) {
        console.error('Failed to load passage detail', err)
      } finally {
        setLoading(false)
      }
    }

    loadPassage()
  }, [id])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmitExam = async () => {
    if (!passage || submitting) return

    try {
      setSubmitting(true)
      const payloadAnswers: UserAnswerInput[] = Object.entries(answers).map(
        ([questionId, userAnswer]) => ({
          questionId,
          userAnswer
        })
      )

      const result = await readingApi.submitExam({
        passageId: passage.id,
        durationSeconds: secondsSpent,
        answers: payloadAnswers
      })

      navigate(`/reading/result/${result.submissionId}`)
    } catch (err) {
      console.error('Failed to submit exam', err)
      alert('Failed to submit your exam. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExitConfirm = () => {
    if (window.confirm('Are you sure you want to exit the exam? Your current progress will be lost.')) {
      navigate('/reading')
    }
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-xs font-bold text-zinc-500">Preparing Computer-delivered IELTS exam...</p>
      </div>
    )
  }

  if (!passage) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Passage not found.</p>
        <button
          type="button"
          onClick={() => navigate('/reading')}
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
        >
          Return to Reading Hub
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black">
      {/* Exam Header - Jet Black */}
      <header className="h-14 px-4 sm:px-6 bg-black border-b border-zinc-800 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitConfirm}
            title="Exit Exam"
            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-600 flex items-center justify-center text-white text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm truncate max-w-xs sm:max-w-md text-white">
              {passage.title}
            </span>
          </div>
        </div>

        {/* Timer */}
        <ExamTimer
          initialSeconds={initialTimeSeconds}
          onTimeUp={handleSubmitExam}
          onTick={(left) => setSecondsSpent(initialTimeSeconds - left)}
        />
      </header>

      {/* Split-Screen Resizable Workspace */}
      <ReadingWorkspace
        passage={passage}
        answers={answers}
        onAnswerChange={handleAnswerChange}
        onSubmitExam={handleSubmitExam}
        isSubmitting={submitting}
      />
    </div>
  )
}
