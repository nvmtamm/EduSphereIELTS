import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, GraduationCap, Loader2 } from 'lucide-react'
import { learningPathApi, type LearningPath } from '../api/learningPathApi'

export const LearningPathPage: React.FC = () => {
  const [path, setPath] = useState<LearningPath | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    learningPathApi.getPath().then(setPath).catch(() => setError(true))
  }, [])

  if (error) return <p className="p-8 text-sm font-bold text-rose-600">Could not load the Learning Path.</p>
  if (!path) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>

  const pct = path.totalLessons ? Math.round((path.completedLessons / path.totalLessons) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="space-y-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" /> Learning Path
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Your IELTS Study Path</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          3 stages, 9 lessons each. Read the summary, do the exercises, take the online test, then mark the lesson complete.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-red-600" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{path.completedLessons}/{path.totalLessons} · {pct}%</span>
        </div>
      </div>

      {path.stages.map((stage) => (
        <section key={stage.stageNumber} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white">{stage.title}</h2>
            <span className="text-xs font-bold text-slate-500">{stage.completedLessons}/{stage.totalLessons} done</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stage.lessons.map((l) => (
              <Link
                key={l.id}
                to={`/learning-path/${l.code}`}
                className={`p-4 rounded-2xl border transition-all hover:border-red-500 hover:shadow-md flex items-start gap-3 ${
                  l.completed
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {l.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}
                <div>
                  <span className="text-[11px] font-black text-red-600">{l.code}</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{l.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
