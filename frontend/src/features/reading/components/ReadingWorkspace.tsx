import React, { useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { GripVertical, ChevronLeft, ChevronRight, Send, AlertCircle, HelpCircle } from 'lucide-react'
import type { ReadingPassageDetail } from '../types/reading.types'
import { PassagePanel } from './PassagePanel'
import { QuestionPalette } from './QuestionPalette'
import { TrueFalseNotGivenRenderer } from './renderers/TrueFalseNotGivenRenderer'
import { MatchingHeadingsRenderer } from './renderers/MatchingHeadingsRenderer'
import { MultipleChoiceRenderer } from './renderers/MultipleChoiceRenderer'
import { SummaryCompletionRenderer } from './renderers/SummaryCompletionRenderer'

interface ReadingWorkspaceProps {
  passage: ReadingPassageDetail
  answers: Record<string, string>
  onAnswerChange: (questionId: string, value: string) => void
  onSubmitExam: () => void
  isSubmitting: boolean
}

export const ReadingWorkspace: React.FC<ReadingWorkspaceProps> = ({
  passage,
  answers,
  onAnswerChange,
  onSubmitExam,
  isSubmitting
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const currentQuestion = passage.questions[currentQuestionIndex]
  const questionIds = passage.questions.map((q) => q.id)
  const totalQuestions = passage.questions.length

  const handleToggleFlag = (index: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const answeredCount = questionIds.filter((id) => answers[id] && answers[id].trim().length > 0).length
  const unansweredCount = totalQuestions - answeredCount

  const renderCurrentQuestion = () => {
    if (!currentQuestion) return null

    const val = answers[currentQuestion.id] || ''

    switch (currentQuestion.questionType) {
      case 'TrueFalseNotGiven':
      case 'YesNoNotGiven':
        return (
          <TrueFalseNotGivenRenderer
            question={currentQuestion}
            value={val}
            onChange={(newVal) => onAnswerChange(currentQuestion.id, newVal)}
          />
        )
      case 'MatchingHeadings':
        return (
          <MatchingHeadingsRenderer
            question={currentQuestion}
            value={val}
            onChange={(newVal) => onAnswerChange(currentQuestion.id, newVal)}
          />
        )
      case 'MultipleChoice':
        return (
          <MultipleChoiceRenderer
            question={currentQuestion}
            value={val}
            onChange={(newVal) => onAnswerChange(currentQuestion.id, newVal)}
          />
        )
      case 'SummaryCompletion':
      case 'SentenceCompletion':
      default:
        return (
          <SummaryCompletionRenderer
            question={currentQuestion}
            value={val}
            onChange={(newVal) => onAnswerChange(currentQuestion.id, newVal)}
          />
        )
    }
  }

  return (
    <div className="flex-1 h-[calc(100vh-3.5rem)] overflow-hidden bg-zinc-100 dark:bg-black flex flex-col">
      {/* Resizable Split Screen */}
      <Group orientation="horizontal" className="flex-1">
        {/* Left Panel: Passage Text */}
        <Panel defaultSize={50} minSize={30}>
          <PassagePanel
            title={passage.title}
            topic={passage.topic}
            content={passage.content}
          />
        </Panel>

        {/* Resizable Divider Handle */}
        <Separator className="w-2 relative bg-zinc-200 dark:bg-zinc-800 hover:bg-red-600 active:bg-red-700 transition-colors flex items-center justify-center cursor-col-resize group">
          <div className="w-4 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-red-600 flex items-center justify-center shadow-sm">
            <GripVertical className="w-3 h-3 text-zinc-700 dark:text-zinc-200 group-hover:text-white" />
          </div>
        </Separator>

        {/* Right Panel: Quiz Pane */}
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Top Bar for Quiz */}
            <div className="px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-xs">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-zinc-500 hidden sm:inline font-medium">
                  • {currentQuestion?.questionType}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Test</span>
              </button>
            </div>

            {/* Main Question Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-xl mx-auto space-y-6">
                {renderCurrentQuestion()}
              </div>
            </div>

            {/* Question Navigation Controls */}
            <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentQuestionIndex === totalQuestions - 1}
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 disabled:opacity-30 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Question Palette */}
            <QuestionPalette
              totalQuestions={totalQuestions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              questionIds={questionIds}
              flaggedQuestions={flaggedQuestions}
              onSelectQuestion={setCurrentQuestionIndex}
              onToggleFlag={handleToggleFlag}
            />
          </div>
        </Panel>
      </Group>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Ready to submit exam?</h3>
                <p className="text-xs text-zinc-500">Your answers will be graded by the official IELTS Scoring Engine.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-xs">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                Answered: <span>{answeredCount}/{totalQuestions}</span>
              </div>
              <div className={`p-2 rounded-lg font-bold ${
                unansweredCount > 0
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}>
                Unanswered: <span>{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You have {unansweredCount} unanswered questions.</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Keep Practicing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false)
                  onSubmitExam()
                }}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Grading...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
