import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, PlayCircle } from 'lucide-react'
import { learningPathApi, type LessonDetail, type LessonItem } from '../api/learningPathApi'

const inline = (text: string): React.ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    return <React.Fragment key={i}>{part}</React.Fragment>
  })

const Markdown: React.FC<{ source: string }> = ({ source }) => (
  <div className="space-y-4">
    {source.split(/\n{2,}/).map((block, i) =>
      block.startsWith('## ') ? (
        <h2 key={i} className="text-xl font-bold text-slate-900 dark:text-white">{block.slice(3)}</h2>
      ) : (
        <p key={i} className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{inline(block)}</p>
      )
    )}
  </div>
)

export const LessonPage: React.FC = () => {
  const { code = '' } = useParams<{ code: string }>()
  const [lesson, setLesson] = useState<LessonDetail | null>(null)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    learningPathApi.getLesson(code)
      .then((l) => { if (!cancelled) { setLesson(l); setError(false) } })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [code])

  const items = useMemo<LessonItem[]>(() => {
    try { return lesson ? JSON.parse(lesson.itemsJson) : [] } catch { return [] }
  }, [lesson])

  if (error) return <p className="p-8 text-sm font-bold text-rose-600">Lesson not found.</p>
  if (!lesson) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>

  const complete = async () => {
    setSaving(true)
    try {
      await learningPathApi.complete(lesson.code)
      setLesson({ ...lesson, completed: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <Link to="/learning-path" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600">
        <ArrowLeft className="w-4 h-4" /> Back to Learning Path
      </Link>

      <div>
        <span className="text-xs font-bold text-red-600">{lesson.stageTitle} · {lesson.code}</span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{lesson.title}</h1>
      </div>

      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <Markdown source={lesson.summaryMarkdown} />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lesson activities</h3>
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="uppercase text-xs text-red-600 mr-2">{it.type}</span>{it.title}
            </span>
            {it.route && (
              <Link to={it.route} className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline">
                <PlayCircle className="w-4 h-4" /> Open
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        {lesson.previousCode ? (
          <Link to={`/learning-path/${lesson.previousCode}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <ArrowLeft className="w-4 h-4" /> {lesson.previousCode}
          </Link>
        ) : <span />}

        <button
          type="button"
          onClick={complete}
          disabled={lesson.completed || saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-60 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" /> {lesson.completed ? 'Completed' : 'Mark as complete'}
        </button>

        {lesson.nextCode ? (
          <Link to={`/learning-path/${lesson.nextCode}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold">
            {lesson.nextCode} <ArrowRight className="w-4 h-4" />
          </Link>
        ) : <span />}
      </div>
    </div>
  )
}
