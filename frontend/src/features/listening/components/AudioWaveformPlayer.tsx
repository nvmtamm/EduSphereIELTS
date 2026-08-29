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
  AlertCircle
} from 'lucide-react';
import { formatAudioTime } from '../utils/listeningScoring';

interface AudioWaveformPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onSeek?: (seekTime: number) => void;
  onEnded?: () => void;
  seekTime?: number | null;
  className?: string;
  compact?: boolean;
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  audioUrl,
  onTimeUpdate,
  onSeek,
  onEnded,
  seekTime,
  className = '',
  compact = false
}) => {
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

  // Normalize audio URL
  const resolvedUrl = React.useMemo(() => {
    if (!audioUrl) return '';
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }
    // Relative path
    return audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`;
  }, [audioUrl]);

  // Initialize wavesurfer.js instance
  useEffect(() => {
    if (!containerRef.current || !resolvedUrl) return;

    setIsLoading(true);
    setIsReady(false);
    setHasError(false);

    // Destroy any existing instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    try {
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#94a3b8',
        progressColor: '#2563eb',
        cursorColor: '#1d4ed8',
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
        setIsPlaying(false);
        onEnded?.();
      });

      ws.on('error', (err) => {
        console.error('Wavesurfer audio decode error:', err);
        setIsLoading(false);
        setHasError(true);
      });

      wavesurferRef.current = ws;
    } catch (e) {
      console.error('Failed to create WaveSurfer:', e);
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

  // Handle external seek requests (e.g. clicking transcript)
  useEffect(() => {
    if (seekTime != null && wavesurferRef.current && isReady) {
      wavesurferRef.current.setTime(seekTime);
      setCurrentTime(seekTime);
    }
  }, [seekTime, isReady]);

  const togglePlayPause = useCallback(() => {
    if (!wavesurferRef.current || !isReady) return;
    wavesurferRef.current.playPause();
  }, [isReady]);

  const handleSkip = useCallback((seconds: number) => {
    if (!wavesurferRef.current || !isReady) return;
    const newTime = Math.min(Math.max(0, wavesurferRef.current.getCurrentTime() + seconds), duration);
    wavesurferRef.current.setTime(newTime);
  }, [isReady, duration]);

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(rate);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
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

  return (
    <div className={`w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden p-4 sm:p-5 transition-all ${className}`}>
      {/* Waveform Visualization Canvas */}
      <div className="relative mb-3 min-h-[44px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50/90 dark:bg-zinc-900/90 z-10 rounded-xl backdrop-blur-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
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

        <div ref={containerRef} className="w-full cursor-pointer hover:opacity-95 transition-opacity" />
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleSkip(-5)}
            disabled={!isReady}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-40"
            title="Rewind 5 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            disabled={!isReady}
            className="flex items-center justify-center w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleSkip(5)}
            disabled={!isReady}
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-40"
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
        </div>

        {/* Right: Speed Multiplier & Volume Control */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
            <Gauge className="w-3.5 h-3.5 text-zinc-500 ml-1.5 hidden sm:inline-block" />
            <div className="flex gap-0.5">
              {speedOptions.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition-all ${
                    playbackRate === rate
                      ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
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
              className="w-16 lg:w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
