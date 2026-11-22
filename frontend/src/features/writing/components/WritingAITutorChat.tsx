import React, { useState, useRef, useEffect } from 'react'
import { writingApi } from '../api/writingApi'
import { Bot, Send, Sparkles, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
}

interface WritingAITutorChatProps {
  submissionId: string
  overallBand: number
}

export const WritingAITutorChat: React.FC<WritingAITutorChatProps> = ({
  submissionId,
  overallBand
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your Cambridge IELTS Senior Writing Examiner. I evaluated your submission at Overall Band ${overallBand.toFixed(1)}. How can I help you improve your score or rewrite specific sections today?`
    }
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    'How can I upgrade my Lexical Resource to Band 8.0?',
    'Rewrite the introduction paragraph in Band 8.5 academic style.',
    'Where did I lose marks on Coherence & Cohesion?'
  ]

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const handleSend = async (userText: string) => {
    const textToSend = userText.trim()
    if (!textToSend || isStreaming) return

    const userMsgId = `user_${Date.now()}`
    const assistantMsgId = `assistant_${Date.now()}`

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: textToSend },
      { id: assistantMsgId, sender: 'assistant', text: '' }
    ])

    setInput('')
    setIsStreaming(true)

    await writingApi.streamChat(
      submissionId,
      textToSend,
      (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, text: msg.text + chunk } : msg
          )
        )
      },
      () => {
        setIsStreaming(false)
      },
      () => {
        setIsStreaming(false)
      }
    )
  }

  return (
    <div className="flex flex-col h-[560px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              AI Examiner Socratic Tutor
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive feedback & real-time rewrites
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/10 text-red-600 dark:text-red-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Band {overallBand.toFixed(1)} Context Active</span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user'
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-red-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-xs'
                }`}
              >
                {msg.text ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-400 py-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Examiner is analyzing your essay...</span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          )
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-2 bg-zinc-50/50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(qp)}
            disabled={isStreaming}
            className="text-xs px-3 py-1 rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-red-500 hover:text-red-600 transition-colors whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend(input)
        }}
        className="p-4 bg-zinc-50 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your essay or request a rewrite..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-zinc-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-md shadow-red-600/30 disabled:opacity-50 cursor-pointer"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Send</span>
        </button>
      </form>
    </div>
  )
}
