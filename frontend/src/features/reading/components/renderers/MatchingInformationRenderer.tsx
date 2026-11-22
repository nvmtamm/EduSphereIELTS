import React from 'react'
import type { ReadingQuestion } from '../../types/reading.types'

interface MatchingInformationRendererProps {
  question: ReadingQuestion
  value: string
  onChange: (val: string) => void
}

/** "Which paragraph contains the following information?" - one row, letters A..F as a radio grid. */
export const MatchingInformationRenderer: React.FC<MatchingInformationRendererProps> = ({
  question,
  value,
  onChange
}) => {
  const letters =
    question.options && question.options.length > 0
      ? question.options.map((o) => o.trim().charAt(0).toUpperCase())
      : ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div className="space-y-3.5">
      <div className="flex items-start gap-2.5">
        <span className="w-6 h-6 rounded-md bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center shrink-0">
          {question.questionNumber}
        </span>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">{question.prompt}</p>
      </div>

      <div className="pl-8">
        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Select the paragraph</p>
        <div role="radiogroup" aria-label={`Question ${question.questionNumber}`} className="flex flex-wrap gap-2">
          {letters.map((letter) => {
            const selected = value.trim().toUpperCase() === letter
            return (
              <button
                key={letter}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(letter)}
                className={`w-10 h-10 rounded-xl border text-sm font-black transition-all cursor-pointer ${
                  selected
                    ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/25'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-400'
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
