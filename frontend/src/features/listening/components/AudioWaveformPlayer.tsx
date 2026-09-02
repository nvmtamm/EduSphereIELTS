import React, { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Gauge, 
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { formatAudioTime } from '../utils/listeningScoring';

// Section label used in multi-audio FullTest mode
const SECTION_LABELS: Record<number, string> = {
  1: 'S1 · Social Dialogue',
  2: 'S2 · Social Monologue',
  3: 'S3 · Academic Discussion',
  4: 'S4 · Academic Lecture'
};

interface AudioWaveformPlayerProps {
  audioUrl: string | string[];
  onTimeUpdate?: (currentTime: number) => void;
  onSeek?: (seekTime: number) => void;
  onEnded?: () => void;
  onSectionChange?: (sectionIndex: number) => void;
  seekTime?: number | null;
  className?: string;
  compact?: boolean;
  singlePlayMode?: boolean; // F-01: Cambridge one-play constraint
  sectionLabels?: Record<number, string>; // F-04: custom labels per section index
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  audioUrl,
  onTimeUpdate,
  onSeek,
  onEnded,
  onSectionChange,
  seekTime,
  className = '',
  compact = false,
  singlePlayMode = false,
  sectionLabels
}) => {
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const audioUrls = Array.isArray(audioUrl) ? audioUrl : [audioUrl];
  const [hasFinished, setHasFinished] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const resolvedUrl = React.useMemo(() => {
    const url = audioUrls[currentAudioIndex];
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') ? url : `/${url}`;
  }, [audioUrls, currentAudioIndex]);

  useEffect(() => {
    if (!containerRef.current || !resolvedUrl) return;

    setIsLoading(true);
    setIsReady(false);
    setHasError(false);

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    try {
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#94a3b8',
        progressColor: '#DC2626',
        cursorColor: '#991B1B',
        cursorWidth: 2,
        barWidth: 3,
        barGap: 2,
        barRadius: 3,
        height: compact ? 36 : 56,
        normalize: true,
        url: resolvedUrl
      });

      ws.on('ready', () => {
        setIsReady(true);
        setIsLoading(false);
        setDuration(ws.getDuration());
        ws.setVolume(volume);
        ws.setPlaybackRate(playbackRate);
      });

      ws.on('timeupdate', (time) => {
        setCurrentTime(time);
        onTimeUpdate?.(time);
      });

      ws.on('seeking', (time) => {
        setCurrentTime(time);
        onSeek?.(time);
      });

      ws.on('play', () => setIsPlaying(true));
      ws.on('pause', () => setIsPlaying(false));
      ws.on('finish', () => {
        if (currentAudioIndex < audioUrls.length - 1) {
          // F-04: auto-advance to next section audio
          const nextIdx = currentAudioIndex + 1;
          setTimeout(() => {
            setCurrentAudioIndex(nextIdx);
            onSectionChange?.(nextIdx);
          }, 800);
        } else {
          setIsPlaying(false);
          // F-01: mark as finished for single-play lock
          if (singlePlayMode) setHasFinished(true);
          onEnded?.();
        }
      });

      ws.on('error', (err) => {
        console.error('Wavesurfer audio decode error:', err);
        setIsLoading(false);
        setHasError(true);
      });

      wavesurferRef.current = ws;
    } catch (e) {
      setIsLoading(false);
      setHasError(true);
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [resolvedUrl, compact]);

  useEffect(() => {
    if (seekTime != null && wavesurferRef.current && isReady) {
      wavesurferRef.current.setTime(seekTime);
      setCurrentTime(seekTime);
    }
  }, [seekTime, isReady]);

  const togglePlayPause = useCallback(() => {
    if (singlePlayMode && hasFinished) return;
    if (!wavesurferRef.current || !isReady) return;
    wavesurferRef.current.playPause();
  }, [isReady, singlePlayMode, hasFinished]);

  const handleSkip = useCallback((seconds: number) => {
    if (!wavesurferRef.current || !isReady) return;
    const newTime = Math.min(Math.max(0, wavesurferRef.current.getCurrentTime() + seconds), duration);
    wavesurferRef.current.setTime(newTime);
  }, [isReady, duration]);

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (wavesurferRef.current) wavesurferRef.current.setPlaybackRate(rate);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (wavesurferRef.current) wavesurferRef.current.setVolume(newVolume);
  };

  const toggleMute = () => {
    if (!wavesurferRef.current) return;
    if (isMuted) {
      wavesurferRef.current.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      wavesurferRef.current.setVolume(0);
      setIsMuted(true);
    }
  };

  const speedOptions = [0.75, 0.8, 1.0, 1.2, 1.25, 1.5];

  const isMultiSection = audioUrls.length > 1;

  return (
    <div className={`w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-5 transition-all ${className}`}>

      {/* F-04: Multi-section progress tabs */}
      {isMultiSection && (
        <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto">
          {audioUrls.map((_, idx) => {
            const label = sectionLabels?.[idx] ?? SECTION_LABELS[idx + 1] ?? `Section ${idx + 1}`;
            const isDone = idx < currentAudioIndex;
            const isActive = idx === currentAudioIndex;
            return (
              <div
                key={idx}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {isDone ? '✓ ' : ''}{label}
              </div>
            );
          })}
        </div>
      )}

      {/* Waveform canvas */}
      <div className="relative mb-3 min-h-[44px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/90 dark:bg-zinc-900/90 z-10 rounded-xl backdrop-blur-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading & rendering audio waveform...</span>
            </div>
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-rose-50/90 dark:bg-rose-950/90 z-10 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Audio stream could not be loaded. Please ensure the backend is running.</span>
          </div>
        )}
        {/* F-01: Single-play lock overlay after audio ends */}
        {singlePlayMode && hasFinished && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/75 z-10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 px-4 text-center">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Audio has concluded. IELTS regulations permit one playback only.</span>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full cursor-pointer hover:opacity-95 transition-opacity" />
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleSkip(-5)}
            disabled={!isReady || (singlePlayMode && hasFinished)}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            disabled={!isReady || (singlePlayMode && hasFinished)}
            className={`flex items-center justify-center w-11 h-11 text-white rounded-2xl shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              singlePlayMode && hasFinished
                ? 'bg-zinc-500 dark:bg-zinc-600'
                : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
            }`}
            title={singlePlayMode && hasFinished ? 'Audio playback locked' : isPlaying ? 'Pause' : 'Play'}
          >
            {singlePlayMode && hasFinished
              ? <Lock className="w-4 h-4" />
              : isPlaying
              ? <Pause className="w-5 h-5 fill-current" />
              : <Play className="w-5 h-5 fill-current ml-0.5" />
            }
          </button>

          <button
            type="button"
            onClick={() => handleSkip(5)}
            disabled={!isReady || (singlePlayMode && hasFinished)}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Forward 5 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Time Counter */}
          <div className="ml-1 sm:ml-2 font-mono text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg">
            <span>{formatAudioTime(currentTime)}</span>
            <span className="text-zinc-400 dark:text-zinc-500 mx-1">/</span>
            <span className="text-zinc-500 dark:text-zinc-400">{formatAudioTime(duration)}</span>
          </div>

          {/* F-01: Single-play status badge */}
          {singlePlayMode && (
            <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${
              hasFinished
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}>
              <Lock className="w-2.5 h-2.5" />
              {hasFinished ? 'Audio Played' : '1× Play Only'}
            </span>
          )}
        </div>

        {/* Right: Speed & Volume */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Speed Selector */}
          <div className={`flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl ${
            singlePlayMode && hasFinished ? 'opacity-40 pointer-events-none' : ''
          }`}>
            <Gauge className="w-3.5 h-3.5 text-zinc-500 ml-1.5 hidden sm:inline-block" />
            <div className="flex gap-0.5">
              {speedOptions.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition-all ${
                    playbackRate === rate
                      ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 lg:w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
