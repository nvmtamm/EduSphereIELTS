import React from 'react'
import type { ReadingQuestion } from '../../types/reading.types'

interface MultipleChoiceRendererProps {
  question: ReadingQuestion
  value: string
  onChange: (val: string) => void
}

export const MultipleChoiceRenderer: React.FC<MultipleChoiceRendererProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
          {question.questionNumber}
        </span>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {question.prompt}
        </p>
      </div>

      <div className="space-y-2 pl-8 pt-1">
        {question.options.map((opt, idx) => {
          const isSelected = value === opt
          const letter = String.fromCharCode(65 + idx) // A, B, C, D
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500 shadow-sm'
                  : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-500'
                }`}
            >
              <span className={`w-5 h-5 rounded-md font-bold text-[11px] flex items-center justify-center shrink-0 transition-colors ${isSelected
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                {letter}
              </span>
              <span className="leading-snug">{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
