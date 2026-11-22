import React from 'react'
import { ArrowLeft, Clock, Lightbulb, Lock, Play, ShieldCheck, GraduationCap } from 'lucide-react'

import type { ExamMode } from './examMode'

interface ExamModeSelectProps {
  title: string
  subtitle?: string
  /** Extra line shown on the Real Exam card, e.g. "60 minutes" or "Audio plays once". */
  examNote?: string
  onSelect: (mode: ExamMode) => void
  onBack: () => void
}

/**
 * Gate shown before every Reading/Listening test:
 * Practice = untimed with hints, Real Exam = official timing with no assistance.
 */
export const ExamModeSelect: React.FC<ExamModeSelectProps> = ({ title, subtitle, examNote, onSelect, onBack }) => (
  <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 flex flex-col">
    <header className="h-14 px-4 sm:px-6 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900">
      <button
        type="button"
        onClick={onBack}
        title="Back"
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>
    </header>

    <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Choose how you want to take this test</h1>
          <p className="text-xs sm:text-sm text-slate-500">You can retake it in the other mode at any time.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-white dark:bg-zinc-900 p-5 space-y-4 flex flex-col">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-bold">
              <GraduationCap className="w-4 h-4" /> Practice
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Practice mode</h2>
            <p className="text-xs text-slate-500">Learn the method with guided help while you work.</p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-sky-500" /> No countdown timer</li>
              <li className="flex items-center gap-2"><Lightbulb className="w-3.5 h-3.5 text-sky-500" /> 4-step hints for every question</li>
              <li className="flex items-center gap-2"><Play className="w-3.5 h-3.5 text-sky-500" /> Replay audio freely</li>
            </ul>
            <button
              type="button"
              onClick={() => onSelect('practice')}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Start practising
            </button>
          </section>

          <section className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-zinc-900 p-5 space-y-4 flex flex-col">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" /> Real exam
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Real exam mode</h2>
            <p className="text-xs text-slate-500">Test yourself under official conditions.</p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 flex-1">
              <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-emerald-500" /> Official countdown timer{examNote ? ` · ${examNote}` : ''}</li>
              <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-emerald-500" /> No hints or AI assistance</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Auto-submit when time is up</li>
            </ul>
            <button
              type="button"
              onClick={() => onSelect('exam')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" /> Start timed exam
            </button>
          </section>
        </div>
      </div>
    </main>
  </div>
)
