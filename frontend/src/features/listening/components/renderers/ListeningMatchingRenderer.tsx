import React from 'react';
import type { ListeningQuestion } from '../../types/listening';

interface ListeningMatchingRendererProps {
  question: ListeningQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const ListeningMatchingRenderer: React.FC<ListeningMatchingRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      {/* Prompt Item */}
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

      {/* Select Dropdown / Option Buttons */}
      <div className="sm:pl-7">
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt, idx) => {
            const match = opt.match(/^([A-Za-z])[\.\)]\s*(.*)$/);
            const letter = match ? match[1].toUpperCase() : String.fromCharCode(65 + idx);
            const optionText = match ? match[2] : opt;
            const isSelected = value?.trim().toUpperCase() === letter;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => !disabled && onChange(letter)}
                disabled={disabled}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/60'
                }`}
              >
                <span className={`font-bold ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                  {letter}.
                </span>
                <span>{optionText}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
