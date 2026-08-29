import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Bookmark, 
  Edit3, 
  AlertCircle
} from 'lucide-react';
import { listeningApi } from '../api/listeningApi';
import type { ListeningTestDetail, ListeningQuestion } from '../types/listening';
import { AudioWaveformPlayer } from '../components/AudioWaveformPlayer';
import { SynchronizedTranscript } from '../components/SynchronizedTranscript';
import { ListeningNotepad } from '../components/ListeningNotepad';
import { ListeningQuestionPalette } from '../components/ListeningQuestionPalette';
import { ListeningExamTimer } from '../components/ListeningExamTimer';
import { FormCompletionRenderer } from '../components/renderers/FormCompletionRenderer';
import { ListeningMultipleChoiceRenderer } from '../components/renderers/ListeningMultipleChoiceRenderer';
import { ListeningMatchingRenderer } from '../components/renderers/ListeningMatchingRenderer';
import { MapDiagramLabellingRenderer } from '../components/renderers/MapDiagramLabellingRenderer';
import { getAccentBadge } from '../utils/listeningScoring';

export const ListeningExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<ListeningTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback & Sync State
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // User Exam State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSideTab, setActiveSideTab] = useState<'palette' | 'transcript' | 'notepad'>('palette');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [examStartTime] = useState<number>(Date.now());

  // Load test data from backend API
  useEffect(() => {
    if (!id) return;
    const fetchTest = async () => {
      try {
        setLoading(true);
        const data = await listeningApi.getTestById(id);
        setTest(data);

        // Restore any saved answers from local draft
        const savedDraft = localStorage.getItem(`edusphere_listening_draft_${id}`);
        if (savedDraft) {
          try {
            setAnswers(JSON.parse(savedDraft));
          } catch (e) {
            console.error('Failed to parse saved draft:', e);
          }
        }
      } catch (err: any) {
        console.error('Failed to load listening test:', err);
        setError(err?.response?.data?.message || 'Failed to load test details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

  // Autosave answers to localStorage
  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: value };
      if (id) {
        localStorage.setItem(`edusphere_listening_draft_${id}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [id]);

  const handleToggleMark = useCallback((questionId: string) => {
    setMarkedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  const handleSeekFromTranscript = (timestamp: number) => {
    setSeekTime(timestamp);
  };

  // Submit Handler
  const handleSubmitExam = async () => {
    if (!test || !id || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const durationSeconds = Math.max(1, Math.floor((Date.now() - examStartTime) / 1000));
      
      const payloadAnswers = test.questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id] || ''
      }));

      const result = await listeningApi.submitExam(id, {
        durationSeconds: durationSeconds,
        answers: payloadAnswers
      });

      // Clear draft on submission
      localStorage.removeItem(`edusphere_listening_draft_${id}`);
      navigate(`/listening/result/${result.submissionId}`);
    } catch (err: any) {
      console.error('Failed to submit exam:', err);
      alert(err?.response?.data?.detail || 'Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Questions grouped by section
  const sectionQuestions = useMemo(() => {
    if (!test) return {};
    const grouped: Record<number, ListeningQuestion[]> = {};
    test.questions.forEach((q) => {
      if (!grouped[q.sectionNumber]) grouped[q.sectionNumber] = [];
      grouped[q.sectionNumber].push(q);
    });
    return grouped;
  }, [test]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm">Preparing Cambridge IELTS Listening Audio Engine...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Unable to Load Test</h2>
        <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">{error || 'Test not found.'}</p>
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

  const answeredCount = test.questions.filter((q) => answers[q.id]?.trim().length > 0).length;
  const accentBadge = getAccentBadge(test.accent);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* 1. Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Exit & Test Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Leave exam? Unsubmitted changes will be saved to your local draft.')) {
                navigate('/listening');
              }
            }}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Exit Exam"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${accentBadge.bgClass} ${accentBadge.textClass}`}>
                <span>{accentBadge.flag}</span>
                <span>{accentBadge.label}</span>
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                {test.collectionName}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white line-clamp-1">
              {test.title}
            </h1>
          </div>
        </div>

        {/* Right: Timer & Submit Action */}
        <div className="flex items-center gap-3">
          <ListeningExamTimer
            initialSeconds={test.durationSeconds || 1800}
            onTimeExpired={() => setShowSubmitModal(true)}
          />

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* 2. Audio Waveform Player Bar */}
      <div className="sticky top-[57px] z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 p-3 sm:px-6">
        <AudioWaveformPlayer
          audioUrl={test.audioUrl}
          onTimeUpdate={(time) => setCurrentAudioTime(time)}
          seekTime={seekTime}
          compact
        />
      </div>

      {/* 3. Main Workspace: Split Screen Questions vs Side Panels */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Questions List (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Instructions Box */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 rounded-2xl">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Cambridge Instructions</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {test.instructions || 'Answer all questions as you listen. You will hear each recording once only.'}
            </p>
          </div>

          {/* Section Question Groups */}
          {Object.entries(sectionQuestions).map(([sectionNumStr, questions]) => {
            const secNum = parseInt(sectionNumStr, 10);
            const sectionTitle = {
              1: 'Section 1 — Everyday Social Dialogue',
              2: 'Section 2 — Local Community Monologue',
              3: 'Section 3 — Academic Assignment Discussion',
              4: 'Section 4 — University Academic Lecture'
            }[secNum] || `Section ${secNum}`;

            return (
              <div
                key={secNum}
                className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xs space-y-6"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                      {sectionTitle}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-zinc-500">
                    Questions {questions[0]?.questionNumber}–{questions[questions.length - 1]?.questionNumber}
                  </span>
                </div>

                {/* Question Renderers */}
                <div className="space-y-6">
                  {questions.map((q) => {
                    const val = answers[q.id] || '';
                    const isMarked = markedQuestions.has(q.id);

                    return (
                      <div
                        key={q.id}
                        id={`question-${q.questionNumber}`}
                        className="group relative p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/40 transition-all"
                      >
                        {/* Flag button */}
                        <button
                          type="button"
                          onClick={() => handleToggleMark(q.id)}
                          className={`absolute right-3 top-3 p-1.5 rounded-lg transition-colors ${
                            isMarked
                              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                              : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                          }`}
                          title={isMarked ? 'Unmark question' : 'Mark question for review'}
                        >
                          <Bookmark className={`w-4 h-4 ${isMarked ? 'fill-current' : ''}`} />
                        </button>

                        {/* Renderer selection */}
                        {q.questionType === 'MultipleChoice' ? (
                          <ListeningMultipleChoiceRenderer
                            question={q}
                            value={val}
                            onChange={(newVal) => handleAnswerChange(q.id, newVal)}
                          />
                        ) : q.questionType === 'MultipleChoiceMulti' ? (
                          <ListeningMultipleChoiceRenderer
                            question={q}
                            value={val}
                            onChange={(newVal) => handleAnswerChange(q.id, newVal)}
                            isMultiSelect
                          />
                        ) : q.questionType === 'Matching' ? (
                          <ListeningMatchingRenderer
                            question={q}
                            value={val}
                            onChange={(newVal) => handleAnswerChange(q.id, newVal)}
                          />
                        ) : q.questionType === 'MapLabelling' || q.questionType === 'DiagramLabelling' ? (
                          <MapDiagramLabellingRenderer
                            question={q}
                            value={val}
                            onChange={(newVal) => handleAnswerChange(q.id, newVal)}
                          />
                        ) : (
                          <FormCompletionRenderer
                            question={q}
                            value={val}
                            onChange={(newVal) => handleAnswerChange(q.id, newVal)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Side Panel (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-[160px]">
          {/* Panel Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
            <button
              type="button"
              onClick={() => setActiveSideTab('palette')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeSideTab === 'palette'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Palette ({answeredCount}/{test.questions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSideTab('transcript')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeSideTab === 'transcript'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sync Transcript</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSideTab('notepad')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeSideTab === 'notepad'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Scratchpad</span>
            </button>
          </div>

          {/* Active Panel Body */}
          <div className="min-h-[420px] max-h-[calc(100vh-240px)] flex flex-col">
            {activeSideTab === 'palette' && (
              <ListeningQuestionPalette
                questions={test.questions}
                answers={answers}
                currentQuestionIndex={currentQuestionIndex}
                onSelectQuestion={(idx) => {
                  setCurrentQuestionIndex(idx);
                  const qNum = test.questions[idx]?.questionNumber;
                  const el = document.getElementById(`question-${qNum}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                markedQuestions={markedQuestions}
                onToggleMark={handleToggleMark}
                className="h-full"
              />
            )}

            {activeSideTab === 'transcript' && (
              <SynchronizedTranscript
                transcripts={test.transcripts}
                currentTime={currentAudioTime}
                onSeek={handleSeekFromTranscript}
                className="h-full"
              />
            )}

            {activeSideTab === 'notepad' && (
              <ListeningNotepad
                testId={test.id}
                className="h-full"
              />
            )}
          </div>
        </div>
      </main>

      {/* 4. Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  Submit Listening Exam?
                </h3>
                <p className="text-xs text-zinc-500">
                  Your answers will be automatically graded according to Cambridge IELTS standards.
                </p>
              </div>
            </div>

            {/* Answer Status Summary */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-600 dark:text-zinc-400">Answered Questions:</span>
                <span className="text-zinc-950 dark:text-white font-mono font-bold">
                  {answeredCount} / {test.questions.length}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-600 dark:text-zinc-400">Unanswered Questions:</span>
                <span className={`font-mono font-bold ${test.questions.length - answeredCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {test.questions.length - answeredCount}
                </span>
              </div>
            </div>

            {test.questions.length - answeredCount > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You still have unanswered questions. Are you sure you want to finalize your submission?</span>
              </p>
            )}

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-colors"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <span>Confirm Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
