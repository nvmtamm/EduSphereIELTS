import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Headphones, 
  Sparkles, 
  Search, 
  Play, 
  LayoutGrid, 
  Table as TableIcon,
  Mic,
  Clock,
  Globe,
  Radio,
  Flame
} from 'lucide-react';
import { listeningApi } from '../api/listeningApi';
import type { ListeningTest } from '../types/listening';
import { ListeningExplorerTable } from '../components/ListeningExplorerTable';
import { getAccentBadge, formatAudioTime, getSectionInfo } from '../utils/listeningScoring';

export const ListeningListPage: React.FC = () => {
  const navigate = useNavigate();

  const [tests, setTests] = useState<ListeningTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

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
    { key: 'all', label: 'All Tests & Sections' },
    { key: 0, label: 'Full 4-Part Tests' },
    { key: 1, label: 'Part 1: Social Dialogue' },
    { key: 2, label: 'Part 2: Social Monologue' },
    { key: 3, label: 'Part 3: Academic Discussion' },
    { key: 4, label: 'Part 4: Academic Lecture' }
  ];

  const accentOptions = [
    { key: 'all', label: 'All Accents', flag: '🌐' },
    { key: 'British', label: 'British', flag: '🇬🇧' },
    { key: 'Australian', label: 'Australian', flag: '🇦🇺' },
    { key: 'American', label: 'American', flag: '🇺🇸' },
    { key: 'Mixed', label: 'Mixed', flag: '🌍' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Sleek Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Cambridge Academic Standard • Audio Waveform & Transcript Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
            IELTS Listening Practice Hub
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Master 4 Cambridge IELTS Listening sections with authentic speaker accents, interactive waveform timeline, and real-time transcript tracking.
          </p>
        </div>

        {/* Global Action / Audio Mode Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>HQ Waveform Streaming Active</span>
          </div>
        </div>
      </div>

      {/* 2. Feature Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Exam Structure</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">4 Official Parts (40 Qs)</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Accent Diversity</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">UK 🇬🇧, AUS 🇦🇺, US 🇺🇸</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Transcript Engine</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Real-time Timestamp Sync</div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Scoring Standard</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Band 1.0 – 9.0 Diagnostic</div>
          </div>
        </div>
      </div>

      {/* 3. Section Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sectionTabs.map((tab) => {
          const isSelected = selectedSection === tab.key;
          return (
            <button
              key={String(tab.key)}
              type="button"
              onClick={() => setSelectedSection(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Search & Accents */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tests by title, topic, or Cambridge volume..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>

          {/* Accent Filter */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
            {accentOptions.map((acc) => (
              <button
                key={acc.key}
                type="button"
                onClick={() => setSelectedAccent(acc.key)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedAccent === acc.key
                    ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <span>{acc.flag}</span>
                <span className="hidden sm:inline">{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Difficulty & View Toggle */}
        <div className="flex items-center gap-3">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Table / Grid Switcher */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main Content: Grid vs Table */}
      {viewMode === 'table' ? (
        <ListeningExplorerTable data={tests} isLoading={loading} />
      ) : (
        <div>
          {loading ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading official IELTS Listening exams...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="w-full py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8">
              <Headphones className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Tests Found</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Try selecting a different accent or section to see more tests.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tests.map((test) => {
                const accentBadge = getAccentBadge(test.accent);
                const isFull = test.sectionType === 'FullTest_4Sections' || test.sectionNumber === 0;

                return (
                  <div
                    key={test.id}
                    className="group flex flex-col justify-between p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/40 rounded-3xl shadow-xs hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${accentBadge.bgClass} ${accentBadge.textClass}`}>
                          <span>{accentBadge.flag}</span>
                          <span>{accentBadge.label}</span>
                        </span>

                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          isFull 
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' 
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}>
                          {isFull ? 'Full 4 Parts' : `Section ${test.sectionNumber}`}
                        </span>
                      </div>

                      {/* Title & Topic */}
                      <h3 className="font-bold text-base text-zinc-950 dark:text-white group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        {test.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1.5">
                        {test.topic}
                      </p>

                      {/* Question Types Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {test.questionTypes?.slice(0, 3).map((type: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Info & Start Button */}
                    <div className="pt-4 mt-5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {formatAudioTime(test.durationSeconds)}
                        </span>
                        <span>•</span>
                        <span>{test.totalQuestions} Qs</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/listening/exam/${test.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Test</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
