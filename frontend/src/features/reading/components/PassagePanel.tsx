import React, { useState, useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, Highlighter, BookOpen, Trash2, StickyNote, Languages, X } from 'lucide-react'
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
  const savedRangeRef = useRef<Range | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [noteDraft, setNoteDraft] = useState<string | null>(null)
  const [notes, setNotes] = useState<{ id: number; quote: string; note: string }[]>([])
  const [lookup, setLookup] = useState<{ word: string; loading: boolean; phonetic?: string; meanings: { pos: string; def: string }[]; error?: boolean } | null>(null)

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

    savedRangeRef.current = range.cloneRange()
    setSelectedText(selectedText)
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

  const handleAddNote = () => {
    const range = savedRangeRef.current
    const note = (noteDraft ?? '').trim()
    if (!range || !note) return
    const id = Date.now()
    try {
      const mark = document.createElement('mark')
      mark.className = 'bg-sky-200/90 dark:bg-sky-900/70 text-slate-950 dark:text-sky-100 rounded px-1 py-0.5 border-b-2 border-sky-500 cursor-help'
      mark.title = note
      mark.dataset.noteId = String(id)
      try {
        range.surroundContents(mark)
      } catch {
        mark.appendChild(range.extractContents())
        range.insertNode(mark)
      }
      window.getSelection()?.removeAllRanges()
    } catch (err) {
      console.error('Note error', err)
    }
    setNotes((prev) => [...prev, { id, quote: selectedText, note }])
    setNoteDraft(null)
    setFloatingPos(null)
  }

  const handleDeleteNote = (id: number) => {
    const mark = containerRef.current?.querySelector(`mark[data-note-id="${id}"]`)
    const parent = mark?.parentNode
    if (mark && parent) {
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
      parent.removeChild(mark)
    }
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const handleLookup = async () => {
    const word = selectedText.split(/\s+/)[0]?.replace(/[^A-Za-z'-]/g, '').toLowerCase()
    setFloatingPos(null)
    if (!word) return
    setLookup({ word, loading: true, meanings: [] })
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
      if (!res.ok) throw new Error('not found')
      const data = await res.json()
      const entry = data[0]
      const meanings = (entry.meanings ?? []).slice(0, 3).map((m: { partOfSpeech: string; definitions: { definition: string }[] }) => ({
        pos: m.partOfSpeech,
        def: m.definitions?.[0]?.definition ?? ''
      }))
      setLookup({ word, loading: false, phonetic: entry.phonetic, meanings })
    } catch {
      setLookup({ word, loading: false, meanings: [], error: true })
    }
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
            <span className="text-xs font-bold text-red-600">
              {topic || 'Academic Reading'}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 border border-red-200">
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
            <span className="text-xs hidden sm:inline">{highlightActive ? 'Active' : 'Highlight'}</span>
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
          <div className="p-6 rounded-xl bg-red-50 border border-red-200/80 dark:border-red-900/60 shadow-xs mb-8">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold mb-2">
              <BookOpen className="w-4 h-4" />
              <span>READING PASSAGE {partNumber}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
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
                  <span className="inline-block px-3 py-0.5 rounded-md bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs shadow-xs border border-slate-700">
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

      {/* Notes list */}
      {notes.length > 0 && (
        <div className="absolute bottom-3 left-3 w-64 max-h-40 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md p-2 space-y-1.5 z-40">
          <p className="text-xs font-bold text-sky-600 px-1">My notes ({notes.length})</p>
          {notes.map((n) => (
            <div key={n.id} className="flex items-start gap-1.5 text-xs rounded-lg bg-sky-50 dark:bg-sky-950/40 p-1.5">
              <div className="flex-1 min-w-0">
                <p className="italic text-slate-500 truncate">“{n.quote}”</p>
                <p className="text-slate-800 dark:text-slate-100 font-medium">{n.note}</p>
              </div>
              <button type="button" onClick={() => handleDeleteNote(n.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer" title="Delete note">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dictionary lookup card */}
      {lookup && (
        <div className="absolute top-20 right-4 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md p-3 z-50 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-sm text-slate-900 dark:text-white">{lookup.word}</span>
            <button type="button" onClick={() => setLookup(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer" title="Close">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {lookup.loading && <p className="text-slate-500">Looking up…</p>}
          {lookup.error && <p className="text-slate-500">No definition found.</p>}
          {lookup.phonetic && <p className="text-slate-500 mb-1">{lookup.phonetic}</p>}
          {lookup.meanings.map((m, i) => (
            <p key={i} className="text-slate-700 dark:text-slate-200 mb-1">
              <span className="font-bold text-red-600">{m.pos}</span> — {m.def}
            </p>
          ))}
        </div>
      )}

      {/* Floating selection toolbar: Highlight / Note / Define */}
      {floatingPos && (
        <div
          style={{
            position: 'fixed',
            left: `${floatingPos.x}px`,
            top: `${floatingPos.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 60
          }}
          onMouseUp={(e) => e.stopPropagation()}
          className="animate-in fade-in zoom-in-95 duration-150"
        >
          {noteDraft === null ? (
            <div className="flex items-center gap-1 p-1 bg-slate-900 text-white rounded-xl shadow-md">
              <button type="button" onClick={handleManualHighlight} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-amber-500 cursor-pointer">
                <Highlighter className="w-3 h-3 text-amber-300" /> Highlight
              </button>
              <button type="button" onClick={() => setNoteDraft('')} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-sky-500 cursor-pointer">
                <StickyNote className="w-3 h-3 text-sky-300" /> Note
              </button>
              <button type="button" onClick={handleLookup} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg hover:bg-emerald-500 cursor-pointer">
                <Languages className="w-3 h-3 text-emerald-300" /> Define
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md">
              <input
                autoFocus
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote() }}
                placeholder="Write a note…"
                className="w-48 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white outline-none"
              />
              <button type="button" onClick={handleAddNote} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-600 text-white cursor-pointer">Save</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
