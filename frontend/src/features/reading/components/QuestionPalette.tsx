import React from 'react'
import { Bookmark } from 'lucide-react'

interface QuestionPaletteProps {
  totalQuestions: number
  currentIndex: number
  answers: Record<string, string>
  questionIds: string[]
  flaggedQuestions: Set<number>
  onSelectQuestion: (index: number) => void
  onToggleFlag: (index: number) => void
  partRange?: {
    name: string
    startIndex: number
    endIndex: number
  }
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  flaggedQuestions,
  onSelectQuestion,
  onToggleFlag,
  partRange
}) => {
  const startIndex = partRange ? partRange.startIndex : 0
  const endIndex = partRange ? partRange.endIndex : totalQuestions - 1

  const partIndices: number[] = []
  for (let i = startIndex; i <= endIndex; i++) {
    if (i < totalQuestions) {
      partIndices.push(i)
    }
  }

  const answeredCount = questionIds.filter((id) => answers[id] && answers[id].trim().length > 0).length
  const partAnsweredCount = partIndices.filter((idx) => {
    const qId = questionIds[idx]
    return answers[qId] && answers[qId].trim().length > 0
  }).length

  return (
    <div className="p-3.5 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-slate-900 dark:text-white">
            {partRange ? `${partRange.name} (` : 'Questions: '}
            <span className="text-red-600 dark:text-red-500 font-black">
              {partRange ? `${partAnsweredCount}/${partIndices.length}` : `${answeredCount}/${totalQuestions}`}
            </span>
            {partRange ? ` Answered • Total: ${answeredCount}/${totalQuestions})` : ''}
          </span>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Answered
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white inline-block" /> Flagged
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 inline-block" /> Unanswered
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleFlag(currentIndex)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
            flaggedQuestions.has(currentIndex)
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-slate-300'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentIndex) ? 'fill-white dark:fill-slate-900' : ''}`} />
          <span>{flaggedQuestions.has(currentIndex) ? 'Flagged' : 'Flag'}</span>
        </button>
      </div>

      {/* Question Number Buttons Grid with safe padding to prevent ring clipping */}
      <div className="p-1.5 overflow-x-auto">
        <div className="flex flex-wrap gap-2 py-1 items-center">
          {partIndices.map((i) => {
            const qId = questionIds[i]
            const isAnswered = Boolean(answers[qId] && answers[qId].trim().length > 0)
            const isCurrent = i === currentIndex
            const isFlagged = flaggedQuestions.has(i)

            let btnClass = 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
            if (isAnswered) {
              btnClass = 'bg-red-600 text-white border-red-600 shadow-xs font-bold'
            }
            if (isCurrent) {
              btnClass += ' ring-2 ring-red-600 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 font-black shadow-xs'
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectQuestion(i)}
                className={`relative w-8.5 h-8.5 rounded-xl text-xs font-bold border flex items-center justify-center transition-all cursor-pointer shrink-0 ${btnClass}`}
              >
                {i + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white border border-white dark:border-black shadow-xs" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
