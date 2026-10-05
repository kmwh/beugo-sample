import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import type { VideoClip } from '../../types';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye, 
  BookOpen,
  ChevronRight
} from 'lucide-react';

interface VideoPlayerProps {
  clip: VideoClip;
  isActive: boolean;
  onTimeUpdate: (currentTime: number, duration: number, progressRatio: number) => void;
  onOpenTranscriptSheet: () => void;
  targetSeekTime: number | null;
  onClearSeekTime: () => void;
  onTitleClick?: () => void;
  showPreviewBadge?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  clip,
  isActive,
  onTimeUpdate,
  targetSeekTime,
  onClearSeekTime,
  onTitleClick,
  showPreviewBadge,
}) => {
  const { 
    recordView, 
    distractionFree, 
    setDistractionFree,
    viewCounts,
    appSettings,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(appSettings.startMuted ?? true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(clip.durationSeconds || 15);
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [prevClipId, setPrevClipId] = useState(clip.id);

  // Reset state if clip changes
  if (clip.id !== prevClipId) {
    setPrevClipId(clip.id);
    setVideoError(false);
    setCurrentTime(0);
  }

  // 3-second view count tracker (No popup, just quiet background record)
  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      recordView(clip.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [clip.id, isActive, recordView]);

  // Sync active play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsMuted(true);
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else {
      video.pause();
    }
  }, [isActive, clip.id]);

  // External seek requests
  useEffect(() => {
    if (targetSeekTime !== null && videoRef.current) {
      videoRef.current.currentTime = targetSeekTime;
      setCurrentTime(targetSeekTime);
      videoRef.current.play().catch(() => {});
      onClearSeekTime();
    }
  }, [targetSeekTime, onClearSeekTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }

    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 400);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const cur = video.currentTime;
    const dur = video.duration || clip.durationSeconds || 15;
    setCurrentTime(cur);
    setDuration(dur);
    const ratio = dur > 0 ? cur / dur : 0;
    onTimeUpdate(cur, dur, ratio);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = newRatio * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentTotalViews = viewCounts[clip.id] || clip.views || 0;

  return (
    <div 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none cursor-pointer"
      onClick={distractionFree ? () => setDistractionFree(false) : togglePlay}
    >
      {/* 1. Video Element */}
      {!videoError ? (
        <video
          ref={videoRef}
          src={clip.videoUrl}
          className="w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || clip.durationSeconds || 15);
            }
          }}
          onError={() => setVideoError(true)}
        />
      ) : (
        /* Fallback Graphic Player */
        <div className="w-full h-full relative flex flex-col items-center justify-center bg-zinc-950 p-6">
          <img
            src={clip.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-15 filter blur-sm"
          />
          <div className="relative z-10 flex items-end justify-center gap-1.5 h-10 mb-2">
            <span className="w-1 h-5 bg-zinc-500 rounded-full animate-pulse" />
            <span className="w-1 h-8 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-10 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-6 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="w-1 h-4 bg-zinc-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

      {/* Center Play/Pause Pop Animation */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-14 h-14 rounded-full bg-zinc-900/80 border border-zinc-700/60 flex items-center justify-center text-white">
            {isPlaying ? <Play className="w-6 h-6 fill-white ml-0.5" /> : <Pause className="w-6 h-6 fill-white" />}
          </div>
        </div>
      )}

      {/* Top Floating Controls: ONLY Volume Toggle on the right (No '조회수+1' popup) */}
      {!distractionFree && (
        <div className="absolute top-4 right-4 z-20 flex items-center pointer-events-none">
          <button
            type="button"
            onClick={toggleMute}
            className="pointer-events-auto p-2 rounded-full bg-zinc-900/70 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-zinc-200" />}
          </button>
        </div>
      )}

      {/* Bottom-Left Metadata Overlay */}
      {!distractionFree && (
        <div className="absolute bottom-5 left-0 right-16 p-4 z-20 pointer-events-none flex flex-col gap-1.5">
          {/* Badge Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {showPreviewBadge && (
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">
                1화 미리보기
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[10px] font-semibold">
              {clip.category}
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 text-[10px] font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-zinc-400" />
              {clip.episodeIndex}/{clip.totalEpisodes}강
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900/80 text-zinc-400 border border-zinc-800 text-[10px] font-medium flex items-center gap-1">
              <Eye className="w-3 h-3 text-zinc-400" />
              <span>{currentTotalViews.toLocaleString()}회</span>
            </span>
          </div>

          {/* Course & Clip Titles: Clicking navigates to Course Detail in '강좌' page */}
          <div
            onClick={e => {
              if (onTitleClick) {
                e.stopPropagation();
                onTitleClick();
              }
            }}
            className={`group pointer-events-auto ${onTitleClick ? 'cursor-pointer hover:opacity-90' : ''}`}
          >
            <div className="flex items-center gap-1 text-xs text-zinc-300 font-medium">
              <span className="line-clamp-1">{clip.courseTitle}</span>
              {onTitleClick && (
                <span className="inline-flex items-center text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-1.5 py-0.2 rounded font-semibold ml-1 shrink-0">
                  강좌 보기 <ChevronRight className="w-3 h-3" />
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white leading-snug line-clamp-2 mt-0.5">
              {clip.clipTitle}
            </h2>
          </div>

          {/* Instructor Role & Name */}
          <div className="flex items-center gap-1.5 pt-0.5 text-xs text-zinc-300">
            <span className="font-medium text-white">{clip.instructorName}</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400 text-[11px]">{clip.instructorRole}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {clip.tags.map(tag => (
              <span key={tag} className="text-[10px] text-zinc-500">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Thin Horizontal Real-Time Video Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-30 h-2 flex items-end cursor-pointer group pointer-events-auto"
        onClick={handleProgressClick}
        title="영상 재생 진행률"
      >
        <div className="w-full h-0.5 group-hover:h-1 bg-white/20 transition-all relative">
          <div
            className="h-full bg-indigo-500 relative transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
