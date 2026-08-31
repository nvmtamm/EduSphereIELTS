import { useEffect, useRef, useCallback } from 'react';

// F-02: Exam Session Persistence — Reload-Safe State
// Serializes full exam state to localStorage every AUTOSAVE_INTERVAL_MS,
// so users can resume if they accidentally refresh the browser.

const AUTOSAVE_INTERVAL_MS = 5_000; // 5 seconds

export interface ListeningSessionState {
  testId: string;
  answers: Record<string, string>;
  markedQuestions: string[];     // Set serialized as array
  elapsedSeconds: number;        // seconds elapsed (counting up)
  secondsRemaining: number;      // countdown timer value
  currentQuestionIndex: number;
  savedAt: number;               // Date.now() timestamp
}

const STORAGE_KEY = (testId: string) => `edusphere_exam_session_${testId}`;

// ──────────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────────
interface UseListeningSessionPersistOptions {
  testId: string | undefined;
  answers: Record<string, string>;
  markedQuestions: Set<string>;
  secondsRemaining: number;
  elapsedSeconds: number;
  currentQuestionIndex: number;
  /** Called when an existing session is found on mount — provides the saved state */
  onSessionFound?: (state: ListeningSessionState) => void;
}

export function useListeningSessionPersist({
  testId,
  answers,
  markedQuestions,
  secondsRemaining,
  elapsedSeconds,
  currentQuestionIndex,
  onSessionFound,
}: UseListeningSessionPersistOptions) {
  const onSessionFoundRef = useRef(onSessionFound);
  onSessionFoundRef.current = onSessionFound;

  // ── On mount: check for a saved session ───────────────────────────────────
  useEffect(() => {
    if (!testId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(testId));
      if (!raw) return;
      const state: ListeningSessionState = JSON.parse(raw);
      // Only restore if session was saved within the last 24 hours
      const ageMs = Date.now() - (state.savedAt ?? 0);
      if (ageMs < 24 * 60 * 60 * 1_000) {
        onSessionFoundRef.current?.(state);
      } else {
        localStorage.removeItem(STORAGE_KEY(testId));
      }
    } catch {
      // Corrupt data — ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  // ── Autosave every AUTOSAVE_INTERVAL_MS ──────────────────────────────────
  useEffect(() => {
    if (!testId) return;
    const intervalId = setInterval(() => {
      try {
        const state: ListeningSessionState = {
          testId,
          answers,
          markedQuestions: Array.from(markedQuestions),
          elapsedSeconds,
          secondsRemaining,
          currentQuestionIndex,
          savedAt: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY(testId), JSON.stringify(state));
      } catch {
        // localStorage full or unavailable — silently skip
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [testId, answers, markedQuestions, secondsRemaining, elapsedSeconds, currentQuestionIndex]);

  // ── Clear session (call after successful submit) ──────────────────────────
  const clearSession = useCallback(() => {
    if (!testId) return;
    localStorage.removeItem(STORAGE_KEY(testId));
  }, [testId]);

  return { clearSession };
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers (used by ListeningExamPage to read session without mounting the hook)
// ──────────────────────────────────────────────────────────────────────────────
export function readSavedSession(testId: string): ListeningSessionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(testId));
    if (!raw) return null;
    const state: ListeningSessionState = JSON.parse(raw);
    const ageMs = Date.now() - (state.savedAt ?? 0);
    return ageMs < 24 * 60 * 60 * 1_000 ? state : null;
  } catch {
    return null;
  }
}

export function clearSavedSession(testId: string): void {
  localStorage.removeItem(STORAGE_KEY(testId));
}
