import React from 'react'
import type { ReadingQuestion } from '../../types/reading.types'
import { Check } from 'lucide-react'

interface MatchingHeadingsRendererProps {
  question: ReadingQuestion
  value: string
  onChange: (val: string) => void
}

export const MatchingHeadingsRenderer: React.FC<MatchingHeadingsRendererProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">
          {question.questionNumber}
        </span>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {question.prompt}
        </p>
      </div>

      <div className="space-y-2 pl-8 pt-1">
        {question.options.map((opt) => {
          const isSelected = value === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-600 text-rose-950 dark:text-rose-200 ring-1 ring-rose-500 shadow-sm'
                  : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400 dark:hover:border-rose-500'
              }`}
            >
              <span>{opt}</span>
              {isSelected && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 ml-2">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
