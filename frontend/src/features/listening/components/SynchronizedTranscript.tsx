import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Search, 
  Sparkles, 
  Volume2, 
  ArrowDownCircle, 
  User, 
  Compass, 
  BookmarkCheck 
} from 'lucide-react';
import type { ListeningTranscript } from '../types/listening';
import { formatAudioTime } from '../utils/listeningScoring';

interface SynchronizedTranscriptProps {
  transcripts: ListeningTranscript[];
  currentTime: number;
  onSeek: (timestamp: number) => void;
  onSelectLinkedQuestion?: (questionNumber: number) => void;
  className?: string;
  allowAutoScroll?: boolean;
}

export const SynchronizedTranscript: React.FC<SynchronizedTranscriptProps> = ({
  transcripts,
  currentTime,
  onSeek,
  onSelectLinkedQuestion,
  className = '',
  allowAutoScroll = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(allowAutoScroll);

  // Find active transcript item
  const activeIndex = useMemo(() => {
    return transcripts.findIndex(
      (t) => currentTime >= t.startTimeSeconds && currentTime <= t.endTimeSeconds + 0.5
    );
  }, [transcripts, currentTime]);

  // Smooth scroll to active line
  useEffect(() => {
    if (autoScroll && activeItemRef.current && containerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex, autoScroll]);

  // Filtered transcript search
  const filteredTranscripts = useMemo(() => {
    if (!searchTerm.trim()) return transcripts;
    const term = searchTerm.toLowerCase();
    return transcripts.filter(
      (t) => t.textContent.toLowerCase().includes(term) || t.speaker.toLowerCase().includes(term)
    );
  }, [transcripts, searchTerm]);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden ${className}`}>
      {/* Header with Search and Auto-scroll Toggle */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search transcript dialog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setAutoScroll(!autoScroll)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
            autoScroll
              ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
              : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:text-zinc-800'
          }`}
          title={autoScroll ? 'Auto-scroll is enabled' : 'Auto-scroll is paused'}
        >
          <ArrowDownCircle className={`w-3.5 h-3.5 ${autoScroll ? 'text-red-600 dark:text-red-400' : ''}`} />
          <span className="hidden sm:inline">Sync Scroll</span>
        </button>
      </div>

      {/* Transcript Scrolling List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        {filteredTranscripts.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-sm">
            No matching dialogue found for "{searchTerm}".
          </div>
        ) : (
          filteredTranscripts.map((t, idx) => {
            const isActive = transcripts.indexOf(t) === activeIndex;

            return (
              <motion.div
                key={t.id || idx}
                ref={isActive ? activeItemRef : null}
                onClick={() => onSeek(t.startTimeSeconds)}
                initial={false}
                animate={{
                  scale: isActive ? 1.01 : 1,
                  backgroundColor: isActive ? 'rgba(220, 38, 38, 0.08)' : 'transparent'
                }}
                className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-red-500/40 shadow-xs ring-1 ring-red-500/20'
                    : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                {/* Active Glowing Pulse Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeTranscriptIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Speaker Header & Timestamps */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-red-100 dark:bg-red-900/50 text-red-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                      <User className="w-3 h-3" />
                    </div>
                    <span className={`text-xs font-bold ${isActive ? 'text-red-600 dark:text-red-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {t.speaker}
                    </span>

                    {t.linkedQuestionNumber && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLinkedQuestion?.(t.linkedQuestionNumber!);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all cursor-pointer shadow-2xs"
                        title={`Jump to Question ${t.linkedQuestionNumber}`}
                      >
                        <BookmarkCheck className="w-2.5 h-2.5" />
                        <span>Q{t.linkedQuestionNumber} Anchor</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`font-mono text-[11px] font-medium flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-red-600 group-hover:bg-red-50 dark:group-hover:bg-red-900/30'
                    }`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{formatAudioTime(t.startTimeSeconds)}</span>
                  </button>
                </div>

                {/* Transcript Body */}
                <p className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                  isActive
                    ? 'font-medium text-zinc-950 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200'
                }`}>
                  {t.textContent}
                </p>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
