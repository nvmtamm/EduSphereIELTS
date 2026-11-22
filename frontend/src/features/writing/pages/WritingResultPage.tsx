import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { writingApi, taskLabel, type WritingSubmission } from '../api/writingApi'

const CRITERIA: { key: 'taskResponse' | 'coherenceCohesion' | 'lexicalResource' | 'grammaticalRange'; label: string }[] = [
  { key: 'taskResponse', label: 'Task Response / Achievement' },
  { key: 'coherenceCohesion', label: 'Coherence & Cohesion' },
  { key: 'lexicalResource', label: 'Lexical Resource' },
  { key: 'grammaticalRange', label: 'Grammatical Range & Accuracy' }
]


const RadarChart: React.FC<{ values: { label: string; value: number }[] }> = ({ values }) => {
  const size = 220
  const c = size / 2
  const r = 80
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / values.length - Math.PI / 2
    return [c + Math.cos(a) * r * (v / 9), c + Math.sin(a) * r * (v / 9)]
  }
  const poly = (v: number) => values.map((_, i) => pt(i, v).join(',')).join(' ')
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto" role="img" aria-label="Criteria radar chart">
      {[3, 6, 9].map((g) => (
        <polygon key={g} points={poly(g)} fill="none" className="stroke-slate-200 dark:stroke-slate-700" />
      ))}
      <polygon points={values.map((x, i) => pt(i, x.value).join(',')).join(' ')} className="fill-red-600/25 stroke-red-600" strokeWidth={2} />
      {values.map((x, i) => {
        const [lx, ly] = pt(i, 10.6)
        return (
          <text key={x.label} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-[9px] font-bold">
            {x.label}
          </text>
        )
      })}
    </svg>
  )
}

const HighlightedEssay: React.FC<{ essay: string; quotes: string[] }> = ({ essay, quotes }) => {
  const valid = quotes.filter((q) => q && essay.includes(q))
  if (valid.length === 0) return <>{essay}</>
  const escaped = valid.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = essay.split(new RegExp(`(${escaped.join('|')})`, 'g'))
  return (
    <>
      {parts.map((p, i) =>
        valid.includes(p) ? (
          <mark key={i} className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 underline decoration-wavy decoration-rose-500 rounded px-0.5">{p}</mark>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  )
}

export const WritingResultPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>()
  const [sub, setSub] = useState<WritingSubmission | null>(null)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<'evaluation' | 'sample'>('evaluation')

  useEffect(() => {
    writingApi.getSubmission(id).then(setSub).catch(() => setError(true))
  }, [id])

  if (error) return <p className="p-8 text-sm font-bold text-rose-600">Submission not found.</p>
  if (!sub) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>

  const fb = sub.feedback

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <Link to="/writing" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600">
        <ArrowLeft className="w-4 h-4" /> Back to Writing
      </Link>

      <div className="rounded-3xl bg-zinc-950 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-red-400 uppercase">{taskLabel(sub.taskType)} · {sub.wordCount} words</span>
          <h1 className="text-xl font-black text-white">{sub.promptTitle}</h1>
          <p className="text-xs text-zinc-400">Graded by: {fb.gradedBy === 'Gemini' ? 'AI examiner' : 'Offline estimate (no AI key configured)'}</p>
        </div>
        <div className="p-5 rounded-2xl bg-red-600 text-center min-w-[130px]">
          <span className="text-[11px] font-bold text-red-100 uppercase">Overall band</span>
          <div className="text-5xl font-black text-white">{sub.overallBand.toFixed(1)}</div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <RadarChart values={[
          { label: 'TR', value: sub.taskResponse },
          { label: 'CC', value: sub.coherenceCohesion },
          { label: 'LR', value: sub.lexicalResource },
          { label: 'GRA', value: sub.grammaticalRange }
        ]} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CRITERIA.map((c) => (
          <div key={c.key} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-500">{c.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{sub[c.key].toFixed(1)}</p>
            <div className="h-1.5 mt-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-red-600" style={{ width: `${(sub[c.key] / 9) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['evaluation', 'sample'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${tab === t ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            {t === 'evaluation' ? 'Evaluation' : 'Sample & outline'}
          </button>
        ))}
      </div>

      {tab === 'evaluation' ? (
        <div className="space-y-6">
          {fb.lengthPenaltyApplied && (
            <p className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-xs font-bold text-amber-800 dark:text-amber-300">
              Your essay is under the minimum word count, so Task Response was capped.
            </p>
          )}
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{fb.summary}</p>

          <div className="grid md:grid-cols-2 gap-3">
            {CRITERIA.map((c) => (
              <div key={c.key} className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-xs font-black text-slate-900 dark:text-white mb-1">{c.label}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{fb.criterionComments[c.key] ?? '—'}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs font-black text-slate-900 dark:text-white mb-3">Your essay (mistakes underlined)</p>
            <p className="text-sm leading-7 whitespace-pre-wrap text-slate-800 dark:text-slate-200">
              <HighlightedEssay essay={sub.essay} quotes={fb.errors.map((e) => e.quote)} />
            </p>
          </div>

          {fb.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-900 dark:text-white">Corrections</p>
              {fb.errors.map((e, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">{e.category}</span>
                  <p><span className="line-through text-rose-600">{e.quote}</span> → <strong className="text-emerald-700 dark:text-emerald-400">{e.correction}</strong></p>
                  <p className="text-slate-500">{e.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {fb.vocabularySuggestions.length > 0 && (
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white mb-2">Vocabulary upgrades</p>
              <div className="flex flex-wrap gap-2">
                {fb.vocabularySuggestions.map((v) => (
                  <span key={v} className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{v}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-black mb-1">Outline</p>
            {sub.outline}
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs font-black mb-3">Model answer (≈ band {sub.modelBand.toFixed(1)})</p>
            <p className="text-sm leading-7 whitespace-pre-wrap text-slate-800 dark:text-slate-200">{sub.modelEssay}</p>
          </div>
        </div>
      )}
    </div>
  )
}
