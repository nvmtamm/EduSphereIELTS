import React from 'react'
import type { ReadingQuestion } from '../../types/reading.types'
import { Edit3 } from 'lucide-react'

interface SummaryCompletionRendererProps {
  question: ReadingQuestion
  value: string
  onChange: (val: string) => void
}

export const SummaryCompletionRenderer: React.FC<SummaryCompletionRendererProps> = ({
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
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {question.prompt}
          </p>
          <span className="inline-block text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            Write NO MORE THAN TWO WORDS from the passage.
          </span>
        </div>
      </div>

      <div className="pl-8 pt-1">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  )
}
