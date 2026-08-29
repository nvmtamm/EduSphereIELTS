import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Play
} from 'lucide-react';
import { listeningApi } from '../api/listeningApi';
import type { ListeningResult, ListeningSectionBreakdown, ListeningAnswerResult } from '../types/listening';
import { AudioWaveformPlayer } from '../components/AudioWaveformPlayer';
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
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'review' | 'transcript'>('review');

  useEffect(() => {
    if (!id) return;
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await listeningApi.getSubmissionById(id);
        setResult(data);
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
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
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
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Return to Listening Hub
        </button>
      </div>
    );
  }

  const bandDesc = getBandScoreDescription(result.bandScore);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 p-4 sm:p-6">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => navigate('/listening')}
          className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listening Tests</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(`/listening/exam/${result.testId}`)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Test</span>
        </button>
      </div>

      {/* 2. Hero Band Score & Performance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-blue-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Official Cambridge IELTS Diagnostic</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
              {result.testTitle}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
              Completed on {new Date(result.completedAt).toLocaleDateString()} • {formatAudioTime(result.durationSeconds)} minutes spent
            </p>
          </div>

          {/* Band Score Trophy Badge */}
          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shrink-0 shadow-lg">
            <div className="p-3.5 rounded-2xl bg-amber-400 text-zinc-950 shadow-md">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-blue-200 tracking-wider">
                IELTS Band Score
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight">
                {result.bandScore.toFixed(1)}
              </div>
              <div className="text-[11px] font-semibold text-blue-100 mt-0.5">
                {bandDesc.tier}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Stats Counters */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/15">
          <div className="p-3 bg-white/10 rounded-2xl text-center">
            <div className="text-xs text-blue-200 font-medium">Raw Score</div>
            <div className="text-lg sm:text-xl font-bold font-mono mt-0.5">
              {result.rawScore} / {result.totalQuestions}
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl text-center">
            <div className="text-xs text-blue-200 font-medium">Accuracy</div>
            <div className="text-lg sm:text-xl font-bold font-mono mt-0.5">
              {result.accuracyPercentage}%
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl text-center">
            <div className="text-xs text-blue-200 font-medium">Time Taken</div>
            <div className="text-lg sm:text-xl font-bold font-mono mt-0.5">
              {formatAudioTime(result.durationSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section-by-Section Diagnostic Breakdown */}
      {result.sectionBreakdowns && result.sectionBreakdowns.length > 0 && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
              Part-by-Part Performance Diagnostic
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.sectionBreakdowns.map((sec: ListeningSectionBreakdown) => (
              <div
                key={sec.sectionNumber}
                className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">Part {sec.sectionNumber}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono">{sec.accuracyPercentage}%</span>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {sec.sectionTitle}
                </p>

                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sec.accuracyPercentage >= 75
                        ? 'bg-emerald-500'
                        : sec.accuracyPercentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${sec.accuracyPercentage}%` }}
                  />
                </div>

                <div className="text-right text-[10px] font-semibold text-zinc-400">
                  {sec.rawScore} / {sec.totalQuestions} Correct
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Tab Switcher: Question Review vs Interactive Transcript */}
      <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl max-w-sm border border-zinc-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => setActiveTab('review')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'review'
              ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Question Review ({result.answers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transcript')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'transcript'
              ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Full Transcript</span>
        </button>
      </div>

      {/* 5. Review Body */}
      {activeTab === 'review' ? (
        <div className="space-y-4">
          {result.answers.map((ans: ListeningAnswerResult) => (
            <div
              key={ans.questionId}
              className={`p-5 rounded-2xl border transition-all ${
                ans.isCorrect
                  ? 'bg-white dark:bg-zinc-900 border-emerald-500/30'
                  : 'bg-white dark:bg-zinc-900 border-rose-500/30'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold shrink-0 ${
                      ans.isCorrect
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {ans.questionNumber}
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Part {ans.sectionNumber} • {ans.questionType}
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {ans.prompt}
                    </h4>
                  </div>
                </div>

                {/* Audio Cue Button */}
                {ans.timestampSeconds > 0 && (
                  <button
                    type="button"
                    onClick={() => setSeekTime(ans.timestampSeconds)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 transition-colors shrink-0"
                    title="Play audio from answer cue"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Cue {formatAudioTime(ans.timestampSeconds)}</span>
                  </button>
                )}
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                {/* User Answer */}
                <div className={`p-3 rounded-xl border ${
                  ans.isCorrect
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    <span>Your Answer:</span>
                  </div>
                  <div className={`text-sm font-bold font-mono ${
                    ans.isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300 line-through'
                  }`}>
                    {ans.userAnswer || '(No answer provided)'}
                  </div>
                </div>

                {/* Correct Answer */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Official Correct Answer:
                  </div>
                  <div className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    {ans.correctAnswer}
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              {ans.explanation && (
                <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 mr-1">Explanation:</span>
                  {ans.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[600px]">
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
