import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  BookOpen
} from 'lucide-react';
import type { ListeningTranscript } from '../types/listening';

interface ListeningDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcripts: ListeningTranscript[];
  audioUrl: string;
  testTitle?: string;
}

interface WordComparison {
  word: string;
  status: 'correct' | 'missing' | 'incorrect';
  userWord?: string;
}

export const ListeningDictationModal: React.FC<ListeningDictationModalProps> = ({
  isOpen,
  onClose,
  transcripts,
  audioUrl,
  testTitle = 'IELTS Listening Dictation Practice'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [comparisons, setComparisons] = useState<WordComparison[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSegment = transcripts[currentIndex];

  // Clean and prepare audio playback for the segment
  useEffect(() => {
    setUserInput('');
    setIsChecked(false);
    setComparisons([]);
    setAccuracy(0);
    setIsPlaying(false);
  }, [currentIndex]);

  const playSegment = () => {
    if (!audioRef.current || !currentSegment) return;
    const audio = audioRef.current;
    audio.currentTime = currentSegment.startTimeSeconds;
    audio.playbackRate = playbackRate;
    audio.play();
    setIsPlaying(true);

    const checkEnd = () => {
      if (audio.currentTime >= currentSegment.endTimeSeconds) {
        audio.pause();
        setIsPlaying(false);
        audio.removeEventListener('timeupdate', checkEnd);
      }
    };
    audio.addEventListener('timeupdate', checkEnd);
  };

  const pauseSegment = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleCheck = () => {
    if (!currentSegment || !userInput.trim()) return;

    // Tokenize
    const cleanPunctuation = (w: string) => w.replace(/[^\w]/g, '').toLowerCase();

    const targetWords = currentSegment.textContent
      .split(/\s+/)
      .map(w => w.trim())
      .filter(Boolean);

    const userWords = userInput
      .split(/\s+/)
      .map(w => w.trim())
      .filter(Boolean);

    const results: WordComparison[] = [];
    let correctCount = 0;

    targetWords.forEach((target, i) => {
      const cleanTarget = cleanPunctuation(target);
      const userWord = userWords[i];
      const cleanUser = userWord ? cleanPunctuation(userWord) : '';

      if (cleanTarget === cleanUser) {
        correctCount++;
        results.push({ word: target, status: 'correct', userWord });
      } else if (!userWord) {
        results.push({ word: target, status: 'missing' });
      } else {
        results.push({ word: target, status: 'incorrect', userWord });
      }
    });

    const score = Math.round((correctCount / Math.max(targetWords.length, 1)) * 100);
    setAccuracy(score);
    setComparisons(results);
    setIsChecked(true);
  };

  if (!isOpen || !currentSegment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                IELTS Dictation Studio
              </h3>
              <p className="text-[11px] text-zinc-400">
                Segment {currentIndex + 1} of {transcripts.length} • {currentSegment.speaker}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Audio Controls Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isPlaying ? pauseSegment : playSegment}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause Audio' : 'Play Sentence'}</span>
              </button>

              <button
                type="button"
                onClick={playSegment}
                className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-700/80 p-1 rounded-xl text-xs font-bold">
              {[0.75, 1, 1.25].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    playbackRate === speed
                      ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Typing Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span>Type what you hear word-for-word:</span>
              <span className="text-zinc-400 font-normal">Press Check when ready</span>
            </div>
            <textarea
              rows={3}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Listen carefully and transcribe the audio sentence here..."
              className="w-full p-4 text-sm font-mono-exam bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 leading-relaxed resize-none shadow-xs"
              disabled={isChecked}
            />
          </div>

          {/* Checked Results */}
          {isChecked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Transcription Evaluation</span>
                </div>
                <div className="text-xs font-bold">
                  Accuracy: <span className="font-mono-exam text-sm text-red-600 dark:text-red-400 font-extrabold">{accuracy}%</span>
                </div>
              </div>

              {/* Word-by-Word Diff Badges */}
              <div className="flex flex-wrap gap-1.5 leading-loose">
                {comparisons.map((c, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded-lg text-xs font-mono-exam font-bold ${
                      c.status === 'correct'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : c.status === 'missing'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 underline'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 line-through'
                    }`}
                    title={c.status === 'incorrect' ? `You typed: ${c.userWord}` : c.status === 'missing' ? 'Missed word' : 'Correct'}
                  >
                    {c.word}
                  </span>
                ))}
              </div>

              {/* Official Sentence */}
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                <span className="font-bold text-zinc-900 dark:text-white mr-1">Official Reference:</span>
                "{currentSegment.textContent}"
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {!isChecked ? (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!userInput.trim()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
            >
              Evaluate Transcription
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (currentIndex < transcripts.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>{currentIndex < transcripts.length - 1 ? 'Next Sentence' : 'Finish Dictation'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentIndex(prev => Math.min(prev + 1, transcripts.length - 1))}
            disabled={currentIndex === transcripts.length - 1}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
