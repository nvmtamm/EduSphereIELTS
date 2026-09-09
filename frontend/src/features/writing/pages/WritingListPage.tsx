import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { writingApi } from '../api/writingApi'
import type { WritingPrompt, WritingTaskType } from '../types/writing.types'
import {
  PenTool,
  Search,
  Clock,
  FileText,
  BarChart3,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react'

export const WritingListPage: React.FC = () => {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTaskType, setSelectedTaskType] = useState<WritingTaskType | 'All'>('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPrompts()
  }, [selectedTaskType, search])

  const fetchPrompts = async () => {
    setLoading(true)
    try {
      const res = await writingApi.getPrompts({
        taskType: selectedTaskType === 'All' ? undefined : selectedTaskType,
        search: search.trim() || undefined,
        pageSize: 20
      })
      setPrompts(res.items)
    } catch (err) {
      console.error('Failed to load writing prompts', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <PenTool className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase tracking-widest font-black text-red-600 dark:text-red-500">
              IELTS Academic Writing
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
            Writing Practice & AI Evaluator
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Simulate authentic Computer-Delivered IELTS exams with live word counting and receive official 4-criteria AI band evaluations powered by Cambridge IELTS rubrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/writing/my-submissions"
            className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            My Submission History
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Task Type Switcher */}
        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full sm:w-auto">
          {(['All', 'Task1', 'Task2'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTaskType(type)}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTaskType === type
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              {type === 'All' ? 'All Tasks' : type === 'Task1' ? 'Task 1: Academic Report' : 'Task 2: Academic Essay'}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic or title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Prompts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200/60 dark:border-zinc-800/60"
            />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <PenTool className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="font-bold text-zinc-900 dark:text-white text-base">
            No writing prompts found
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your search query or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="group flex flex-col justify-between bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-red-500/30 dark:hover:border-red-500/30 transition-all"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                      prompt.taskType === 'Task1'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-red-600/10 text-red-600 dark:text-red-400 border border-red-600/20'
                    }`}
                  >
                    {prompt.taskType === 'Task1' ? 'Task 1 (≥150 words)' : 'Task 2 (≥250 words)'}
                  </span>

                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {prompt.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white group-hover:text-red-600 transition-colors">
                  {prompt.title}
                </h3>

                <span className="inline-block mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Topic: {prompt.topic}
                </span>

                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                  {prompt.promptText}
                </p>

                {/* Optional Chart Thumbnail Preview */}
                {prompt.imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-32">
                    <img
                      src={prompt.imageUrl}
                      alt={prompt.title}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Specs & Action */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {prompt.recommendedTimeMinutes} mins
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Min {prompt.minWordCount} words
                  </span>
                </div>

                <Link
                  to={`/writing/exam/${prompt.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-red-600 dark:bg-white dark:hover:bg-red-600 dark:text-zinc-900 dark:hover:text-white text-white text-xs font-bold transition-all group-hover:bg-red-600 group-hover:text-white"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
