import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Compass, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Play, 
  Sparkles, 
  ArrowRight, 
  Target,
  Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { BandRoadmap, TargetBandTier } from '../types/reading.types'
import { BandVocabularyDeckModal } from './BandVocabularyDeckModal'
import { Button } from '@/shared/components/ui/button'

interface ReadingRoadmapHubProps {
  roadmaps: BandRoadmap[]
  loading: boolean
}

export const ReadingRoadmapHub: React.FC<ReadingRoadmapHubProps> = ({ roadmaps, loading }) => {
  const navigate = useNavigate()
  const [selectedBandTier, setSelectedBandTier] = useState<TargetBandTier>('Band7_0_7_5')
  const [isVocabModalOpen, setIsVocabModalOpen] = useState<boolean>(false)

  const bandTiersConfig: { key: TargetBandTier; label: string; score: string }[] = [
    { key: 'PreIelts', label: 'Pre-IELTS', score: '0 – 3.5' },
    { key: 'Band4_0_4_5', label: 'Band 4.0–4.5', score: 'Elementary' },
    { key: 'Band5_0_5_5', label: 'Band 5.0–5.5', score: 'Intermediate' },
    { key: 'Band6_0_6_5', label: 'Band 6.0–6.5', score: 'Competent' },
    { key: 'Band7_0_7_5', label: 'Band 7.0–7.5', score: 'Advanced' },
    { key: 'Band8_0_Plus', label: 'Band 8.0–8.5+', score: 'Expert Master' }
  ]

  const activeRoadmap = roadmaps.find((r) => r.bandTier === selectedBandTier) || roadmaps[0]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-base font-semibold">Loading IELTS Band Roadmaps...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 1. Segmented Control Band Tier Selector Bar with Subtle Red Dot */}
      <div className="p-2 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {bandTiersConfig.map((tier) => {
          const isSelected = selectedBandTier === tier.key
          return (
            <button
              key={tier.key}
              onClick={() => setSelectedBandTier(tier.key)}
              className={`p-3.5 rounded-xl transition-all flex flex-col items-center text-center gap-1.5 cursor-pointer relative ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block shrink-0 animate-pulse" />
                )}
                <span className="text-[13.5px] font-bold">{tier.label}</span>
              </div>
              <span
                className={`text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tier.score}
              </span>
            </button>
          )
        })}
      </div>

      {/* 2. Active Roadmap Header Summary - Spacious & Airy Typography */}
      {activeRoadmap && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-7 md:p-9 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900 text-xs font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  IELTS Band Milestone Roadmap
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {activeRoadmap.title}
              </h2>

              <p className="text-[15px] md:text-[16px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {activeRoadmap.description}
              </p>

              <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Core Focus:</span>
                <span className="text-[13.5px] px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-200/80 dark:border-slate-700">
                  {activeRoadmap.targetSkillsSummary}
                </span>
              </div>
            </div>

            {/* Right Action Tools */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 min-w-[270px]">
              {/* Dedicated Vocabulary Deck Button */}
              <button
                onClick={() => setIsVocabModalOpen(true)}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-left transition-all flex items-center justify-between group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-amber-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[14px] font-black text-slate-900 dark:text-white flex items-center gap-1">
                      Band Vocabulary Deck
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                      {activeRoadmap.vocabularyCount}+ Words & Flashcards
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Progress Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Roadmap Progress</span>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {Math.round(activeRoadmap.userMasteryPercentage)}% Complete
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400 font-black text-[13px]">
                  {activeRoadmap.currentUserStep}/{activeRoadmap.totalMilestones}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Milestone Challenge Stages Grid - Spacious & High Contrast */}
      {activeRoadmap && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              Milestone Challenge Stages
            </h3>
            <span className="text-xs md:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              Score ≥ 75% accuracy to unlock the next milestone checkpoint
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeRoadmap.milestones.map((milestone, idx) => {
              const isUnlocked = milestone.stepNumber <= activeRoadmap.currentUserStep
              const isCompleted = milestone.isCompleted
              const isCurrent = milestone.stepNumber === activeRoadmap.currentUserStep

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isCompleted
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 shadow-xs'
                      : isCurrent
                      ? 'bg-white dark:bg-slate-900 border-red-600/80 ring-2 ring-red-600/20 shadow-md'
                      : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60'
                  }`}
                >
                  {/* Status Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="text-[12px] font-mono font-black px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      STAGE 0{milestone.stepNumber}
                    </span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Completed
                      </span>
                    ) : isCurrent ? (
                      <span className="flex items-center gap-1.5 text-[12px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-3 py-1 rounded-full border border-red-200 dark:border-red-900">
                        <Zap className="w-4 h-4 text-red-500" />
                        Active Challenge
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Card Title and Target Skill */}
                  <div className="space-y-2 mb-5">
                    <h4 className={`text-[16px] font-black leading-snug ${isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {milestone.title}
                    </h4>
                    <p className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {milestone.targetSkill}
                    </p>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[12.5px] text-slate-500 font-medium">
                      Req: <strong className="text-slate-900 dark:text-white font-bold">{milestone.minAccuracyToUnlockNext}%</strong> accuracy
                    </div>

                    {milestone.readingPassageId ? (
                      <Button
                        size="sm"
                        disabled={!isUnlocked}
                        onClick={() => navigate(`/reading/exam/${milestone.readingPassageId}`)}
                        className={`font-bold text-[13px] px-3.5 py-2 ${
                          isCurrent
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}
                        variant={isCurrent ? 'default' : 'outline'}
                      >
                        <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                        Start Test
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Passage in vault</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vocabulary Deck Modal */}
      <BandVocabularyDeckModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        initialBandTier={selectedBandTier}
      />
    </div>
  )
}
