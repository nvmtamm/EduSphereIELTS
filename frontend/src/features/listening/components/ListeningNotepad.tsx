import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, CheckCircle2 } from 'lucide-react';

interface ListeningNotepadProps {
  testId: string;
  className?: string;
}

export const ListeningNotepad: React.FC<ListeningNotepadProps> = ({ testId, className = '' }) => {
  const storageKey = `edusphere_listening_notes_${testId}`;
  const [notes, setNotes] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setNotes(saved);
    }
  }, [storageKey]);

  const handleChange = (text: string) => {
    setNotes(text);
    localStorage.setItem(storageKey, text);
    setIsSaved(true);
    const timeout = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timeout);
  };

  const handleClear = () => {
    if (window.confirm('Clear all scratchpad notes?')) {
      setNotes('');
      localStorage.removeItem(storageKey);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden ${className}`}>
      <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Live Listening Scratchpad</span>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </span>
          )}
          {notes && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-zinc-400 hover:text-rose-500 rounded-md transition-colors"
              title="Clear notes"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Jot down keywords, numbers, dates, or spelling while listening to audio..."
        className="flex-1 w-full p-4 text-xs sm:text-sm font-mono bg-transparent border-0 focus:ring-0 focus:outline-none text-zinc-800 dark:text-zinc-200 resize-none placeholder:text-zinc-400 leading-relaxed"
      />
    </div>
  );
};
