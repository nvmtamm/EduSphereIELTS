import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { writingApi, taskLabel, type WritingPromptDetail } from '../api/writingApi'

const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0)
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export const WritingWorkspacePage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState<WritingPromptDetail | null>(null)
  const [essay, setEssay] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const draftKey = `writing.draft.${id}`
  const loaded = useRef(false)

  useEffect(() => {
    writingApi.getPrompt(id).then(setPrompt).catch(() => setError('Prompt not found.'))
    try {
      const d = localStorage.getItem(draftKey)
      if (d) setEssay(d)
    } catch { /* storage unavailable */ }
    loaded.current = true
  }, [id, draftKey])

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!loaded.current) return
    try { localStorage.setItem(draftKey, essay) } catch { /* ignore */ }
  }, [essay, draftKey])

  const words = countWords(essay)
  const min = prompt?.minWords ?? 250
  const limit = (prompt?.suggestedMinutes ?? 40) * 60
  const wordColor = words >= min ? 'text-emerald-600' : 'text-rose-600'

  const submit = async () => {
    if (!prompt) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await writingApi.submit({ promptId: prompt.id, essay, durationSeconds: elapsed })
      try { localStorage.removeItem(draftKey) } catch { /* ignore */ }
      navigate(`/writing/result/${res.id}`)
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail ?? 'Could not grade your essay. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!prompt) return <p className="p-8 text-sm font-bold text-slate-600">{error ?? 'Loading…'}</p>

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-950">
      <div className="px-5 py-3 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <button type="button" onClick={() => navigate('/writing')} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="text-slate-500">{taskLabel(prompt.taskType)}</span>
          <span className={elapsed > limit ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}>{fmt(elapsed)} / {prompt.suggestedMinutes}:00</span>
          <span className={wordColor}>{words} / {min}+ words</span>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || words < 20}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 cursor-pointer"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Grading…' : 'Submit for grading'}
          </button>
        </div>
      </div>

      <Group orientation="horizontal" className="flex-1">
        <Panel defaultSize={42} minSize={25}>
          <div className="h-full overflow-y-auto p-6 bg-white dark:bg-slate-950 space-y-4">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{prompt.title}</h1>
            <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">{prompt.promptText}</p>
            {prompt.dataText && (
              <table className="text-xs border border-slate-200 dark:border-slate-700">
                <tbody>
                  {prompt.dataText.split('\n').map((row, i) => (
                    <tr key={i} className={i === 0 ? 'font-bold bg-slate-50 dark:bg-slate-800' : ''}>
                      {row.split('|').map((c, j) => (
                        <td key={j} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700">{c.trim()}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="text-xs text-slate-500">Write at least {prompt.minWords} words.</p>
          </div>
        </Panel>
        <Separator className="w-2 bg-slate-200/80 dark:bg-slate-800 hover:bg-red-600 transition-colors cursor-col-resize" />
        <Panel defaultSize={58} minSize={30}>
          <div className="h-full flex flex-col bg-white dark:bg-slate-950">
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              spellCheck={false}
              placeholder="Start writing your answer here…"
              className="flex-1 p-6 resize-none outline-none bg-transparent text-[15px] leading-7 text-slate-900 dark:text-slate-100"
            />
            {error && <p className="px-6 py-2 text-xs font-bold text-rose-600">{error}</p>}
          </div>
        </Panel>
      </Group>
    </div>
  )
}
