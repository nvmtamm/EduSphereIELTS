import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Settings2, 
  Layers, 
  ShieldCheck, 
  Bot,
  Play
} from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { DocumentIngestResult } from '../types/reading.types'
import { extractTextFromFile } from '@/shared/utils/documentParser'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (result: DocumentIngestResult) => void
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [rawText, setRawText] = useState('')
  const [fileName, setFileName] = useState('')
  const [collectionName, setCollectionName] = useState('Personal Test Vault')
  const [targetBandTier, setTargetBandTier] = useState('Band7_0_7_5')
  const [isCommunityShared, setIsCommunityShared] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [ingestLogs, setIngestLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const agentSteps = [
    { title: 'Document Ingestion & Preprocessing', desc: 'Extracting clean text, removing watermarks and non-reading content...', icon: FileText },
    { title: 'AI Multi-Passage Segmentation', desc: 'Structuring authentic reading passages and paragraph letters...', icon: Layers },
    { title: 'Question & Option Digitization', desc: 'Extracting full questions, options, and answer explanations...', icon: Settings2 },
    { title: 'Cambridge Quality Validation', desc: 'Verifying question numbering and schema integrity...', icon: ShieldCheck }
  ]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError(null)

    try {
      const extractedText = await extractTextFromFile(file)
      if (!extractedText.trim()) {
        setError('Could not extract text from this file. Please paste text directly.')
        return
      }
      setRawText(extractedText)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Failed to read file. Please paste text manually.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawText.trim() || rawText.trim().length < 50) {
      setError('Please provide at least 50 characters of passage text.')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setActiveStep(1)
      setIngestLogs(['[Exam Digitizer] Initializing IELTS Document Processing Pipeline...'])

      // Step simulation for visual feedback
      setTimeout(() => setActiveStep(2), 600)
      setTimeout(() => setActiveStep(3), 1200)

      const result = await readingApi.ingestDocument({
        rawText,
        fileName: fileName || 'Custom_IELTS_Passage.txt',
        collectionName: collectionName.trim() || 'Personal Test Vault',
        targetBandTier,
        isCommunityShared
      })

      setActiveStep(4)
      setIngestLogs(result.processingLogs)

      setTimeout(() => {
        setIsProcessing(false)
        onSuccess(result)
        onClose()
      }, 1000)
    } catch (err: any) {
      setIsProcessing(false)
      setError(err?.response?.data?.detail || 'Failed to digitize exam document. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  Smart IELTS Exam Digitizer
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 font-bold">
                    AI Converter
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Upload raw exam files or text to automatically convert into interactive practice exams
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Processing Telemetry View */}
          {isProcessing ? (
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400 animate-pulse">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Engine is Processing Your Exam Paper</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Extracting passages, questions, and verifying against Cambridge scoring standards...</p>
              </div>

              {/* Steps Progress */}
              <div className="space-y-3">
                {agentSteps.map((step, idx) => {
                  const stepNum = idx + 1
                  const isDone = activeStep > stepNum
                  const isCurrent = activeStep === stepNum
                  const Icon = step.icon

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                        isDone
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                          : isCurrent
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 ring-1 ring-red-400'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDone ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : isCurrent ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{step.title}</div>
                          <div className="text-[11px] opacity-80">{step.desc}</div>
                        </div>
                      </div>

                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-[10px] uppercase font-mono tracking-wider opacity-60 font-semibold">Pending</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* File Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-red-500 rounded-2xl p-5 text-center transition-colors bg-slate-50/60 dark:bg-slate-950/40">
                <input
                  type="file"
                  id="exam-file-input"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="exam-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-red-600 transition-colors"
                >
                  <UploadCloud className="w-8 h-8 text-red-600 mb-1" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {fileName ? `Selected: ${fileName}` : 'Click to upload .txt, .docx, or .pdf'}
                  </span>
                  <span className="text-[11px] text-slate-400">or paste passage text directly below</span>
                </label>
              </div>

              {/* Raw Text Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Passage & Questions Text (Required)
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your raw reading passage paragraphs [A], [B], [C] and questions here..."
                  className="w-full p-3.5 bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono leading-relaxed"
                  required
                />
              </div>

              {/* Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Band Tier
                  </label>
                  <select
                    value={targetBandTier}
                    onChange={(e) => setTargetBandTier(e.target.value)}
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="PreIelts">Pre-IELTS (Band 0–3.5)</option>
                    <option value="Band4_0_4_5">Band 4.0–4.5</option>
                    <option value="Band5_0_5_5">Band 5.0–5.5</option>
                    <option value="Band6_0_6_5">Band 6.0–6.5</option>
                    <option value="Band7_0_7_5">Band 7.0–7.5</option>
                    <option value="Band8_0_Plus">Band 8.0–8.5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vault / Collection Name
                  </label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="e.g. My Personal Exam Vault"
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              {/* Community Share Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isCommunityShared}
                  onChange={(e) => setIsCommunityShared(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4 bg-slate-50 dark:bg-slate-950 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Share this passage with the public EduSphere Community Vault
                </span>
              </label>

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Convert & Start Practice</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
