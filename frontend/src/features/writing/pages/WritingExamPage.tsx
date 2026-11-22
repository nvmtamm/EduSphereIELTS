import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { writingApi } from '../api/writingApi'
import type { WritingPrompt } from '../types/writing.types'
import { WritingEditor } from '../components/WritingEditor'
import {
  Clock,
  Send,
  Sparkles,
  ArrowLeft,
  ZoomIn,
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Maximize2
} from 'lucide-react'

export const WritingExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [prompt, setPrompt] = useState<WritingPrompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(40 * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [evaluatingStep, setEvaluatingStep] = useState(1)

  useEffect(() => {
    if (id) fetchPrompt(id)
  }, [id])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchPrompt = async (promptId: string) => {
    setLoading(true)
    try {
      const data = await writingApi.getPromptById(promptId)
      setPrompt(data)
      setTimeLeft(data.recommendedTimeMinutes * 60)
    } catch (err) {
      console.error('Failed to load prompt', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    if (!prompt) return

    if (wordCount < prompt.minWordCount) {
      const proceed = window.confirm(
        `Your essay has ${wordCount} words, which is below the minimum ${prompt.minWordCount} words required. Submitting an under-length essay may lead to penalties in Task Achievement / Task Response. Do you still wish to submit?`
      )
      if (!proceed) return
    }

    setIsSubmitting(true)
    setEvaluatingStep(1)

    // Simulated evaluation stage transitions
    const stepInterval = setInterval(() => {
      setEvaluatingStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 1500)

    try {
      const timeSpent = prompt.recommendedTimeMinutes * 60 - timeLeft
      const res = await writingApi.submitWriting({
        promptId: prompt.id,
        content,
        timeSpentSeconds: Math.max(timeSpent, 60)
      })

      clearInterval(stepInterval)
      localStorage.removeItem(`edusphere_writing_draft_${prompt.id}`)
      navigate(`/writing/result/${res.id}`)
    } catch (err) {
      clearInterval(stepInterval)
      setIsSubmitting(false)
      alert('Failed to submit essay. Please check your connection and try again.')
    }
  }

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <span className="text-sm font-semibold">Preparing IELTS exam workspace...</span>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Exam prompt not found</h3>
        <button
          onClick={() => navigate('/writing')}
          className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold"
        >
          Back to Writing Hub
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-4 sm:-m-6 md:-m-8">
      {/* Top Header Bar */}
      <div className="px-6 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/writing')}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            title="Exit Exam"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-black tracking-wider text-red-600 dark:text-red-500">
                {prompt.taskType === 'Task1' ? 'Task 1: Academic Report' : 'Task 2: Academic Essay'}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-xs font-medium text-zinc-500">{prompt.topic}</span>
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
              {prompt.title}
            </h2>
          </div>
        </div>

        {/* Timer & Submit Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-red-600" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || wordCount === 0}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-red-600/30 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Essay</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="flex-1 overflow-hidden relative">
        <Group orientation="horizontal" className="h-full">
          {/* Left Panel: Prompt Text & Diagram */}
          <Panel defaultSize={45} minSize={30} className="h-full overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/40 p-6 sm:p-8">
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    Official Instructions
                  </span>
                  <span className="text-xs font-medium text-zinc-400">
                    Recommended: {prompt.recommendedTimeMinutes} minutes
                  </span>
                </div>

                <div className="font-serif text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line border-l-2 border-red-600 pl-4 py-1">
                  {prompt.promptText}
                </div>
              </div>

              {/* Task 1 Diagram Card */}
              {prompt.imageUrl && (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                    <span>Task Diagram / Visual Reference</span>
                    <button
                      type="button"
                      onClick={() => setShowImageModal(true)}
                      className="flex items-center gap-1 text-red-600 hover:underline cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Enlarge
                    </button>
                  </div>
                  <div
                    onClick={() => setShowImageModal(true)}
                    className="relative group cursor-zoom-in rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
                  >
                    <img
                      src={prompt.imageUrl}
                      alt={prompt.title}
                      className="w-full h-auto object-cover transition-transform group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <ZoomIn className="w-4 h-4" /> Click to zoom
                    </div>
                  </div>
                </div>
              )}

              {/* Tips for candidate */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" /> Examination Notice
                </div>
                <p>
                  • Ensure you write at least <strong>{prompt.minWordCount} words</strong>.
                </p>
                <p>
                  • Your response will be graded across all 4 official criteria: Task Achievement/Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.
                </p>
              </div>
            </div>
          </Panel>

          {/* Resizable Divider Handle */}
          <Separator className="w-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-red-500 active:bg-red-600 transition-colors cursor-col-resize" />

          {/* Right Panel: Tiptap Writing Editor */}
          <Panel defaultSize={55} minSize={35} className="h-full p-4 sm:p-6 overflow-hidden">
            <WritingEditor
              promptId={prompt.id}
              minWordCount={prompt.minWordCount}
              recommendedTimeMinutes={prompt.recommendedTimeMinutes}
              onChange={(txt, count) => {
                setContent(txt)
                setWordCount(count)
              }}
              disabled={isSubmitting}
            />
          </Panel>
        </Group>
      </div>

      {/* Image Zoom Modal */}
      {showImageModal && prompt.imageUrl && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-6"
        >
          <div className="relative max-w-4xl w-full bg-white dark:bg-zinc-900 rounded-3xl p-4 overflow-hidden border border-zinc-800">
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="mt-3 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold block mx-auto cursor-pointer"
            >
              Close Zoom View
            </button>
          </div>
        </div>
      )}

      {/* AI Evaluation Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-600/40 animate-pulse mb-6">
            <Sparkles className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
            IELTS AI Examiner is Grading Your Essay
          </h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-md">
            Analyzing syntactic complexity, lexical density, task response depth, and official Cambridge band criteria...
          </p>

          <div className="mt-8 space-y-3 w-72 text-left text-xs">
            <div className={`flex items-center gap-2.5 font-semibold ${evaluatingStep >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>1. Validating word count & paragraph layout</span>
            </div>
            <div className={`flex items-center gap-2.5 font-semibold ${evaluatingStep >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>2. Aligning with Qdrant IELTS Band Descriptors</span>
            </div>
            <div className={`flex items-center gap-2.5 font-semibold ${evaluatingStep >= 3 ? 'text-red-600 dark:text-red-400' : 'text-zinc-400'}`}>
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              <span>3. Synthesizing 4-criteria score & grammar diff</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
