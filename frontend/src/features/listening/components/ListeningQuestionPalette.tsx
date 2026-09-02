import React from 'react';
import type { ListeningQuestion } from '../types/listening';

interface ListeningQuestionPaletteProps {
  questions: ListeningQuestion[];
  answers: Record<string, string>;
  currentQuestionIndex: number;
  onSelectQuestion: (index: number) => void;
  markedQuestions?: Set<string>;
  onToggleMark?: (questionId: string) => void;
  className?: string;
}

export const ListeningQuestionPalette: React.FC<ListeningQuestionPaletteProps> = ({
  questions,
  answers,
  currentQuestionIndex,
  onSelectQuestion,
  markedQuestions = new Set(),
  onToggleMark,
  className = ''
}) => {
  const answeredCount = questions.filter((q) => answers[q.id]?.trim().length > 0).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className={`p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Question Palette
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {answeredCount} of {questions.length} answered ({progressPercent}%)
          </p>
        </div>

        <div className="w-16 bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-red-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Grid of Question Numbers */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
        {questions.map((q, idx) => {
          const isAnswered = Boolean(answers[q.id]?.trim().length > 0);
          const isCurrent = idx === currentQuestionIndex;
          const isMarked = markedQuestions.has(q.id);

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`relative flex items-center justify-center h-8 rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'ring-2 ring-red-600 ring-offset-2 dark:ring-offset-zinc-900 z-10'
                  : ''
              } ${
                isAnswered
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{q.questionNumber}</span>

              {isMarked && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-600" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-700" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Flagged</span>
        </div>
      </div>
    </div>
  );
};
