import React from 'react'
import type { ReadingQuestion } from '../../types/reading.types'

interface TrueFalseNotGivenRendererProps {
  question: ReadingQuestion
  value: string
  onChange: (val: string) => void
}

export const TrueFalseNotGivenRenderer: React.FC<TrueFalseNotGivenRendererProps> = ({
  question,
  value,
  onChange
}) => {
  const options = question.options.length > 0
    ? question.options
    : ['TRUE', 'FALSE', 'NOT GIVEN']

  return (
    <div className="space-y-3.5">
      <div className="flex items-start gap-2.5">
        <span className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">
          {question.questionNumber}
        </span>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {question.prompt}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-1 pl-8">
        {options.map((opt) => {
          const isSelected = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer text-center ${
                isSelected
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-400/40'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400 dark:hover:border-rose-500'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
