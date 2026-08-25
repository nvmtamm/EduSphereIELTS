import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Lightbulb, 
  HelpCircle, 
  ChevronRight, 
  CornerDownRight,
  BookOpen,
  MessageSquare
} from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { AITutorMessage } from '../types/reading.types'

interface ReadingAITutorSidebarProps {
  isOpen: boolean
  onClose: () => void
  passageId: string
  passageTitle: string
  activeQuestionPrompt?: string
  isPostExamReview?: boolean
}

export const ReadingAITutorSidebar: React.FC<ReadingAITutorSidebarProps> = ({
  isOpen,
  onClose,
  passageId,
  passageTitle,
  activeQuestionPrompt,
  isPostExamReview = false
}) => {
  const [messages, setMessages] = useState<AITutorMessage[]>([
    {
      role: 'assistant',
      message: isPostExamReview
        ? `Hello! I am your AI Reading Coach in Deep Diagnostic Review Mode. Ask me about any tricky grammar, paragraph inferences, or distractor traps from "${passageTitle}"!`
        : `Hi! I am your AI Reading Tutor in Socratic Hint Mode. I will guide you to find keywords and paragraph clues in "${passageTitle}" without giving away the direct answers. How can I assist you?`,
      relevantParagraph: null,
      highlightKeywords: []
    }
  ])
  const [inputQuery, setInputQuery] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const quickPrompts = isPostExamReview
    ? [
        'Explain why option B was a distractor trap',
        'Break down the complex sentence structure in Paragraph D',
        'What is the precise difference between FALSE and NOT GIVEN here?'
      ]
    : [
        'Where in the passage should I look for this question?',
        'What key synonyms or paraphrases match this question prompt?',
        'How should I approach this True/False/Not Given statement?'
      ]

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery
    if (!query.trim() || isLoading) return

    const userMessage: AITutorMessage = {
      role: 'user',
      message: query.trim()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputQuery('')
    setIsLoading(true)

    try {
      const response = await readingApi.askAITutor({
        passageId,
        question: query.trim(),
        activeQuestionPrompt,
        isPostExamReview
      })

      setMessages((prev) => [...prev, response])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: '💡 **Socratic Guidance**: Look closely at the topic sentence of Paragraph B or C. Identify the main subject and check if the statement directly contradicts the facts or if evidence is absent.',
          relevantParagraph: 'Paragraph B'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-slate-900/95 border-l border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                RAG AI Reading Tutor
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  {isPostExamReview ? 'Review Mode' : 'Socratic Hint'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {passageTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900/50 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            Suggested Questions
          </div>
          <div className="flex flex-col gap-1">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-950/60 hover:text-indigo-200 text-slate-300 border border-slate-700/60 transition-all flex items-center justify-between group"
              >
                <span className="truncate">{prompt}</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user'

            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-lg'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>

                  {msg.relevantParagraph && (
                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-indigo-300 font-semibold">
                      <BookOpen className="w-3 h-3" />
                      Referenced Section: {msg.relevantParagraph}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 p-2 text-xs">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>AI Tutor is analyzing passage context...</span>
            </div>
          )}
        </div>

        {/* Query Input */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isPostExamReview ? "Ask about grammar, traps, or logic..." : "Ask for a hint without revealing answers..."}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
