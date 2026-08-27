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
  const isYesNo = question.questionType === 'YesNoNotGiven' ||
    question.prompt.toLowerCase().includes('yes') ||
    (question.options && question.options.some(o => o.toUpperCase() === 'YES'))

  const defaultOptions = isYesNo
    ? ['YES', 'NO', 'NOT GIVEN']
    : ['TRUE', 'FALSE', 'NOT GIVEN']

  const validOptions = question.options && question.options.length === 3 &&
    (question.options.includes('YES') || question.options.includes('TRUE'))
    ? question.options
    : defaultOptions

  return (
    <div className="space-y-3.5">
      <div className="flex items-start gap-2.5">
        <span className="w-6 h-6 rounded-md bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-xs flex items-center justify-center shrink-0">
          {question.questionNumber}
        </span>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
          {question.prompt}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 pt-1 pl-8">
        {validOptions.map((opt) => {
          const isSelected = value.trim().toUpperCase() === opt.toUpperCase()
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold tracking-wide transition-all cursor-pointer text-center ${isSelected
                  ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-500/25 ring-2 ring-red-400/40'
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-red-400 dark:hover:border-red-500'
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
