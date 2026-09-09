import React, { useState } from 'react'
import type { CreateWritingPromptPayload } from '../types/admin.types'
import { Plus, X, Loader2, PenTool } from 'lucide-react'

interface CreateWritingPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateWritingPromptPayload) => Promise<void>
}

export const CreateWritingPromptModal: React.FC<CreateWritingPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [taskType, setTaskType] = useState<'Task1' | 'Task2'>('Task1')
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [promptText, setPromptText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [sampleBand8Answer, setSampleBand8Answer] = useState('')
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleTaskTypeChange = (type: 'Task1' | 'Task2') => {
    setTaskType(type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !topic.trim() || !promptText.trim()) {
      alert('Please complete all required fields.')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        taskType,
        title: title.trim(),
        topic: topic.trim(),
        promptText: promptText.trim(),
        imageUrl: imageUrl.trim() || undefined,
        difficulty,
        recommendedTimeMinutes: taskType === 'Task1' ? 20 : 40,
        minWordCount: taskType === 'Task1' ? 150 : 250,
        sampleBand8Answer: sampleBand8Answer.trim() || undefined
      })
      onClose()
    } catch (err) {
      alert('Failed to create writing prompt.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-950 dark:text-white">
                New Writing Exam Prompt
              </h3>
              <p className="text-xs text-zinc-500">
                Add an official IELTS Task 1 or Task 2 prompt to the question bank
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Task Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTaskTypeChange('Task1')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  taskType === 'Task1'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Task 1: Academic Report (≥150 words)
              </button>
              <button
                type="button"
                onClick={() => handleTaskTypeChange('Task2')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  taskType === 'Task2'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Task 2: Academic Essay (≥250 words)
              </button>
            </div>
          </div>

          {/* Title & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Prompt Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electricity Generation in France"
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Topic / Category *
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Energy & Environment"
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Prompt Instructions */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Full Prompt Instructions *
            </label>
            <textarea
              required
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Paste the official prompt text and requirements..."
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-serif leading-relaxed"
            />
          </div>

          {/* Image URL (Task 1) */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Diagram / Image URL (Required for Task 1)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (Chart, Table, Process diagram image)"
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Model Answer */}
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Band 8.5+ Model Answer (Optional)
            </label>
            <textarea
              rows={5}
              value={sampleBand8Answer}
              onChange={(e) => setSampleBand8Answer(e.target.value)}
              placeholder="Provide a high-band sample essay to assist student review..."
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-serif leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Create Prompt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
