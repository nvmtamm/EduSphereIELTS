import React from 'react';
import type { ListeningQuestion } from '../../types/listening';

// F-03: TableCompletionRenderer
// Handles the "Table Completion" question type (QuestionType.TableCompletion).
// Renders an HTML table with inline answer inputs for blank cells.
//
// Expected Prompt format (JSON stored in question.prompt):
// {
//   "headers": ["Column A", "Column B", "Column C"],
//   "rows": [
//     ["Value 1", "___", "Value 3"],
//     ["___", "Value 5", "Value 6"]
//   ],
//   "instruction": "Complete the table below."
// }
//
// Blank cells are represented by "___" (3+ underscores).
// The first blank found will be bound to the question's answer value.

interface TableData {
  headers: string[];
  rows: string[][];
  instruction?: string;
}

interface TableCompletionRendererProps {
  question: ListeningQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  isActive?: boolean; // highlighted when this is the current question in palette
}

const BLANK_PATTERN = /_{3,}/;

function parseTableData(prompt: string): TableData | null {
  // Try JSON format first
  try {
    const parsed = JSON.parse(prompt);
    if (parsed.headers && parsed.rows) return parsed as TableData;
  } catch {
    // not JSON
  }
  return null;
}

export const TableCompletionRenderer: React.FC<TableCompletionRendererProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  isActive = false,
}) => {
  const tableData = parseTableData(question.prompt);

  // ── Fallback: treat as plain FormCompletion if prompt is not table JSON ──
  if (!tableData) {
    const parts = question.prompt.split(BLANK_PATTERN);
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <span className="font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md text-xs">
            {question.questionNumber}
          </span>
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <span>{part}</span>
              {i < parts.length - 1 && (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  placeholder="Answer..."
                  className="inline-block min-w-[140px] px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border-2 border-dashed border-red-400/60 focus:border-solid focus:border-red-600 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-zinc-400 placeholder:font-normal"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // ── Table rendering ──────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Question number badge + instruction */}
      <div className="flex items-start gap-2">
        <span className="shrink-0 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-md text-xs">
          {question.questionNumber}
        </span>
        {tableData.instruction && (
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {tableData.instruction}
          </p>
        )}
      </div>

      {/* Table */}
      <div className={`overflow-x-auto rounded-xl border transition-all ${
        isActive
          ? 'border-red-400/60 dark:border-red-500/50 shadow-sm shadow-red-500/10'
          : 'border-zinc-200 dark:border-zinc-700/60'
      }`}>
        <table className="w-full text-xs sm:text-sm border-collapse">
          {/* Header row */}
          {tableData.headers.length > 0 && (
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800/80">
                {tableData.headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-bold text-zinc-700 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-700 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* Data rows */}
          <tbody>
            {tableData.rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
              >
                {row.map((cell, colIdx) => {
                  const isBlank = BLANK_PATTERN.test(cell);
                  return (
                    <td
                      key={colIdx}
                      className="px-3 py-2 align-middle text-zinc-800 dark:text-zinc-200"
                    >
                      {isBlank ? (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          disabled={disabled}
                          placeholder="..."
                          aria-label={`Q${question.questionNumber} answer`}
                          className={`min-w-[100px] max-w-[180px] w-full px-2.5 py-1 text-xs sm:text-sm bg-white dark:bg-zinc-800 border-2 border-dashed rounded-lg font-semibold focus:outline-none focus:ring-2 transition-all placeholder:text-zinc-400 placeholder:font-normal ${
                            isActive
                              ? 'border-red-500/60 focus:border-red-600 focus:ring-red-500/20'
                              : 'border-zinc-300 dark:border-zinc-600 focus:border-red-500 focus:ring-red-500/10'
                          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                      ) : (
                        <span>{cell}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
