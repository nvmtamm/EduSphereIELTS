import React, { useState } from 'react'
import { Lightbulb, Loader2, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { ReadingHint } from '../types/reading.types'

interface HintLadderPanelProps {
  passageId: string
  questionId: string
  questionNumber: number
}

/**
 * Practice-mode helper: reveals up to four progressive hints per question
 * (Understand -> Locate -> Read evidence -> Check & choose). Hints are fetched lazily. Render with `key={questionId}`
 * so the state resets when the learner moves to another question.
 */
export const HintLadderPanel: React.FC<HintLadderPanelProps> = ({ passageId, questionId, questionNumber }) => {
  const [open, setOpen] = useState(false)
  const [hints, setHints] = useState<ReadingHint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const revealNext = async () => {
    if (loading) return
    const nextStep = hints.length + 1
    try {
      setLoading(true)
      setError(null)
      const hint = await readingApi.getHint(passageId, questionId, nextStep)
      setHints((prev) => [...prev, hint])
      setOpen(true)
    } catch (err) {
      console.error('Failed to load hint', err)
      setError('Could not load the hint. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const last = hints[hints.length - 1]
  const canRevealMore = hints.length === 0 || last?.hasNextStep

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20">
      <button
        type="button"
        onClick={() => (hints.length === 0 ? revealNext() : setOpen((o) => !o))}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-300">
          <Lightbulb className="w-4 h-4" />
          Hints for question {questionNumber}
          {hints.length > 0 && <span className="font-semibold text-amber-600">({hints.length}/4 used)</span>}
        </span>
        {hints.length > 0 && (open ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />)}
        {hints.length === 0 && loading && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
      </button>

      {open && hints.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          <ol className="space-y-2.5">
            {hints.map((h) => (
              <li key={h.step} className="rounded-xl bg-white dark:bg-zinc-900 border border-amber-100 dark:border-zinc-800 p-3">
                <p className="text-[11px] font-black uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Step {h.step} · {h.title}
                </p>
                <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{h.content}</p>
                {h.relevantParagraph && (
                  <p className="mt-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Look in: {h.relevantParagraph}</p>
                )}
              </li>
            ))}
          </ol>

          {error && <p className="text-[11px] font-semibold text-rose-600">{error}</p>}

          {canRevealMore && (
            <button
              type="button"
              onClick={revealNext}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              {hints.length === 3 ? 'Reveal the answer' : 'Show another hint'}
            </button>
          )}
        </div>
      )}

      {hints.length === 0 && error && <p className="px-4 pb-3 text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  )
}
