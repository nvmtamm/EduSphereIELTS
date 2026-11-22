import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react'

interface WritingEditorProps {
  promptId: string
  minWordCount: number
  recommendedTimeMinutes: number
  onChange: (content: string, wordCount: number) => void
  disabled?: boolean
}

export const WritingEditor: React.FC<WritingEditorProps> = ({
  promptId,
  minWordCount,
  recommendedTimeMinutes,
  onChange,
  disabled = false
}) => {
  const storageKey = `edusphere_writing_draft_${promptId}`
  const [initialContent] = useState<string>(() => {
    return localStorage.getItem(storageKey) || ''
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: undefined
      })
    ],
    content: initialContent,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = editor.storage.characterCount.words()
      onChange(text, words)
      localStorage.setItem(storageKey, text)
    }
  })

  const words = editor?.storage.characterCount.words() ?? 0
  const progressPercent = Math.min(100, Math.round((words / minWordCount) * 100))
  const isGoalMet = words >= minWordCount

  // Trigger initial word count on mount
  useEffect(() => {
    if (editor && initialContent) {
      const w = editor.storage.characterCount.words()
      onChange(initialContent, w)
    }
  }, [editor])

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your current essay draft?')) {
      editor?.commands.clearContent()
      localStorage.removeItem(storageKey)
      onChange('', 0)
    }
  }

  if (!editor) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-400">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              editor.isActive('bold')
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              editor.isActive('italic')
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            className={`p-1.5 rounded-lg text-sm transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().undo()}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().redo()}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || words === 0}
            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40 transition-colors"
            title="Clear Draft"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-6 overflow-y-auto cursor-text font-serif text-base leading-relaxed selection:bg-red-500 selection:text-white">
        <EditorContent
          editor={editor}
          className="prose dark:prose-invert max-w-none focus:outline-none min-h-[350px]"
          placeholder="Compose your IELTS academic essay here... Focus on clear paragraph organization, accurate grammar, and formal lexical choices."
        />
      </div>

      {/* Word Count Progress Footer */}
      <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-950/90 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
              isGoalMet
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            {isGoalMet ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>
              {words} / {minWordCount} words
            </span>
          </div>

          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {isGoalMet
              ? 'Minimum word count met'
              : `${minWordCount - words} words needed`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-48 flex items-center gap-2">
          <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isGoalMet ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 min-w-[32px] text-right">
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  )
}
