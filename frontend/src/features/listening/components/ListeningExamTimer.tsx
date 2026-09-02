import React, { useEffect, useState } from 'react';
import { Timer, AlertCircle } from 'lucide-react';
import { formatAudioTime } from '../utils/listeningScoring';

interface ListeningExamTimerProps {
  initialSeconds?: number;
  /** F-02: Override the starting value — used when resuming a persisted session */
  initialSecondsRemaining?: number;
  isTimed?: boolean;
  onTimeExpired?: () => void;
  onTick?: (secondsRemaining: number) => void;
  className?: string;
}

export const ListeningExamTimer: React.FC<ListeningExamTimerProps> = ({
  initialSeconds = 1800, // 30 minutes default
  initialSecondsRemaining,
  isTimed = true,
  onTimeExpired,
  onTick,
  className = ''
}) => {
  // F-02: If resuming a session, use the persisted remaining value; otherwise start fresh
  const startValue = initialSecondsRemaining ?? (isTimed ? initialSeconds : 0);
  const [seconds, setSeconds] = useState(startValue);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (isTimed) {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimed]);

  // Safely notify parent of tick without triggering setState inside updater
  useEffect(() => {
    onTick?.(seconds);
    if (isTimed && seconds === 0) {
      onTimeExpired?.();
    }
  }, [seconds, isTimed, onTick, onTimeExpired]);

  const isLowTime = isTimed && seconds <= 300; // < 5 mins
  const isCriticalTime = isTimed && seconds <= 60; // < 1 min

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-all ${
        isCriticalTime
          ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse'
          : isLowTime
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
          : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200'
      } ${className}`}
    >
      {isCriticalTime ? (
        <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
      ) : (
        <Timer className="w-4 h-4 text-zinc-500" />
      )}
      <span>{formatAudioTime(seconds)}</span>
      {isTimed && <span className="text-[10px] text-zinc-400 uppercase font-sans">Left</span>}
    </div>
  );
};
