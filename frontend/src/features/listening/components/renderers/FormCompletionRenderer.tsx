import React from 'react';
import type { ListeningQuestion } from '../../types/listening';

interface FormCompletionRendererProps {
  question: ListeningQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const FormCompletionRenderer: React.FC<FormCompletionRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false
}) => {
  // Split prompt on blank underscores _______
  const parts = question.prompt.split(/_{3,}/);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed">
        <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md text-xs sm:text-sm">
          {question.questionNumber}
        </span>

        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && (
              <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Type answer..."
                className="inline-block min-w-[140px] max-w-[220px] px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border-2 border-dashed border-red-400/60 dark:border-red-500/50 focus:border-solid focus:border-red-600 rounded-lg text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-zinc-400 placeholder:font-normal"
              />
            )}
          </React.Fragment>
        ))}

        {parts.length === 1 && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="Type answer here..."
            className="w-full sm:w-auto min-w-[200px] px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:border-red-600 rounded-lg text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
          />
        )}
      </div>
    </div>
  );
};
