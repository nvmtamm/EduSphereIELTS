import React, { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../api/adminApi'
import { writingApi } from '@/features/writing/api/writingApi'
import type { AdminExamBankOverview, CreateWritingPromptPayload } from '../types/admin.types'
import type { WritingPrompt, WritingTaskType } from '@/features/writing/types/writing.types'
import { CreateWritingPromptModal } from '../components/CreateWritingPromptModal'
import {
  Library,
  BookOpen,
  Headphones,
  PenTool,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Loader2
} from 'lucide-react'

export const AdminExamBankPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminExamBankOverview | null>(null)
  const [activeTab, setActiveTab] = useState<'writing' | 'reading' | 'listening'>('writing')
  const [writingPrompts, setWritingPrompts] = useState<WritingPrompt[]>([])
  const [taskFilter, setTaskFilter] = useState<'ALL' | WritingTaskType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [overviewData, promptsData] = await Promise.all([
        adminApi.getExamBankOverview(),
        writingApi.getPrompts({
          taskType: taskFilter === 'ALL' ? undefined : taskFilter,
          search: searchQuery.trim() || undefined,
          pageSize: 50
        })
      ])
      setOverview(overviewData)
      setWritingPrompts(promptsData.items)
    } catch (err) {
      console.error('Failed to load exam bank data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [taskFilter, searchQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreatePrompt = async (payload: CreateWritingPromptPayload) => {
    await adminApi.createWritingPrompt(payload)
    await fetchData()
  }

  const handleDeletePrompt = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete prompt "${title}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      await adminApi.deleteWritingPrompt(id)
      await fetchData()
    } catch (err) {
      console.error('Failed to delete prompt:', err)
      alert('Could not delete writing prompt.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
              Exam Bank Repository
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Curate and manage Cambridge IELTS Academic test materials, rubrics, and prompts.
            </p>
          </div>
        </div>

        {activeTab === 'writing' && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Writing Prompt</span>
          </button>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Reading Tests
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">
              {overview?.readingPassagesCount ?? '—'}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Full Cambridge passages</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Listening Tests
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">
              {overview?.listeningTestsCount ?? '—'}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Audio sections with timestamps</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center shrink-0">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Writing Prompts
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">
              {overview?.writingPromptsCount ?? '—'}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {writingPrompts.filter((p) => p.taskType === 'Task1').length} Task 1 · {writingPrompts.filter((p) => p.taskType === 'Task2').length} Task 2
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('writing')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'writing'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Writing Prompts ({writingPrompts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reading')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'reading'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Reading Papers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('listening')}
          className={`pb-3 text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'listening'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Listening Audio Tests</span>
        </button>
      </div>

      {/* Writing Prompts View */}
      {activeTab === 'writing' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by prompt title or topic..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full sm:w-auto">
              {(['ALL', 'Task1', 'Task2'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTaskFilter(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    taskFilter === t
                      ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'ALL' ? 'All Tasks' : t === 'Task1' ? 'Task 1 (Report)' : 'Task 2 (Essay)'}
                </button>
              ))}
            </div>
          </div>

          {/* Prompts Cards List */}
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium tracking-wide">
                Loading exam questions...
              </p>
            </div>
          ) : writingPrompts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <PenTool className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
                No prompts found
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Try adjusting your search criteria or create a new prompt.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {writingPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-red-500/30 transition-all flex flex-col justify-between group shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            prompt.taskType === 'Task1'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          {prompt.taskType === 'Task1' ? 'Task 1 Report' : 'Task 2 Essay'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          {prompt.difficulty}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {prompt.topic}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                      {prompt.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-serif line-clamp-3 leading-relaxed">
                      {prompt.promptText}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{prompt.recommendedTimeMinutes} mins</span>
                      </span>
                      <span>≥ {prompt.minWordCount} words</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePrompt(prompt.id, prompt.title)}
                        disabled={deletingId === prompt.id}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer disabled:opacity-40"
                        title="Delete Prompt"
                      >
                        {deletingId === prompt.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reading Tab Info */}
      {activeTab === 'reading' && (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-base font-black text-zinc-900 dark:text-white">
            Cambridge Academic Reading Repository
          </h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto">
            {overview?.readingPassagesCount ?? 0} full IELTS reading practice modules currently live.
            All passages, paragraph headings, and multiple-choice keys are active.
          </p>
        </div>
      )}

      {/* Listening Tab Info */}
      {activeTab === 'listening' && (
        <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
          <Headphones className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-base font-black text-zinc-900 dark:text-white">
            Cambridge Academic Listening Repository
          </h3>
          <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto">
            {overview?.listeningTestsCount ?? 0} listening exams with audio tracks, transcripts,
            and micro-dictation exercise audio loaded in the exam bank.
          </p>
        </div>
      )}

      {/* Create Writing Prompt Modal */}
      <CreateWritingPromptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePrompt}
      />
    </div>
  )
}
