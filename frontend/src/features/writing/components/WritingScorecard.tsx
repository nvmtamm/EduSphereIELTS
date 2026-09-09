import React, { useState } from 'react'
import type { WritingSubmissionDetail } from '../types/writing.types'
import { WritingRadarChart } from './WritingRadarChart'
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react'

interface WritingScorecardProps {
  submission: WritingSubmissionDetail
}

export const WritingScorecard: React.FC<WritingScorecardProps> = ({ submission }) => {
  const [activeTab, setActiveTab] = useState<'criteria' | 'grammar' | 'vocab' | 'model'>('criteria')
  const evalResult = submission.evaluationResult

  const criteriaList = [
    {
      name: submission.taskType === 'Task1' ? 'Task Achievement' : 'Task Response',
      score: submission.taskAchievementScore,
      data: evalResult?.taskAchievement
    },
    {
      name: 'Coherence & Cohesion',
      score: submission.coherenceCohesionScore,
      data: evalResult?.coherenceCohesion
    },
    {
      name: 'Lexical Resource',
      score: submission.lexicalResourceScore,
      data: evalResult?.lexicalResource
    },
    {
      name: 'Grammatical Range & Accuracy',
      score: submission.grammaticalRangeScore,
      data: evalResult?.grammaticalRange
    }
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner with Overall Band & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        {/* Overall Score Badge */}
        <div className="flex flex-col items-center justify-center text-center p-6 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
          <span className="text-xs uppercase tracking-widest font-black text-red-600 dark:text-red-500 mb-1">
            Official IELTS Band
          </span>
          <div className="text-6xl font-black tracking-tight text-zinc-950 dark:text-white">
            {submission.overallBandScore.toFixed(1)}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-600/10 text-red-600 dark:text-red-400">
            <Award className="w-3.5 h-3.5" />
            <span>
              {submission.overallBandScore >= 7.5
                ? 'Expert / Very Good User'
                : submission.overallBandScore >= 6.5
                ? 'Competent Academic User'
                : 'Developing Academic User'}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 w-full grid grid-cols-2 gap-2 text-xs text-zinc-500">
            <div>
              <span className="block text-zinc-400">Word Count</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {submission.wordCount} words
              </span>
            </div>
            <div>
              <span className="block text-zinc-400">Time Spent</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {Math.round(submission.timeSpentSeconds / 60)} mins
              </span>
            </div>
          </div>
        </div>

        {/* 4-Criteria Radar Chart */}
        <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
            Performance Breakdown
          </span>
          <WritingRadarChart
            taskAchievement={submission.taskAchievementScore}
            coherenceCohesion={submission.coherenceCohesionScore}
            lexicalResource={submission.lexicalResourceScore}
            grammaticalRange={submission.grammaticalRangeScore}
          />
        </div>

        {/* Overall Examiner Feedback */}
        <div className="flex flex-col justify-between p-6 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-base mb-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>Examiner Diagnostic Summary</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {evalResult?.generalSummary || submission.generalFeedback}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span>Status: Evaluated by AI Examiner</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cambridge Rubric Verified
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('criteria')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'criteria'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          4 Assessment Criteria
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('grammar')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'grammar'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span>Grammar & Paraphrase Diff</span>
          {evalResult?.grammarErrors?.length ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-black">
              {evalResult.grammarErrors.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vocab')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'vocab'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span>Academic Vocabulary</span>
          {evalResult?.vocabularySuggestions?.length ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-black">
              {evalResult.vocabularySuggestions.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('model')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'model'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Essay Submission</span>
        </button>
      </div>

      {/* Tab 1: 4 Assessment Criteria */}
      {activeTab === 'criteria' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {criteriaList.map((crit, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">
                  {crit.name}
                </h4>
                <span className="px-3 py-1 rounded-full text-sm font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                  Band {crit.score.toFixed(1)}
                </span>
              </div>

              {crit.data?.bandDescriptor && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800/60 italic">
                  "{crit.data.bandDescriptor}"
                </div>
              )}

              {/* Strengths */}
              {crit.data?.strengths && crit.data.strengths.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {crit.data.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {crit.data?.areasForImprovement && crit.data.areasForImprovement.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Priorities for Next Band
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {crit.data.areasForImprovement.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Grammar & Paraphrase Diff */}
      {activeTab === 'grammar' && (
        <div className="space-y-4">
          {evalResult?.grammarErrors && evalResult.grammarErrors.length > 0 ? (
            evalResult.grammarErrors.map((err, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <span>Issue #{idx + 1}</span>
                  <span>•</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {err.errorExplanation}
                  </span>
                </div>

                {/* Original with error */}
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-sm font-mono text-red-700 dark:text-red-300">
                  <span className="font-bold select-none text-red-500 mr-2">[- Original]:</span>
                  {err.originalSentence}
                </div>

                {/* Direct Correction */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm font-mono text-zinc-800 dark:text-zinc-200">
                  <span className="font-bold select-none text-emerald-500 mr-2">[+ Corrected]:</span>
                  {err.suggestedCorrection}
                </div>

                {/* Band 8 Paraphrase */}
                {err.band8Paraphrase && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-sm text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        Band 8.5+ Native Paraphrase
                      </span>
                      <p className="italic font-serif">{err.band8Paraphrase}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500">
              No significant grammatical errors detected. Excellent syntactic accuracy!
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Academic Vocabulary */}
      {activeTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evalResult?.vocabularySuggestions && evalResult.vocabularySuggestions.length > 0 ? (
            evalResult.vocabularySuggestions.map((v, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 uppercase font-bold">Replace</span>
                  <span className="font-mono text-sm line-through text-red-500 font-bold">
                    {v.originalWordOrPhrase}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    Academic Upgrades
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {v.academicAlternatives.map((alt, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                    >
                      {alt}
                    </span>
                  ))}
                </div>

                {v.contextualExample && (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 italic border border-zinc-100 dark:border-zinc-800/60">
                    <span className="font-bold not-italic text-zinc-700 dark:text-zinc-300 block mb-0.5">
                      Contextual Example:
                    </span>
                    "{v.contextualExample}"
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500">
              No lexical replacements recommended. Strong academic vocabulary deployed.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: My Essay Submission */}
      {activeTab === 'model' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-base mb-4">
            <FileText className="w-5 h-5 text-red-600" />
            <span>Candidate Submitted Text</span>
          </div>
          <div className="font-serif text-base leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line p-5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            {submission.content}
          </div>
        </div>
      )}
    </div>
  )
}
