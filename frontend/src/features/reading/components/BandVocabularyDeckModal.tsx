import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  BookOpen, 
  Search, 
  Volume2, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { readingApi } from '../api/readingApi'
import type { BandVocabulary, TargetBandTier } from '../types/reading.types'

interface BandVocabularyDeckModalProps {
  isOpen: boolean
  onClose: () => void
  initialBandTier?: TargetBandTier
}

export const BandVocabularyDeckModal: React.FC<BandVocabularyDeckModalProps> = ({
  isOpen,
  onClose,
  initialBandTier = 'Band7_0_7_5'
}) => {
  const [selectedTier, setSelectedTier] = useState<TargetBandTier>(initialBandTier)
  const [vocabularies, setVocabularies] = useState<BandVocabulary[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'list' | 'flashcard'>('list')
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean>(false)

  const tiers: { key: TargetBandTier; label: string; badgeColor: string }[] = [
    { key: 'PreIelts', label: 'Pre-IELTS (0–3.5)', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    { key: 'Band4_0_4_5', label: 'Band 4.0–4.5', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    { key: 'Band5_0_5_5', label: 'Band 5.0–5.5', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { key: 'Band6_0_6_5', label: 'Band 6.0–6.5', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    { key: 'Band7_0_7_5', label: 'Band 7.0–7.5', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    { key: 'Band8_0_Plus', label: 'Band 8.0–8.5+', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
  ]

  useEffect(() => {
    if (isOpen) {
      loadVocabularies()
    }
  }, [isOpen, selectedTier, searchQuery])

  const loadVocabularies = async () => {
    try {
      setLoading(true)
      const data = await readingApi.getVocabularies({
        bandTier: selectedTier,
        search: searchQuery.trim() || undefined
      })
      setVocabularies(data)
      setCurrentCardIndex(0)
      setIsFlipped(false)
    } catch (err) {
      console.error('Failed to load band vocabularies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNextCard = () => {
    setIsFlipped(false)
    setCurrentCardIndex((prev) => (prev + 1) % (vocabularies.length || 1))
  }

  const handlePrevCard = () => {
    setIsFlipped(false)
    setCurrentCardIndex((prev) => (prev - 1 + vocabularies.length) % (vocabularies.length || 1))
  }

  if (!isOpen) return null

  const currentWord = vocabularies[currentCardIndex]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Dedicated Band Vocabulary Deck
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {vocabularies.length} Words
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Targeted academic lexical resource tailored to your target IELTS milestone
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Word Bank
                </button>
                <button
                  onClick={() => setViewMode('flashcard')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    viewMode === 'flashcard'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Flashcards
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Band Tier Selector Bar */}
          <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center gap-2 overflow-x-auto">
            {tiers.map((tier) => (
              <button
                key={tier.key}
                onClick={() => setSelectedTier(tier.key)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all border ${
                  selectedTier === tier.key
                    ? `${tier.badgeColor} ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10`
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto min-h-[420px]">
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search keywords, meanings, or academic collocations..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Loading specialized vocabulary deck...</p>
                  </div>
                ) : vocabularies.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
                    <p className="text-base font-semibold text-slate-300">No words found</p>
                    <p className="text-xs text-slate-500 mt-1">Try switching to another Band Tier or search query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vocabularies.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                                {item.word}
                                <span className="text-xs font-normal text-slate-400">{item.phonetic}</span>
                              </h3>
                              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                                {item.partOfSpeech} • CEFR {item.academicLevel}
                              </span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {item.bandTier}
                            </span>
                          </div>

                          <p className="text-sm text-slate-300 mt-2 font-medium">
                            {item.meaning}
                          </p>

                          {item.exampleSentence && (
                            <p className="text-xs text-slate-400 italic mt-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                              "{item.exampleSentence}"
                            </p>
                          )}
                        </div>

                        {/* Collocations & Synonyms */}
                        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5">
                          {item.collocations && item.collocations.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Collocations:</span>
                              {item.collocations.map((c, i) => (
                                <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.synonyms && item.synonyms.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Synonyms:</span>
                              {item.synonyms.map((s, i) => (
                                <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Flashcard Mode (SuperMemo SM-2 Card View) */
              <div className="flex flex-col items-center justify-center max-w-lg mx-auto py-4">
                {currentWord ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
                      <span>Card {currentCardIndex + 1} of {vocabularies.length}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {currentWord.academicLevel} Level
                      </span>
                    </div>

                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="cursor-pointer relative w-full h-80 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-indigo-500/40 p-8 flex flex-col items-center justify-center text-center shadow-2xl transition-all hover:border-indigo-400"
                    >
                      <div className="absolute top-4 right-4 text-xs text-indigo-400 flex items-center gap-1 font-medium bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/50">
                        <RotateCw className="w-3.5 h-3.5" />
                        Click to flip
                      </div>

                      {!isFlipped ? (
                        <div className="space-y-4">
                          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                            {currentWord.partOfSpeech}
                          </span>
                          <h2 className="text-3xl font-extrabold text-white tracking-wide">
                            {currentWord.word}
                          </h2>
                          <p className="text-sm font-mono text-slate-400">
                            {currentWord.phonetic}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-left w-full">
                          <div>
                            <span className="text-[11px] font-bold text-indigo-400 uppercase">Meaning</span>
                            <p className="text-base font-semibold text-white mt-0.5">
                              {currentWord.meaning}
                            </p>
                          </div>

                          {currentWord.exampleSentence && (
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 uppercase">Example</span>
                              <p className="text-xs text-slate-300 italic mt-0.5 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                                "{currentWord.exampleSentence}"
                              </p>
                            </div>
                          )}

                          {currentWord.collocations && currentWord.collocations.length > 0 && (
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 uppercase">Key Collocations</span>
                              <div className="flex gap-1.5 flex-wrap mt-1">
                                {currentWord.collocations.map((c, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-6 gap-4">
                      <button
                        onClick={handlePrevCard}
                        className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <button
                        onClick={handleNextCard}
                        className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors"
                      >
                        Next Word
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">No flashcards available in this tier.</div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
