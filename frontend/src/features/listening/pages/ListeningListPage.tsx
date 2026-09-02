import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  Headphones, 
  Sparkles, 
  Search, 
  Play, 
  LayoutGrid, 
  Table as TableIcon,
  Clock, 
  Radio, 
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Volume2
} from 'lucide-react';
import { listeningApi } from '../api/listeningApi';
import type { ListeningTest } from '../types/listening';
import { ListeningExplorerTable } from '../components/ListeningExplorerTable';
import { getAccentBadge, formatAudioTime } from '../utils/listeningScoring';

export const ListeningListPage: React.FC = () => {
  const navigate = useNavigate();

  const [tests, setTests] = useState<ListeningTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [selectedSection, setSelectedSection] = useState<number | 'all'>('all');
  const [selectedAccent, setSelectedAccent] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await listeningApi.getTests({
        page: 1,
        pageSize: 50,
        sectionNumber: selectedSection !== 'all' ? selectedSection : undefined,
        accent: selectedAccent !== 'all' ? selectedAccent : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        search: searchTerm.trim() || undefined
      });
      setTests(res.items);
    } catch (err) {
      console.error('Failed to load listening tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [selectedSection, selectedAccent, selectedDifficulty, searchTerm]);

  const sectionTabs = [
    { key: 'all', label: 'All Modules' },
    { key: 0, label: 'Full Mock Exams', countBadge: '4 Parts' },
    { key: 1, label: 'Part 1: Dialogue', countBadge: 'Social' },
    { key: 2, label: 'Part 2: Monologue', countBadge: 'Local' },
    { key: 3, label: 'Part 3: Discussion', countBadge: 'Academic' },
    { key: 4, label: 'Part 4: Lecture', countBadge: 'University' }
  ];

  const accentOptions = [
    { key: 'all', label: 'All Accents', flag: '🌐' },
    { key: 'British', label: 'British', flag: '🇬🇧' },
    { key: 'Australian', label: 'Australian', flag: '🇦🇺' },
    { key: 'American', label: 'American', flag: '🇺🇸' },
    { key: 'Mixed', label: 'Mixed Accents', flag: '🌍' }
  ];

  // Separate featured full test from section tests
  const { featuredTest, regularTests } = useMemo(() => {
    if (selectedSection !== 'all') {
      return { featuredTest: null, regularTests: tests };
    }
    const full = tests.find(t => t.sectionType === 'FullTest_4Sections' || t.sectionNumber === 0);
    const rest = tests.filter(t => t.id !== full?.id);
    return { featuredTest: full || null, regularTests: rest };
  }, [tests, selectedSection]);

  // Framer motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.35, ease: 'easeOut' as const } 
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* 1. Hero Bento Banner: Learner Studio */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-2xl p-6 sm:p-8 lg:p-10"
      >
        {/* Subtle red background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-red-800/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left Hero Content */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Official Cambridge Standard • Cloud Audio Streaming</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              IELTS Listening <span className="text-red-500">Practice Hub</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Simulate authentic computer-delivered exam conditions with native speaker accents, interactive waveform timeline sync, and Cambridge band score diagnostics.
            </p>

            {/* Quick Feature Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                AWS S3 HQ Audio
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                30-Min Real Exam Timers
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
                <Volume2 className="w-3.5 h-3.5 text-red-400" />
                Multi-Accent Sync
              </span>
            </div>
          </div>

          {/* Right Diagnostic Card */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md space-y-4 shrink-0 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Diagnostic Goal</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-md border border-red-800/40">
                <Flame className="w-3.5 h-3.5 fill-current" /> Target Band 7.5+
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Exam Parts</span>
                <span className="font-bold text-white font-mono-exam">4 Sections (40 Qs)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Audio Storage</span>
                <span className="font-bold text-emerald-400 font-mono-exam">AWS S3 Cloud</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Engine</span>
                <span className="font-bold text-white font-mono-exam">WaveSurfer v7</span>
              </div>
            </div>

            {featuredTest && (
              <button
                type="button"
                onClick={() => navigate(`/listening/exam/${featuredTest.id}`)}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Launch Full Mock Exam</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. Section Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sectionTabs.map((tab) => {
          const isSelected = selectedSection === tab.key;
          return (
            <button
              key={String(tab.key)}
              type="button"
              onClick={() => setSelectedSection(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 scale-[1.02]'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80'
              }`}
            >
              <span>{tab.label}</span>
              {tab.countBadge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {tab.countBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Filter Toolbar & Search */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Search Input & Accent Pills */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tests by title, topic, Cambridge vol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>

          {/* Accent Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl">
            {accentOptions.map((acc) => (
              <button
                key={acc.key}
                type="button"
                onClick={() => setSelectedAccent(acc.key)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  selectedAccent === acc.key
                    ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>{acc.flag}</span>
                <span className="hidden sm:inline">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Difficulty & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="Easy">Band 5.0–6.0 (Easy)</option>
              <option value="Medium">Band 6.5–7.0 (Medium)</option>
              <option value="Hard">Band 7.5–9.0 (Hard)</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Content: Bento Grid vs Table */}
      {viewMode === 'table' ? (
        <ListeningExplorerTable data={tests} isLoading={loading} />
      ) : (
        <div>
          {loading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <div className="w-9 h-9 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Loading Cambridge IELTS listening tests from cloud...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="w-full py-20 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-3">
              <Headphones className="w-12 h-12 text-zinc-400 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No Tests Found</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                No exams match your selected accent or difficulty filter. Try selecting 'All Modules' or clearing the search.
              </p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Featured Full Exam Banner Card (if available and viewing 'all') */}
              {featuredTest && (
                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl border border-zinc-800 hover:border-red-600/40 shadow-xl transition-all"
                >
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-lg text-xs font-black bg-red-600 text-white uppercase tracking-wider">
                          ★ Featured Full Test
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-700 bg-zinc-800/80 text-zinc-300">
                          {featuredTest.collectionName}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold border border-purple-500/30 bg-purple-500/10 text-purple-400">
                          🌍 Mixed Native Accents
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black group-hover:text-red-400 transition-colors">
                        {featuredTest.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2">
                        {featuredTest.topic}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {formatAudioTime(featuredTest.durationSeconds)} Total
                        </span>
                        <span>•</span>
                        <span className="font-bold text-white font-mono-exam">{featuredTest.totalQuestions} Questions</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">4 Parts Complete Diagnostic</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/listening/dictation/${featuredTest.id}`)}
                        className="px-4 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                        title="Practice typing audio scripts for this test"
                      >
                        <Headphones className="w-4 h-4 text-red-400" />
                        <span>Dictation Studio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/listening/exam/${featuredTest.id}`)}
                        className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start Full Exam</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Regular Section Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularTests.map((test) => {
                  const accentBadge = getAccentBadge(test.accent);
                  const isFull = test.sectionType === 'FullTest_4Sections' || test.sectionNumber === 0;

                  return (
                    <motion.div
                      key={test.id}
                      variants={itemVariants}
                      className="group card-spotlight flex flex-col justify-between p-6 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl shadow-xs hover:shadow-xl transition-all"
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${accentBadge.bgClass} ${accentBadge.textClass}`}>
                            <span>{accentBadge.flag}</span>
                            <span>{accentBadge.label}</span>
                          </span>

                          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                            isFull 
                              ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' 
                              : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                          }`}>
                            {isFull ? 'Full 4 Parts' : `Part ${test.sectionNumber}`}
                          </span>
                        </div>

                        {/* Title & Topic */}
                        <h3 className="font-bold text-base text-zinc-950 dark:text-white group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                          {test.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                          {test.topic}
                        </p>

                        {/* Question Types Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {test.questionTypes?.slice(0, 3).map((type: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 rounded-lg"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Info & Start Button */}
                      <div className="pt-4 mt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            {formatAudioTime(test.durationSeconds)}
                          </span>
                          <span>•</span>
                          <span className="font-mono-exam font-bold text-zinc-800 dark:text-zinc-200">{test.totalQuestions} Qs</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/listening/dictation/${test.id}`)}
                            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                            title="Practice Dictation on this test"
                          >
                            <Headphones className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/listening/exam/${test.id}`)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Exam</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
