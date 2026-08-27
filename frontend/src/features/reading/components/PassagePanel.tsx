import React, { useState, useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, Highlighter, BookOpen, Trash2 } from 'lucide-react'
import { sanitizeAndSliceIeltsExams, SanitizedPassageSection } from '../utils/ieltsTextSanitizer'

interface PassagePanelProps {
  title: string
  topic: string
  content: string
  partNumber?: number
  partName?: string
}

export const PassagePanel: React.FC<PassagePanelProps> = ({
  title,
  topic,
  content,
  partNumber = 1,
  partName = 'Part 1'
}) => {
  const [fontSize, setFontSize] = useState<number>(16)
  const [highlightActive, setHighlightActive] = useState<boolean>(false)
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sanitize and structure the passage text
  const sanitized: SanitizedPassageSection = React.useMemo(() => {
    return sanitizeAndSliceIeltsExams(content, partNumber - 1, 2)
  }, [content, partNumber])

  // Reset scroll to top whenever part changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [partNumber, content])

  const increaseFont = () => setFontSize((prev) => Math.min(prev + 1, 22))
  const decreaseFont = () => setFontSize((prev) => Math.max(prev - 1, 14))
  const resetFont = () => setFontSize(16)

  // Interactive Highlighter logic
  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setFloatingPos(null)
      return
    }

    const range = selection.getRangeAt(0)
    if (!containerRef.current || !containerRef.current.contains(range.commonAncestorContainer)) {
      setFloatingPos(null)
      return
    }

    const selectedText = selection.toString().trim()
    if (!selectedText) {
      setFloatingPos(null)
      return
    }

    if (highlightActive) {
      applyHighlightToSelection(range)
      setFloatingPos(null)
      return
    }

    const rect = range.getBoundingClientRect()
    setFloatingPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  const applyHighlightToSelection = (range: Range) => {
    try {
      const mark = document.createElement('mark')
      mark.className = 'bg-amber-200/90 dark:bg-amber-900/70 text-slate-950 dark:text-amber-100 rounded px-1 py-0.5 cursor-pointer hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors shadow-2xs font-semibold'
      mark.title = 'Click to remove highlight'
      mark.onclick = (e) => {
        e.stopPropagation()
        const parent = mark.parentNode
        if (parent) {
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark)
          }
          parent.removeChild(mark)
        }
      }

      try {
        range.surroundContents(mark)
      } catch {
        const fragment = range.extractContents()
        mark.appendChild(fragment)
        range.insertNode(mark)
      }

      window.getSelection()?.removeAllRanges()
    } catch (err) {
      console.error('Highlighter error', err)
    }
  }

  const handleManualHighlight = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      applyHighlightToSelection(selection.getRangeAt(0))
    }
    setFloatingPos(null)
  }

  const handleClearAllHighlights = () => {
    if (!containerRef.current) return
    const marks = containerRef.current.querySelectorAll('mark')
    marks.forEach((mark) => {
      const parent = mark.parentNode
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark)
        }
        parent.removeChild(mark)
      }
    })
  }

  const displayTitle = sanitized.title && sanitized.title !== 'Reading Passage' 
    ? sanitized.title 
    : title.replace(/^IELTS\s+READING\s+TEST\s+\d+\s*/i, '') || 'Academic Reading Passage'

  // Dynamic question range per Cambridge IELTS standard
  const questionRangeText =
    partNumber === 1 ? '1–13' :
    partNumber === 2 ? '14–26' :
    partNumber === 3 ? '27–40' :
    `for Passage ${partNumber}`

  return (
    <div 
      className="h-full flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800 overflow-hidden relative"
      onMouseUp={handleMouseUp}
    >
      {/* Passage Panel Header Toolbar */}
      <div className="px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
        <div className="space-y-0.5 max-w-[60%]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-red-600">
              {topic || 'Academic Reading'}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 border border-red-200">
              {partName} (Passage {partNumber})
            </span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {displayTitle}
          </h2>
        </div>

        {/* Toolbar: Font resize + Highlighter + Clear */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-1 shadow-xs">
          <button
            type="button"
            onClick={decreaseFont}
            title="Decrease font size"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetFont}
            title="Reset font size"
            className="px-2 py-0.5 rounded text-[12px] font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer font-bold"
          >
            {fontSize}px
          </button>
          <button
            type="button"
            onClick={increaseFont}
            title="Increase font size"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Interactive Highlighter Button */}
          <button
            type="button"
            onClick={() => setHighlightActive(!highlightActive)}
            title={highlightActive ? "Highlighter ON (Auto-highlight selections)" : "Turn ON Highlighter Mode"}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              highlightActive
                ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/50'
                : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">{highlightActive ? 'Active' : 'Highlight'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearAllHighlights}
            title="Clear all highlights in this passage"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Passage Reading Content Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 md:p-8 select-text"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Cambridge Academic Reading Header Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-red-50/90 to-slate-50 dark:from-red-950/40 dark:to-slate-900/60 border border-red-200/80 dark:border-red-900/60 shadow-xs mb-8">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>READING PASSAGE {partNumber}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {displayTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              You should spend about 20 minutes on Questions {questionRangeText}, which are based on Reading Passage {partNumber} below.
            </p>
          </div>

          {/* Structured Paragraphs (A, B, C, D, E, F, G, H, I) */}
          {sanitized.paragraphs.length > 0 ? (
            sanitized.paragraphs.map((p, idx) => (
              <div key={idx} className="space-y-2.5">
                {p.letter && (
                  <span className="inline-block px-3 py-0.5 rounded-md bg-slate-900 dark:bg-slate-800 text-white font-black text-xs tracking-wider shadow-xs border border-slate-700">
                    Paragraph {p.letter}
                  </span>
                )}
                <p className="text-slate-800 dark:text-slate-200 leading-[1.85] font-normal">
                  {p.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-800 dark:text-slate-200 leading-[1.85] font-normal">
              {sanitized.rawCleanText || content}
            </p>
          )}
        </div>
      </div>

      {/* Floating Highlight Button on Text Selection */}
      {floatingPos && (
        <div
          style={{
            position: 'fixed',
            left: `${floatingPos.x}px`,
            top: `${floatingPos.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 60
          }}
          className="animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            onClick={handleManualHighlight}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xl hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-white dark:hover:text-white transition-all cursor-pointer"
          >
            <Highlighter className="w-3 h-3 text-amber-400" />
            <span>Highlight</span>
          </button>
        </div>
      )}
    </div>
  )
}
