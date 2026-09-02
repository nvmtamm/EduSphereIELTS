import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Trophy,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { listeningApi } from '../api/listeningApi';
import type { ListeningTestDetail } from '../types/listening';
import { formatAudioTime, getAccentBadge } from '../utils/listeningScoring';

interface DictationUnit {
  id: string;
  unitIndex: number;
  speaker: string;
  sectionNumber: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  text: string;
  wordCount: number;
}

interface WordComparison {
  word: string;
  status: 'correct' | 'missing' | 'incorrect';
  userWord?: string;
}

export const ListeningDictationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<ListeningTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Dictation State
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [checkedUnits, setCheckedUnits] = useState<Record<number, { accuracy: number; comparisons: WordComparison[] }>>({});
  const [showHint, setShowHint] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Load test data
  useEffect(() => {
    if (!id) return;
    const fetchTest = async () => {
      try {
        setLoading(true);
        const data = await listeningApi.getTestById(id);
        setTest(data);
      } catch (err: any) {
        console.error('Failed to load test for dictation:', err);
        setError(err?.response?.data?.message || 'Could not load exam data.');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  // Split transcripts into 1-2 sentence units (max 3 if short)
  const dictationUnits = useMemo<DictationUnit[]>(() => {
    if (!test || !test.transcripts || test.transcripts.length === 0) return [];

    const units: DictationUnit[] = [];
    let counter = 0;

    test.transcripts.forEach((tr, trIdx) => {
      // Slicing into 1-2 sentences:
      // If a transcript chunk has 1 or 2 sentences, keep it whole.
      // If it contains multiple sentences, chunk by 1-2 sentences.
      const rawSentences = tr.textContent
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(Boolean);

      if (rawSentences.length <= 2) {
        units.push({
          id: `${tr.id || trIdx}-0`,
          unitIndex: counter++,
          speaker: tr.speaker,
          sectionNumber: tr.sectionNumber,
          startTimeSeconds: tr.startTimeSeconds,
          endTimeSeconds: tr.endTimeSeconds,
          text: tr.textContent,
          wordCount: tr.textContent.split(/\s+/).filter(Boolean).length
        });
      } else {
        // Group sentences into chunks of 1-2 sentences (max 3 if very short)
        let i = 0;
        const totalDuration = Math.max(tr.endTimeSeconds - tr.startTimeSeconds, 2);
        const totalChars = tr.textContent.length;
        let runningStart = tr.startTimeSeconds;

        while (i < rawSentences.length) {
          // Take 2 sentences, or 3 if all are short (< 15 words)
          let takeCount = 2;
          const candidateThree = rawSentences.slice(i, i + 3).join(' ');
          if (candidateThree.split(/\s+/).length <= 25 && i + 3 <= rawSentences.length) {
            takeCount = 3;
          } else if (i + 1 === rawSentences.length) {
            takeCount = 1;
          }

          const chunkText = rawSentences.slice(i, i + takeCount).join(' ');
          const chunkRatio = chunkText.length / Math.max(totalChars, 1);
          const chunkDuration = totalDuration * chunkRatio;
          const chunkEnd = Math.min(runningStart + chunkDuration, tr.endTimeSeconds);

          units.push({
            id: `${tr.id || trIdx}-${i}`,
            unitIndex: counter++,
            speaker: tr.speaker,
            sectionNumber: tr.sectionNumber,
            startTimeSeconds: runningStart,
            endTimeSeconds: chunkEnd,
            text: chunkText,
            wordCount: chunkText.split(/\s+/).filter(Boolean).length
          });

          runningStart = chunkEnd;
          i += takeCount;
        }
      }
    });

    return units;
  }, [test]);

  const currentUnit = dictationUnits[currentUnitIndex];
  const currentUserText = userInputs[currentUnitIndex] || '';
  const currentCheck = checkedUnits[currentUnitIndex];

  // Stop playback when unit changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setShowHint(false);
  }, [currentUnitIndex]);

  // Audio Playback Controls
  const playCurrentUnit = () => {
    if (!audioRef.current || !currentUnit) return;
    const audio = audioRef.current;
    audio.currentTime = currentUnit.startTimeSeconds;
    audio.playbackRate = playbackRate;
    audio.play().catch(console.error);
    setIsPlaying(true);

    const onTimeUpdate = () => {
      if (audio.currentTime >= currentUnit.endTimeSeconds) {
        audio.pause();
        setIsPlaying(false);
        audio.removeEventListener('timeupdate', onTimeUpdate);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
  };

  const pauseAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  // Evaluation / Diff logic
  const handleCheckTranscription = () => {
    if (!currentUnit || !currentUserText.trim()) return;

    const clean = (w: string) => w.replace(/[^\w]/g, '').toLowerCase();

    const targetWords = currentUnit.text.split(/\s+/).map(w => w.trim()).filter(Boolean);
    const userWords = currentUserText.split(/\s+/).map(w => w.trim()).filter(Boolean);

    const results: WordComparison[] = [];
    let correctCount = 0;

    targetWords.forEach((target, i) => {
      const cleanTarget = clean(target);
      const userWord = userWords[i];
      const cleanUser = userWord ? clean(userWord) : '';

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

    setCheckedUnits(prev => ({
      ...prev,
      [currentUnitIndex]: {
        accuracy: score,
        comparisons: results
      }
    }));
  };

  // Overall session statistics
  const completedCount = Object.keys(checkedUnits).length;
  const totalUnits = dictationUnits.length;
  const progressPercent = totalUnits > 0 ? Math.round((completedCount / totalUnits) * 100) : 0;
  const averageAccuracy = useMemo(() => {
    const scores = Object.values(checkedUnits).map(c => c.accuracy);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [checkedUnits]);

  // Hint Generator
  const hintText = useMemo(() => {
    if (!currentUnit) return '';
    return currentUnit.text
      .split(/\s+/)
      .map(w => {
        if (w.length <= 2) return w;
        return w[0] + '_'.repeat(w.length - 1);
      })
      .join(' ');
  }, [currentUnit]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm">Preparing IELTS Dictation Studio & Audio Script Slices...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Dictation Not Available</h2>
        <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">{error || 'Test was not found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/listening')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
        >
          Return to Listening Hub
        </button>
      </div>
    );
  }

  const accentBadge = getAccentBadge(test.accent);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 p-4 sm:p-6">
      {/* Hidden audio element streaming from AWS S3 */}
      <audio ref={audioRef} src={test.audioUrl} preload="auto" />

      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/listening')}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Back to Listening Tests"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${accentBadge.bgClass} ${accentBadge.textClass}`}>
                <span>{accentBadge.flag}</span>
                <span>{accentBadge.label}</span>
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                {test.collectionName}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white mt-0.5">
              Dictation Studio: <span className="text-red-600">{test.title}</span>
            </h1>
          </div>
        </div>

        {/* Global Progress Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <span>Progress: </span>
            <span className="text-red-600 dark:text-red-400 font-mono-exam">{completedCount}</span> / {totalUnits} Sentences ({progressPercent}%)
          </div>
        </div>
      </div>

      {/* 2. Sentence Quick Jump Strip */}
      <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-zinc-400 shrink-0 px-2 uppercase tracking-wider">Sentences:</span>
        {dictationUnits.map((u, idx) => {
          const isCurrent = idx === currentUnitIndex;
          const isDone = Boolean(checkedUnits[idx]);
          const acc = checkedUnits[idx]?.accuracy ?? 0;

          return (
            <button
              key={u.id}
              type="button"
              onClick={() => setCurrentUnitIndex(idx)}
              className={`flex items-center justify-center min-w-[34px] h-8 px-2 rounded-xl text-xs font-bold font-mono-exam transition-all shrink-0 cursor-pointer ${
                isCurrent
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-105'
                  : isDone
                  ? acc >= 80
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-300 dark:border-amber-800'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title={`Sentence ${idx + 1}: ${u.speaker} (${formatAudioTime(u.startTimeSeconds)})`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* 3. Main Dictation Workspace */}
      {currentUnit && (
        <motion.div
          key={currentUnit.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-lg p-6 sm:p-8 space-y-6"
        >
          {/* Unit Metadata & Audio Controller */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                  Sentence {currentUnitIndex + 1} of {totalUnits}
                </span>
                <span className="text-xs font-semibold text-zinc-500">
                  Speaker: <strong className="text-zinc-900 dark:text-white">{currentUnit.speaker}</strong>
                </span>
                <span className="text-xs text-zinc-400">• Part {currentUnit.sectionNumber}</span>
              </div>
              <p className="text-xs text-zinc-400 font-mono-exam">
                Timestamp: {formatAudioTime(currentUnit.startTimeSeconds)} – {formatAudioTime(currentUnit.endTimeSeconds)}
              </p>
            </div>

            {/* Audio Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={isPlaying ? pauseAudio : playCurrentUnit}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-red-600/25 active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause Sentence' : 'Play Sentence'}</span>
              </button>

              <button
                type="button"
                onClick={playCurrentUnit}
                className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                title="Replay Sentence from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Playback Rate Selector */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
                {[0.75, 1, 1.25].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setPlaybackRate(speed)}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      playbackRate === speed
                        ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typing Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
              <span>Type the spoken sentence (word-for-word):</span>
              <button
                type="button"
                onClick={() => setShowHint(prev => !prev)}
                className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showHint ? 'Hide Hint' : 'Show Word Hints'}</span>
              </button>
            </div>

            {/* Hint Box (if toggled) */}
            {showHint && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs font-mono-exam text-amber-800 dark:text-amber-300 leading-relaxed">
                <span className="font-bold mr-1.5">Hints:</span>
                {hintText}
              </div>
            )}

            <textarea
              rows={4}
              value={currentUserText}
              onChange={(e) => setUserInputs(prev => ({ ...prev, [currentUnitIndex]: e.target.value }))}
              placeholder="Listen to the audio sentence above and transcribe what you hear here..."
              disabled={Boolean(currentCheck)}
              className="w-full p-5 text-sm sm:text-base font-mono-exam bg-zinc-50/70 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-zinc-950 dark:text-white placeholder:text-zinc-400 leading-relaxed resize-none shadow-xs"
            />
          </div>

          {/* Action Row */}
          {!currentCheck ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCheckTranscription}
                disabled={!currentUserText.trim()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Check Sentence Accuracy</span>
              </button>
            </div>
          ) : (
            /* Word Diff Results */
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-bold text-zinc-950 dark:text-white">Transcription Accuracy</span>
                </div>
                <div className="text-sm font-bold">
                  Score: <span className="font-mono-exam text-base text-red-600 dark:text-red-400 font-black">{currentCheck.accuracy}%</span>
                </div>
              </div>

              {/* Word by word highlight */}
              <div className="flex flex-wrap gap-2 leading-loose">
                {currentCheck.comparisons.map((c, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-mono-exam font-bold ${
                      c.status === 'correct'
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : c.status === 'missing'
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 underline'
                        : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 line-through'
                    }`}
                    title={c.status === 'incorrect' ? `You wrote: "${c.userWord}"` : c.status === 'missing' ? 'Omitted word' : 'Correct'}
                  >
                    {c.word}
                  </span>
                ))}
              </div>

              {/* Official Sentence Script */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 leading-relaxed">
                <span className="font-bold text-zinc-950 dark:text-white mr-1.5">Official Cambridge Script:</span>
                "{currentUnit.text}"
              </div>
            </motion.div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setCurrentUnitIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentUnitIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Sentence</span>
            </button>

            {currentUnitIndex < totalUnits - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentUnitIndex(prev => prev + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
              >
                <span>Next Sentence</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCompletedModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>Complete Dictation Studio</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 4. Completion Celebration Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-zinc-950 dark:text-white">
                Dictation Studio Completed!
              </h3>
              <p className="text-xs text-zinc-500">
                You have transcribed all {totalUnits} audio sentence units for this exam.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-500">Sentences Completed:</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono-exam">{completedCount} / {totalUnits}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-500">Average Transcription Accuracy:</span>
                <span className="font-bold text-emerald-600 font-mono-exam">{averageAccuracy}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/listening')}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Hub
              </button>
              <button
                type="button"
                onClick={() => {
                  setCheckedUnits({});
                  setUserInputs({});
                  setCurrentUnitIndex(0);
                  setIsCompletedModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 transition-all cursor-pointer"
              >
                Restart Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
