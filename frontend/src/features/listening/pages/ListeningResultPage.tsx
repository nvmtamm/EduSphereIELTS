import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  AlertCircle,
  BarChart3,
  BookmarkCheck,
  FileText,
  Play,
  Bot,
  HelpCircle,
  Headphones
} from 'lucide-react';
import { listeningApi } from '../api/listeningApi';
import type { ListeningResult, ListeningSectionBreakdown, ListeningAnswerResult } from '../types/listening';
import { SynchronizedTranscript } from '../components/SynchronizedTranscript';
import { 
  formatAudioTime, 
  getBandScoreDescription 
} from '../utils/listeningScoring';

export const ListeningResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<ListeningResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [currentAudioTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'review' | 'transcript'>('review');
  const [activeFilter, setActiveFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  // Animated band score counter
  const [displayScore, setDisplayScore] = useState(0);

  // AI Diagnostic Tutor State (F-05)
  const [aiExplanations, setAiExplanations] = useState<Record<string, import('../types/listening').ListeningAIExplanation>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const handleAskAITutor = async (questionId: string, userAnswer?: string) => {
    if (aiExplanations[questionId]) return;
    try {
      setLoadingAiId(questionId);
      const explanation = await listeningApi.explainQuestion(questionId, userAnswer);
      setAiExplanations((prev) => ({ ...prev, [questionId]: explanation }));
    } catch (err) {
      console.error('Failed to get AI explanation:', err);
    } finally {
      setLoadingAiId(null);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await listeningApi.getSubmissionById(id);
        setResult(data);

        // Animate counter
        const target = data.bandScore;
        const duration = 1200;
        const steps = 30;
        const stepTime = duration / steps;
        let current = 0;
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setDisplayScore(target);
            clearInterval(timer);
          } else {
            setDisplayScore(Math.round(current * 10) / 10);
          }
        }, stepTime);

        // Confetti celebration if band >= 7.0
        if (target >= 7.0) {
          setTimeout(() => {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.55 },
              colors: ['#DC2626', '#10B981', '#F59E0B', '#3B82F6']
            });
          }, 600);
        }
      } catch (err: any) {
        console.error('Failed to load submission result:', err);
        setError(err?.response?.data?.message || 'Failed to load exam result.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm">Evaluating Cambridge IELTS Listening Band Diagnostic...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Result Not Available</h2>
        <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">{error || 'Submission was not found.'}</p>
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

  const bandDesc = getBandScoreDescription(result.bandScore);

  const filteredAnswers = result.answers.filter((ans) => {
    if (activeFilter === 'incorrect') return !ans.isCorrect;
    if (activeFilter === 'correct') return ans.isCorrect;
    return true;
  });

  const incorrectCount = result.answers.filter(a => !a.isCorrect).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 p-4 sm:p-6">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => navigate('/listening')}
          className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listening Hub</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/listening/dictation/${result.testId}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Practice transcribing audio scripts for this exam"
          >
            <Headphones className="w-3.5 h-3.5 text-red-500" />
            <span>Practice Dictation on Test</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/listening/exam/${result.testId}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Exam</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Band Score & Performance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-zinc-800"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-zinc-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Cambridge IELTS Diagnostic Result</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
              {result.testTitle}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Exam submitted on {new Date(result.completedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} • Completed in {formatAudioTime(result.durationSeconds)}
            </p>
          </div>

          {/* Band Score Trophy Badge with Animated Counter */}
          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-3xl shrink-0 shadow-2xl">
            <div className="p-4 rounded-2xl bg-amber-400 text-zinc-950 shadow-md">
              <Trophy className="w-9 h-9" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-red-300 tracking-wider">
                Overall Band Score
              </div>
              <div className="text-4xl sm:text-6xl font-black tracking-tight font-mono-exam">
                {displayScore.toFixed(1)}
              </div>
              <div className="text-xs font-bold text-zinc-300 mt-1">
                {bandDesc.tier}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Stats Counters */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 bg-white/5 rounded-2xl text-center border border-white/5">
            <div className="text-xs text-zinc-400 font-medium">Raw Correct Score</div>
            <div className="text-xl sm:text-2xl font-bold font-mono-exam mt-1 text-white">
              {result.rawScore} <span className="text-sm font-normal text-zinc-400">/ {result.totalQuestions}</span>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl text-center border border-white/5">
            <div className="text-xs text-zinc-400 font-medium">Overall Accuracy</div>
            <div className="text-xl sm:text-2xl font-bold font-mono-exam mt-1 text-emerald-400">
              {result.accuracyPercentage}%
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl text-center border border-white/5">
            <div className="text-xs text-zinc-400 font-medium">Time Taken</div>
            <div className="text-xl sm:text-2xl font-bold font-mono-exam mt-1 text-zinc-200">
              {formatAudioTime(result.durationSeconds)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Section-by-Section Diagnostic Breakdown */}
      {result.sectionBreakdowns && result.sectionBreakdowns.length > 0 && (
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                Part-by-Part Diagnostic Analysis
              </h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500">Cambridge Band Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.sectionBreakdowns.map((sec: ListeningSectionBreakdown) => (
              <div
                key={sec.sectionNumber}
                className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-800 dark:text-zinc-200">Part {sec.sectionNumber}</span>
                  <span className="text-red-600 dark:text-red-400 font-mono-exam text-sm font-extrabold">{sec.accuracyPercentage}%</span>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {sec.sectionTitle}
                </p>

                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sec.accuracyPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      sec.accuracyPercentage >= 75
                        ? 'bg-emerald-500'
                        : sec.accuracyPercentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-semibold text-zinc-400 pt-0.5">
                  <span>Score</span>
                  <span className="font-mono-exam text-zinc-700 dark:text-zinc-300 font-bold">{sec.rawScore} / {sec.totalQuestions} Correct</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Tab Switcher & Question Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Main Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'review'
                ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Question Review ({result.answers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'transcript'
                ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Synchronized Transcript</span>
          </button>
        </div>

        {/* Filter for questions (All / Incorrect / Correct) */}
        {activeTab === 'review' && (
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white font-bold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              All ({result.answers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('incorrect')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeFilter === 'incorrect'
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-700'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Incorrect ({incorrectCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('correct')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeFilter === 'correct'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Correct ({result.answers.length - incorrectCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Review Body */}
      {activeTab === 'review' ? (
        <div className="space-y-4">
          {filteredAnswers.map((ans: ListeningAnswerResult) => (
            <motion.div
              key={ans.questionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-3xl border transition-all ${
                ans.isCorrect
                  ? 'bg-white dark:bg-zinc-900 border-emerald-500/30 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-rose-500/30 shadow-xs'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black shrink-0 font-mono-exam ${
                      ans.isCorrect
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {ans.questionNumber}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Part {ans.sectionNumber} • {ans.questionType}
                    </span>
                    <h4 className="text-sm sm:text-base font-semibold text-zinc-950 dark:text-white mt-1 leading-snug">
                      {ans.prompt}
                    </h4>
                  </div>
                </div>

                {/* Audio Cue Button */}
                {ans.timestampSeconds > 0 && (
                  <button
                    type="button"
                    onClick={() => setSeekTime(ans.timestampSeconds)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0 cursor-pointer"
                    title="Jump audio to answer timestamp"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Cue {formatAudioTime(ans.timestampSeconds)}</span>
                  </button>
                )}
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                {/* User Answer */}
                <div className={`p-4 rounded-2xl border ${
                  ans.isCorrect
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>Your Answer:</span>
                  </div>
                  <div className={`text-base font-bold font-mono-exam ${
                    ans.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300 line-through'
                  }`}>
                    {ans.userAnswer || '(No answer provided)'}
                  </div>
                </div>

                {/* Correct Answer */}
                <div className="p-4 bg-zinc-50/80 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
                  <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Official Cambridge Answer:
                  </div>
                  <div className="text-base font-bold font-mono-exam text-zinc-950 dark:text-white">
                    {ans.correctAnswer}
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              {ans.explanation && (
                <div className="mt-3.5 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed border border-zinc-100 dark:border-zinc-800/60">
                  <span className="font-bold text-red-600 dark:text-red-400 mr-1.5">Academic Analysis:</span>
                  {ans.explanation}
                </div>
              )}

              {/* AI Diagnostic Tutor Button & Panel (F-05) */}
              <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/60">
                {!aiExplanations[ans.questionId] ? (
                  <button
                    type="button"
                    onClick={() => handleAskAITutor(ans.questionId, ans.userAnswer)}
                    disabled={loadingAiId === ans.questionId}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {loadingAiId === ans.questionId ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <span>Generating Cambridge AI Diagnostic...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span>Ask AI Diagnostic Tutor</span>
                      </>
                    )}
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-3.5 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                        <Sparkles className="w-4 h-4 text-red-500" />
                        <span>EduSphere AI IELTS Diagnostic Analysis</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono-exam">Gemini Cambridge Model</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">🎙️ Accent & Phonetics</span>
                        <p className="text-zinc-300 leading-relaxed text-[11px]">{aiExplanations[ans.questionId].accentNuance}</p>
                      </div>

                      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">🚦 Signposting Signals</span>
                        <p className="text-zinc-300 leading-relaxed text-[11px]">{aiExplanations[ans.questionId].signpostingAnalysis}</p>
                      </div>

                      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">⚠️ Trap Analysis</span>
                        <p className="text-zinc-300 leading-relaxed text-[11px]">{aiExplanations[ans.questionId].phoneticTrap}</p>
                      </div>

                      <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800/80 space-y-1">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">💡 Socratic Coach Advice</span>
                        <p className="text-zinc-300 leading-relaxed text-[11px]">{aiExplanations[ans.questionId].socraticAdvice}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="h-[650px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs">
          <SynchronizedTranscript
            transcripts={result.transcripts}
            currentTime={currentAudioTime}
            onSeek={(time) => setSeekTime(time)}
          />
        </div>
      )}
    </div>
  );
};
