import React from 'react';
import type { ListeningQuestion } from '../../types/listening';

interface MapDiagramLabellingRendererProps {
  question: ListeningQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const MapDiagramLabellingRenderer: React.FC<MapDiagramLabellingRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="space-y-3 p-4 bg-zinc-50/50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl">
      {/* Question Prompt */}
      <div className="flex items-start gap-2.5">
        <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md text-xs sm:text-sm mt-0.5">
          {question.questionNumber}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
            {question.prompt}
          </p>
        </div>
      </div>

      {/* Letter Selectors Grid */}
      <div className="sm:pl-7">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          Select the location marker letter corresponding to the map:
        </p>
        <div className="flex flex-wrap gap-2">
          {letters.map((letter) => {
            const isSelected = value?.trim().toUpperCase() === letter;

            return (
              <button
                key={letter}
                type="button"
                onClick={() => !disabled && onChange(letter)}
                disabled={disabled}
                className={`flex items-center justify-center w-9 h-9 rounded-xl font-bold text-sm border transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-zinc-700'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
