import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  Cpu, 
  ShieldCheck, 
  Database,
  ArrowRight
} from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { DocumentIngestResult } from '../types/reading.types'

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
  const [fileName, setFileName] = useState<string>('')
  const [rawText, setRawText] = useState<string>('')
  const [collectionName, setCollectionName] = useState<string>('Personal Test Vault')
  const [targetBandTier, setTargetBandTier] = useState<string>('Band6_0_6_5')
  const [isCommunityShared, setIsCommunityShared] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [ingestLogs, setIngestLogs] = useState<string[]>([])

  const agentSteps = [
    { title: 'DocIngestion Delegate', desc: 'Bóc tách văn bản thô & chuẩn hóa ký tự', icon: FileText },
    { title: 'PassageStructuring Delegate', desc: 'Chia đoạn [A],[B],[C] & ước tính CEFR', icon: Cpu },
    { title: 'QuestionParser Delegate', desc: 'Trích xuất 5 dạng câu hỏi chuẩn IELTS qua LLM', icon: Bot },
    { title: 'QualityPolicyGate', desc: 'Kiểm duyệt logic đáp án & chống Hallucination', icon: ShieldCheck }
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setRawText(content)
    }
    reader.readAsText(file)
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
      setIngestLogs(['[Harness Control Plane] Initializing Multi-Agent Document Ingestion Pipeline...'])

      // Step 1 Simulation
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
      setError(err?.response?.data?.detail || 'Failed to ingest document. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Multi-Agent Document Ingestion
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                    Harness Core Engine
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Upload raw exam files or text to automatically convert into interactive IELTS exams
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Processing Telemetry View */}
          {isProcessing ? (
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-pulse">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">4-Agent Pipeline is Processing Document</h3>
                <p className="text-xs text-slate-400">Executing DAG step graph with automated quality validation gates...</p>
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
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                          : isCurrent
                          ? 'bg-purple-950/40 border-purple-600/80 text-purple-200 ring-1 ring-purple-500/50'
                          : 'bg-slate-950/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDone ? 'bg-emerald-900/50 text-emerald-400' : isCurrent ? 'bg-purple-900/50 text-purple-400' : 'bg-slate-900 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{step.title}</div>
                          <div className="text-[11px] opacity-75">{step.desc}</div>
                        </div>
                      </div>

                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-[10px] uppercase font-mono tracking-wider opacity-60">Pending</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* File Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-xl p-4 text-center transition-colors bg-slate-950/40">
                <input
                  type="file"
                  id="exam-file-input"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="exam-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-purple-300"
                >
                  <UploadCloud className="w-8 h-8 text-purple-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-200">
                    {fileName ? `Selected: ${fileName}` : 'Click to upload .txt, .docx, or .pdf'}
                  </span>
                  <span className="text-[11px] text-slate-500">or paste passage text directly below</span>
                </label>
              </div>

              {/* Raw Text Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Passage & Questions Text (Required)
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste your raw reading passage paragraphs [A], [B], [C] and questions here..."
                  className="w-full p-3 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
                  required
                />
              </div>

              {/* Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Band Tier
                  </label>
                  <select
                    value={targetBandTier}
                    onChange={(e) => setTargetBandTier(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vault / Collection Name
                  </label>
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="e.g. My Personal Exam Vault"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Community Share Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isCommunityShared}
                  onChange={(e) => setIsCommunityShared(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 bg-slate-950"
                />
                <span className="text-xs text-slate-300">
                  Share this passage with the public EduSphere Community Vault
                </span>
              </label>

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  Run Multi-Agent Ingestion
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
