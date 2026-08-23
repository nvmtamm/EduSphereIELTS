import React from 'react'
import { X, CheckCircle2, XCircle, BookOpen, Lightbulb } from 'lucide-react'
import type { ReadingAnswerResult } from '../types/reading.types'

interface ExplanationModalProps {
  answer: ReadingAnswerResult | null
  onClose: () => void
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ answer, onClose }) => {
  if (!answer) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
              answer.isCorrect
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}>
              Q{answer.questionNumber}
            </span>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Question Breakdown & Solution
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {answer.questionType}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {answer.prompt}
        </div>

        {/* User Answer vs Correct Answer */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl border text-xs space-y-1 ${
            answer.isCorrect
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              {answer.isCorrect ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <XCircle className="w-3 h-3 text-rose-600" />
              )}
              Your Answer
            </span>
            <p className={`font-semibold ${
              answer.isCorrect
                ? 'text-emerald-800 dark:text-emerald-200'
                : 'text-rose-800 dark:text-rose-200'
            }`}>
              {answer.userAnswer || '(No answer provided)'}
            </p>
          </div>

          <div className="p-3 rounded-xl border bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              Correct Answer
            </span>
            <p className="font-bold text-blue-900 dark:text-blue-200">
              {answer.correctAnswer}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Cambridge IELTS Explanation & Evidence:</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
            {answer.explanation || 'No additional explanation required for this question.'}
          </div>
        </div>

        {/* Close CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
