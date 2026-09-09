import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { writingApi } from '../api/writingApi'
import type { WritingSubmissionDetail } from '../types/writing.types'
import { WritingScorecard } from '../components/WritingScorecard'
import { WritingAITutorChat } from '../components/WritingAITutorChat'
import { ArrowLeft, RotateCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react'

export const WritingResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState<WritingSubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchResult(id)
  }, [id])

  const fetchResult = async (submissionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await writingApi.getSubmissionById(submissionId)
      setSubmission(data)
    } catch (err: any) {
      console.error('Failed to load submission result', err)
      setError('Could not find or load this writing submission result.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <span className="text-sm font-semibold">Loading IELTS AI Diagnostic Scorecard...</span>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Submission not found</h3>
        <p className="text-sm text-zinc-500">{error}</p>
        <button
          onClick={() => navigate('/writing')}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold"
        >
          Back to Writing Practice
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/writing"
            className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors shadow-xs"
            title="Back to Writing Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-black text-red-600 dark:text-red-500">
                AI Diagnostic Scorecard
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-zinc-500">{submission.taskType}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
              {submission.promptTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/writing/exam/${submission.promptId}`}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Again</span>
          </Link>
        </div>
      </div>

      {/* Main Scorecard Component */}
      <WritingScorecard submission={submission} />

      {/* Interactive AI Tutor Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">
            Discuss Your Essay With AI Examiner
          </h2>
        </div>
        <WritingAITutorChat
          submissionId={submission.id}
          overallBand={submission.overallBandScore}
        />
      </div>
    </div>
  )
}
