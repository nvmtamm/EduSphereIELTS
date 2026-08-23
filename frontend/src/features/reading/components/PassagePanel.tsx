import React, { useState } from 'react'
import { ZoomIn, ZoomOut, Highlighter } from 'lucide-react'

interface PassagePanelProps {
  title: string
  topic: string
  content: string
}

export const PassagePanel: React.FC<PassagePanelProps> = ({
  title,
  topic,
  content
}) => {
  const [fontSize, setFontSize] = useState<number>(15) // default 15px
  const [highlightActive, setHighlightActive] = useState<boolean>(false)

  const increaseFont = () => setFontSize((prev) => Math.min(prev + 1, 20))
  const decreaseFont = () => setFontSize((prev) => Math.max(prev - 1, 13))
  const resetFont = () => setFontSize(15)

  // Format paragraphs (e.g. ### Paragraph A -> Badge + Text)
  const formattedParagraphs = content.split('\n\n').map((para, index) => {
    const isHeading = para.startsWith('### Paragraph')
    if (isHeading) {
      const lines = para.split('\n')
      const heading = lines[0].replace('###', '').trim()
      const body = lines.slice(1).join(' ')

      return (
        <div key={index} className="mb-6 space-y-2">
          <span className="inline-block px-2.5 py-1 rounded-md bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-xs tracking-wider">
            {heading}
          </span>
          <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
            {body}
          </p>
        </div>
      )
    }

    return (
      <p key={index} className="mb-4 text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
        {para}
      </p>
    )
  })

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Passage Panel Header Toolbar */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
        <div className="space-y-0.5 max-w-[60%]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-red-600">
            {topic || 'Academic Reading'}
          </span>
          <h2 className="text-xs font-bold text-zinc-950 dark:text-white truncate">
            {title}
          </h2>
        </div>

        {/* Toolbar: Font resize + Highlighter */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 shadow-xs">
          <button
            type="button"
            onClick={decreaseFont}
            title="Decrease font size"
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetFont}
            title="Reset font size"
            className="px-1.5 py-0.5 rounded text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer font-bold"
          >
            {fontSize}px
          </button>
          <button
            type="button"
            onClick={increaseFont}
            title="Increase font size"
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white text-xs transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <button
            type="button"
            onClick={() => setHighlightActive(!highlightActive)}
            title="Highlighter mode"
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              highlightActive
                ? 'bg-red-600 text-white shadow-xs'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Passage Reading Content */}
      <div
        className="flex-1 overflow-y-auto p-6 select-text"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-black text-zinc-950 dark:text-white mb-6 tracking-tight leading-snug">
            {title}
          </h1>
          {formattedParagraphs}
        </div>
      </div>
    </div>
  )
}
