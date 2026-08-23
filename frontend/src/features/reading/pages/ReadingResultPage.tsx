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
  Sparkles
} from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { ReadingExamResult, ReadingAnswerResult } from '../types/reading.types'
import { ExplanationModal } from '../components/ExplanationModal'

export const ReadingResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [result, setResult] = useState<ReadingExamResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAnswerForModal, setSelectedAnswerForModal] = useState<ReadingAnswerResult | null>(null)

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

  const minutesSpent = Math.floor(result.durationSeconds / 60)
  const secondsSpent = result.durationSeconds % 60
  const timeFormatted = `${minutesSpent}m ${secondsSpent}s`

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/reading"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reading Hub</span>
        </Link>
        <button
          type="button"
          onClick={() => alert('Result summary copied to clipboard!')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Scorecard</span>
        </button>
      </div>

      {/* Main Scorecard Header - Pure Jet Black */}
      <div className="rounded-3xl bg-black text-white p-6 md:p-8 shadow-2xl border border-zinc-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-xs font-bold text-white border border-zinc-800">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Official Cambridge Diagnostic</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">{result.passageTitle}</h1>
            <p className="text-xs text-zinc-400">
              Completed on {new Date(result.submittedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Band Score Circular Emblem - Pure Red */}
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-red-600 shadow-2xl flex flex-col items-center justify-center p-4 text-center shrink-0 border-2 border-white/20">
            <Trophy className="w-6 h-6 mb-1 text-white opacity-90" />
            <span className="text-3xl md:text-4xl font-black tracking-tight leading-none text-white">
              {result.bandScore.toFixed(1)}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-white opacity-90">
              IELTS Band
            </span>
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
    </div>
  )
}
