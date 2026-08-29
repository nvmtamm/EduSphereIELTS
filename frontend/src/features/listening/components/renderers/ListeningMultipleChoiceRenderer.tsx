import React from 'react';
import type { ListeningQuestion } from '../../types/listening';

interface ListeningMultipleChoiceRendererProps {
  question: ListeningQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isMultiSelect?: boolean;
}

export const ListeningMultipleChoiceRenderer: React.FC<ListeningMultipleChoiceRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  isMultiSelect = false
}) => {
  const selectedValues = isMultiSelect 
    ? (value ? value.split(',').map((s) => s.trim().toUpperCase()) : [])
    : [value?.trim().toUpperCase()];

  const handleSelect = (optionLetter: string) => {
    if (disabled) return;

    if (isMultiSelect) {
      let updated: string[];
      if (selectedValues.includes(optionLetter)) {
        updated = selectedValues.filter((v) => v !== optionLetter);
      } else {
        updated = [...selectedValues, optionLetter];
      }
      onChange(updated.sort().join(', '));
    } else {
      onChange(optionLetter);
    }
  };

  return (
    <div className="space-y-3">
      {/* Prompt Header */}
      <div className="flex items-start gap-2.5">
        <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md text-xs sm:text-sm mt-0.5">
          {question.questionNumber}
        </span>
        <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
          {question.prompt}
        </p>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 gap-2 sm:pl-7">
        {question.options.map((opt, idx) => {
          // Extract letter prefix if present (e.g. "A. Option Text" -> "A")
          const match = opt.match(/^([A-Za-z])[\.\)]\s*(.*)$/);
          const letter = match ? match[1].toUpperCase() : String.fromCharCode(65 + idx);
          const optionText = match ? match[2] : opt;
          const isSelected = selectedValues.includes(letter);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(letter)}
              disabled={disabled}
              className={`flex items-start gap-3 p-3 text-left rounded-xl border transition-all text-xs sm:text-sm ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-white dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              } disabled:cursor-not-allowed`}
            >
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {letter}
              </span>
              <span className="leading-relaxed mt-0.5">{optionText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
