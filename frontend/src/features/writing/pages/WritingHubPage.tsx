import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, Search, Clock, History } from 'lucide-react'
import { writingApi, taskLabel, type WritingPromptItem, type WritingHistoryItem } from '../api/writingApi'

const TASKS = [
  { key: '', label: 'All tasks' },
  { key: 'Task1Academic', label: 'Task 1 · Academic' },
  { key: 'Task1General', label: 'Task 1 · General' },
  { key: 'Task2', label: 'Task 2' }
]

export const WritingHubPage: React.FC = () => {
  const navigate = useNavigate()
  const [taskType, setTaskType] = useState('')
  const [search, setSearch] = useState('')
  const [prompts, setPrompts] = useState<WritingPromptItem[]>([])
  const [history, setHistory] = useState<WritingHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    writingApi
      .getPrompts({ taskType: taskType || undefined, search: search.trim() || undefined })
      .then(setPrompts)
      .catch(() => setPrompts([]))
      .finally(() => setLoading(false))
  }, [taskType, search])

  useEffect(() => {
    writingApi.getHistory().then(setHistory).catch(() => setHistory([]))
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="space-y-2 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-wider">
          <PenTool className="w-4 h-4" /> Writing AI
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">IELTS Writing Practice</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Write under timed conditions and get band scores for the four official criteria, with corrections and a model answer.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TASKS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTaskType(t.key)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
              taskType === t.key
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or topic..."
            className="pl-9 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-red-500"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading prompts…</p>
      ) : prompts.length === 0 ? (
        <p className="text-sm text-slate-500">No prompts match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prompts.map((p) => (
            <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-red-500 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-200">{taskLabel(p.taskType)}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{p.essayType}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
                <p className="text-xs text-slate-500">{p.topic}</p>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.suggestedMinutes} min · {p.minWords}+ words</span>
                <button
                  type="button"
                  onClick={() => navigate(`/writing/write/${p.id}`)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                >
                  Start writing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2"><History className="w-4 h-4 text-red-600" /> Your submissions</h2>
        {history.length === 0 ? (
          <p className="text-xs text-slate-500">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => navigate(`/writing/result/${h.id}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-500 text-left cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white">{h.promptTitle} <span className="text-slate-400 font-medium">· {taskLabel(h.taskType)} · {h.wordCount} words</span></span>
                <span className="text-sm font-black text-red-600">{h.overallBand.toFixed(1)}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
