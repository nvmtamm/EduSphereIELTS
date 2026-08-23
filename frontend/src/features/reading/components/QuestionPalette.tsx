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
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  flaggedQuestions,
  onSelectQuestion,
  onToggleFlag
}) => {
  const answeredCount = questionIds.filter((id) => answers[id] && answers[id].trim().length > 0).length

  return (
    <div className="p-3.5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-zinc-950 dark:text-white">
            Questions: <span className="text-red-600 dark:text-red-500 font-black">{answeredCount}/{totalQuestions}</span>
          </span>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Answered
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 dark:bg-white inline-block" /> Flagged
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 inline-block" /> Unanswered
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleFlag(currentIndex)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
            flaggedQuestions.has(currentIndex)
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white'
              : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-zinc-300'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentIndex) ? 'fill-white dark:fill-zinc-950' : ''}`} />
          <span>{flaggedQuestions.has(currentIndex) ? 'Flagged' : 'Flag'}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto py-1">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const qId = questionIds[i]
          const isAnswered = Boolean(answers[qId] && answers[qId].trim().length > 0)
          const isCurrent = i === currentIndex
          const isFlagged = flaggedQuestions.has(i)

          let btnClass = 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          if (isAnswered) {
            btnClass = 'bg-red-600 text-white border-red-600 shadow-xs font-bold'
          }
          if (isCurrent) {
            btnClass += ' ring-2 ring-red-600 ring-offset-2 dark:ring-offset-black font-black scale-105'
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectQuestion(i)}
              className={`relative w-8 h-8 rounded-lg text-xs font-bold border flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
            >
              {i + 1}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-zinc-950 dark:bg-white border border-white dark:border-black shadow-xs" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
