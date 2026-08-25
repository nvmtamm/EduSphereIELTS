import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Loader2,
  Share2,
  Sparkles,
  Bot
} from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { ReadingExamResult, ReadingAnswerResult } from '../types/reading.types'
import { ExplanationModal } from '../components/ExplanationModal'
import { ReadingAITutorSidebar } from '../components/ReadingAITutorSidebar'

export const ReadingResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [result, setResult] = useState<ReadingExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAnswerForModal, setSelectedAnswerForModal] = useState<ReadingAnswerResult | null>(null)
  const [isAITutorOpen, setIsAITutorOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadResult = async () => {
      try {
        setLoading(true)
        const data = await readingApi.getSubmissionById(id)
        setResult(data)
      } catch (err) {
        console.error('Failed to load exam result', err)
      } finally {
        setLoading(false)
      }
    }

    loadResult()
  }, [id])

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-xs font-bold text-zinc-500">Calculating your IELTS Band Score & Diagnostic...</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Exam submission result not found.</p>
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

  const minutes = Math.floor(result.durationSeconds / 60)
  const seconds = result.durationSeconds % 60
  const timeFormatted = `${minutes}m ${seconds}s`

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/reading')}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reading Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAITutorOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Diagnostic AI Tutor</span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </button>
      </div>

      {/* Band Score Hero Card - Luxury Black Card */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official Band Score Estimate</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {result.passageTitle}
            </h1>
            <p className="text-zinc-400 text-xs font-medium">
              Submitted on {new Date(result.submittedAt).toLocaleDateString()} at {new Date(result.submittedAt).toLocaleTimeString()}
            </p>
          </div>

          {/* Big Score Badge */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-red-600 text-white shadow-xl shadow-red-600/30 shrink-0 min-w-[140px]">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-100">Estimated</span>
            <div className="text-4xl md:text-5xl font-black tracking-tight my-0.5">
              {result.bandScore.toFixed(1)}
            </div>
            <span className="text-[11px] font-bold text-red-100">IELTS Academic Band</span>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-zinc-800 text-center">
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Raw Score</span>
            <p className="text-lg font-black text-white mt-0.5">
              {result.rawScore} / {result.totalQuestions}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Accuracy</span>
            <p className="text-lg font-black text-white mt-0.5">
              {result.accuracyPercentage}%
            </p>
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Time Spent</span>
            <p className="text-lg font-black text-white mt-0.5 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span>{timeFormatted}</span>
            </p>
          </div>
        </div>

        {/* Decorative blur */}
        <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
      </div>

      {/* Question-by-Question Diagnostic List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-red-600" />
            <span>Question Breakdown & Solutions</span>
          </h2>
          <span className="text-xs text-zinc-400">
            Click any question to view the full explanation
          </span>
        </div>

        <div className="space-y-2.5">
          {result.answers.map((ans) => (
            <div
              key={ans.questionId}
              onClick={() => setSelectedAnswerForModal(ans)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                ans.isCorrect
                  ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 hover:border-red-500'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                    ans.isCorrect
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950'
                      : 'bg-red-600 text-white'
                  }`}>
                    {ans.questionNumber}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      {ans.questionType}
                    </span>
                    <p className="text-xs font-bold text-zinc-950 dark:text-white">
                      {ans.prompt}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                      <span className="text-zinc-500">
                        Your answer: <strong className={ans.isCorrect ? 'text-zinc-950 dark:text-white' : 'text-red-600 dark:text-red-400'}>{ans.userAnswer || '(empty)'}</strong>
                      </span>
                      {!ans.isCorrect && (
                        <span className="text-zinc-500">
                          Correct: <strong className="text-zinc-950 dark:text-white">{ans.correctAnswer}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ans.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-zinc-950 dark:text-white" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retake / Actions */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <Link
          to={`/reading/exam/${result.passageId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake This Exam</span>
        </Link>
        <Link
          to="/reading"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold text-xs transition-colors"
        >
          <span>Explore Other Passages</span>
        </Link>
      </div>

      {/* Explanation Modal */}
      <ExplanationModal
        answer={selectedAnswerForModal}
        onClose={() => setSelectedAnswerForModal(null)}
      />

      {/* RAG AI Tutor in Deep Diagnostic Review Mode */}
      <ReadingAITutorSidebar
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        passageId={result.passageId}
        passageTitle={result.passageTitle}
        isPostExamReview={true}
      />
    </div>
  )
}
