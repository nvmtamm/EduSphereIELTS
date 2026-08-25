import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Compass, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Play, 
  Award, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  Zap,
  Target
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { BandRoadmap, TargetBandTier } from '../types/reading.types'
import { BandVocabularyDeckModal } from './BandVocabularyDeckModal'

interface ReadingRoadmapHubProps {
  roadmaps: BandRoadmap[]
  loading: boolean
}

export const ReadingRoadmapHub: React.FC<ReadingRoadmapHubProps> = ({ roadmaps, loading }) => {
  const navigate = useNavigate()
  const [selectedBandTier, setSelectedBandTier] = useState<TargetBandTier>('Band7_0_7_5')
  const [isVocabModalOpen, setIsVocabModalOpen] = useState<boolean>(false)

  const bandTiersConfig: { key: TargetBandTier; label: string; badge: string; color: string; ring: string }[] = [
    { key: 'PreIelts', label: 'Pre-IELTS', badge: '0 – 3.5', color: 'from-emerald-600 to-teal-700', ring: 'border-emerald-500/40 text-emerald-300' },
    { key: 'Band4_0_4_5', label: 'Band 4.0–4.5', badge: 'Elementary', color: 'from-sky-600 to-cyan-700', ring: 'border-sky-500/40 text-sky-300' },
    { key: 'Band5_0_5_5', label: 'Band 5.0–5.5', badge: 'Intermediate', color: 'from-amber-600 to-yellow-700', ring: 'border-amber-500/40 text-amber-300' },
    { key: 'Band6_0_6_5', label: 'Band 6.0–6.5', badge: 'Competent', color: 'from-orange-600 to-amber-700', ring: 'border-orange-500/40 text-orange-300' },
    { key: 'Band7_0_7_5', label: 'Band 7.0–7.5', badge: 'Advanced C1', color: 'from-indigo-600 to-blue-700', ring: 'border-indigo-500/40 text-indigo-300' },
    { key: 'Band8_0_Plus', label: 'Band 8.0–8.5+', badge: 'Master C2', color: 'from-purple-600 to-pink-700', ring: 'border-purple-500/40 text-purple-300' }
  ]

  const activeRoadmap = roadmaps.find((r) => r.bandTier === selectedBandTier) || roadmaps[0]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading visual IELTS Band Roadmaps...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Band Tier Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {bandTiersConfig.map((tier) => {
          const isSelected = selectedBandTier === tier.key
          return (
            <button
              key={tier.key}
              onClick={() => setSelectedBandTier(tier.key)}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center gap-1 relative overflow-hidden ${
                isSelected
                  ? `bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10`
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tier.color}`} />
              )}
              <span className="text-xs font-bold text-white">{tier.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${tier.ring} bg-slate-900/80`}>
                {tier.badge}
              </span>
            </button>
          )
        })}
      </div>

      {/* Active Roadmap Hero Card */}
      {activeRoadmap && (
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Compass className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  Milestone Mastery Path
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {activeRoadmap.title}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {activeRoadmap.description}
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs text-slate-400 font-semibold">Core Focus:</span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-indigo-300 border border-slate-700">
                  {activeRoadmap.targetSkillsSummary}
                </span>
              </div>
            </div>

            {/* Right Action Widgets */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
              {/* Dedicated Vocabulary Deck Button */}
              <button
                onClick={() => setIsVocabModalOpen(true)}
                className="p-4 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/60 hover:border-indigo-500 text-left transition-all flex items-center justify-between group shadow-lg shadow-indigo-950/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Band Vocabulary Deck
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-[11px] text-indigo-300 font-medium">
                      {activeRoadmap.vocabularyCount}+ Academic Words & SM-2 Flashcards
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Progress Summary */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Roadmap Progress</span>
                  <div className="text-lg font-extrabold text-white">
                    {Math.round(activeRoadmap.userMasteryPercentage)}% Complete
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  {activeRoadmap.currentUserStep}/{activeRoadmap.totalMilestones}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Gamified Milestones Path */}
      {activeRoadmap && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              Milestone Challenge Stages
            </h3>
            <span className="text-xs text-slate-400">
              Score ≥ 75% accuracy to unlock the next milestone checkpoint
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeRoadmap.milestones.map((milestone, idx) => {
              const isUnlocked = milestone.stepNumber <= activeRoadmap.currentUserStep
              const isCompleted = milestone.isCompleted

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isCompleted
                      ? 'bg-emerald-950/20 border-emerald-800/60 shadow-lg shadow-emerald-950/30'
                      : isUnlocked
                      ? 'bg-slate-900/90 border-indigo-500/70 ring-1 ring-indigo-500/30 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  {/* Status Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      STAGE 0{milestone.stepNumber}
                    </span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Active Challenge
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-base font-bold text-white">
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {milestone.targetSkill}
                    </p>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      Req: <strong className="text-slate-200">{milestone.minAccuracyToUnlockNext}%</strong> accuracy
                    </div>

                    {milestone.readingPassageId ? (
                      <button
                        onClick={() => navigate(`/reading/exam/${milestone.readingPassageId}`)}
                        disabled={!isUnlocked}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                          isUnlocked
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Test
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Passage in vault</span>
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
