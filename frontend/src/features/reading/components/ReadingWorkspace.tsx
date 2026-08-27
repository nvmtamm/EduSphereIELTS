import React, { useState, useMemo } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { GripVertical, ChevronLeft, ChevronRight, Send, AlertCircle, HelpCircle, Layers } from 'lucide-react'
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

  const totalQuestions = passage.questions.length
  const currentQuestion = passage.questions[currentQuestionIndex]
  const questionIds = passage.questions.map((q) => q.id)

  // 1. CD-IELTS Parts Configuration (Part 1: 1-13, Part 2: 14-26, Part 3: 27-40 for full 40-question exams)
  const parts = useMemo(() => {
    const p = []
    if (totalQuestions >= 35) {
      // Full 3-Passage Exam (35-40 Questions)
      p.push({ 
        name: 'Part 1', 
        label: 'Passage 1', 
        range: '1–13', 
        startIndex: 0, 
        endIndex: 12,
        sectionIndex: 0
      })
      p.push({ 
        name: 'Part 2', 
        label: 'Passage 2', 
        range: '14–26', 
        startIndex: 13, 
        endIndex: 25,
        sectionIndex: 1
      })
      p.push({ 
        name: 'Part 3', 
        label: 'Passage 3', 
        range: `27–${totalQuestions}`, 
        startIndex: 26, 
        endIndex: totalQuestions - 1,
        sectionIndex: 2
      })
    } else if (totalQuestions > 14) {
      // 2-Passage Exam (e.g. 27 Questions)
      p.push({ 
        name: 'Part 1', 
        label: 'Passage 1', 
        range: '1–13', 
        startIndex: 0, 
        endIndex: Math.min(12, totalQuestions - 1),
        sectionIndex: 0
      })
      p.push({ 
        name: 'Part 2', 
        label: 'Passage 2', 
        range: `14–${totalQuestions}`, 
        startIndex: 13, 
        endIndex: totalQuestions - 1,
        sectionIndex: 1
      })
    }
    return p
  }, [totalQuestions])

  // Active Part based on current question
  const activePart = parts.find((p) => currentQuestionIndex >= p.startIndex && currentQuestionIndex <= p.endIndex) || parts[0]
  const activeSectionNumber = activePart ? activePart.sectionIndex + 1 : 1

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
    <div className="flex-1 h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Top Part Navigation Bar for Multi-Passage Tests */}
      {parts.length > 0 && (
        <div className="px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Exam Parts:</span>
            </span>
            <div className="flex items-center gap-2">
              {parts.map((p) => {
                const isActive = activePart?.name === p.name
                const pAnswered = p ? questionIds.slice(p.startIndex, p.endIndex + 1).filter(id => answers[id]?.trim()).length : 0
                const pTotal = p.endIndex - p.startIndex + 1

                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(p.startIndex)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{p.name} ({p.range})</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-red-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {pAnswered}/{pTotal}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Viewing: <strong className="text-slate-900 dark:text-white">{activePart?.name || 'Section'}</strong> • {totalQuestions} Questions Total
          </div>
        </div>
      )}

      {/* Resizable Split Screen */}
      <Group orientation="horizontal" className="flex-1">
        {/* Left Panel: Passage Text for ACTIVE PART ONLY */}
        <Panel defaultSize={50} minSize={30}>
          <PassagePanel
            key={`${activeSectionNumber}-${activePart?.name}`}
            title={passage.title}
            topic={passage.topic}
            content={passage.content}
            partNumber={activeSectionNumber}
            partName={activePart?.name || 'Part 1'}
          />
        </Panel>

        {/* Resizable Divider Handle */}
        <Separator className="w-2 relative bg-slate-200/80 dark:bg-slate-800 hover:bg-red-600 active:bg-red-700 transition-colors flex items-center justify-center cursor-col-resize group">
          <div className="w-4 h-8 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-red-600 flex items-center justify-center shadow-xs">
            <GripVertical className="w-3 h-3 text-slate-700 dark:text-slate-200 group-hover:text-white" />
          </div>
        </Separator>

        {/* Right Panel: Quiz Pane for ACTIVE PART */}
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
            {/* Top Bar for Quiz */}
            <div className="px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs">
                  Question {currentQuestion?.questionNumber || currentQuestionIndex + 1} of {totalQuestions}
                </span>
                {activePart && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    • {activePart.name}
                  </span>
                )}
                <span className="text-xs text-slate-500 hidden sm:inline font-medium">
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
            <div className="px-6 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
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

            {/* Bottom Question Palette (Filtered to Active Part) */}
            <QuestionPalette
              totalQuestions={totalQuestions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              questionIds={questionIds}
              flaggedQuestions={flaggedQuestions}
              onSelectQuestion={setCurrentQuestionIndex}
              onToggleFlag={handleToggleFlag}
              partRange={activePart}
            />
          </div>
        </Panel>
      </Group>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Ready to submit exam?</h3>
                <p className="text-xs text-slate-500">Your answers will be graded by the official IELTS Scoring Engine.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold border border-slate-200/60 dark:border-slate-700/60">
                Answered: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{answeredCount}/{totalQuestions}</span>
              </div>
              <div className={`p-2 rounded-lg font-bold ${
                unansweredCount > 0
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-slate-800 text-slate-500'
              }`}>
                Unanswered: <span>{unansweredCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You have {unansweredCount} unanswered questions.</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
