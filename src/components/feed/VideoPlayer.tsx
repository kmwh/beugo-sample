import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/useApp';
import type { VideoClip } from '../../types';
import { 
  Play, 
  Pause, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface VideoPlayerProps {
  clip: VideoClip;
  isActive: boolean;
  onTimeUpdate: (currentTime: number, duration: number, progressRatio: number) => void;
  onOpenTranscriptSheet?: () => void;
  targetSeekTime: number | null;
  onClearSeekTime: () => void;
  onTitleClick?: () => void;
  showPreviewBadge?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  clip,
  isActive,
  onTimeUpdate,
  targetSeekTime,
  onClearSeekTime,
  onTitleClick,
  showPreviewBadge,
  isMuted: propIsMuted,
}) => {
  const { 
    recordView, 
    distractionFree, 
    setDistractionFree,
    appSettings,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const isMuted = propIsMuted !== undefined ? propIsMuted : (appSettings.startMuted ?? true);
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

  // 3-second view count tracker (No popup, background record)
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

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
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm"
          />
          <div className="relative z-10 flex items-end justify-center gap-1.5 h-10 mb-2">
            <span className="w-1.5 h-6 bg-zinc-400 rounded-none animate-pulse" />
            <span className="w-1.5 h-10 bg-indigo-400 rounded-none animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-12 bg-white rounded-none animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1.5 h-8 bg-indigo-400 rounded-none animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="w-1.5 h-5 bg-zinc-400 rounded-none animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      )}

      {/* Modern Vignette Gradient (Ensures High Contrast & Readability) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-50% to-black/30 pointer-events-none" />

      {/* Center Play/Pause Pop Animation */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
            {isPlaying ? (
              <Play className="w-7 h-7 fill-white ml-1 text-white" />
            ) : (
              <Pause className="w-7 h-7 fill-white text-white" />
            )}
          </div>
        </div>
      )}


      {/* Bottom-Left Information Overlay */}
      {!distractionFree && (
        <div className="absolute bottom-5 left-0 right-16 px-4 z-20 pointer-events-none flex flex-col gap-2 select-none">
          
          {/* 1. Course Button Bar: Clicking navigates to Course Detail in '강좌' page */}
          <div
            onClick={e => {
              if (onTitleClick) {
                e.stopPropagation();
                onTitleClick();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-zinc-100 hover:bg-black/80 transition-all pointer-events-auto cursor-pointer max-w-full shadow-sm"
          >
            <span className="truncate max-w-[200px]">{clip.courseTitle}</span>
            {onTitleClick && (
              <span className="shrink-0 text-indigo-400 flex items-center gap-0.5 text-[11px] font-bold">
                강좌 보기 <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* 2. Main Clip Headline */}
          <h2 className="text-base font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-2">
            {clip.clipTitle}
          </h2>

          {/* 3. Badges Row: rounded-full YouTube pill badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {showPreviewBadge && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-sm">
                1화 미리보기
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium">
              {clip.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-zinc-200 text-[11px] font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-indigo-400" />
              <span>{clip.episodeIndex}강 / {clip.totalEpisodes}강</span>
            </span>
          </div>

          {/* 4. Instructor Profile Row */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
              <div className="w-5 h-5 rounded-full border border-white/40 overflow-hidden bg-zinc-800 shrink-0">
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.instructorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-white">{clip.instructorName}</span>
              <span className="text-zinc-500 text-[10px]">|</span>
              <span className="text-zinc-300 font-medium text-[11px]">{clip.instructorRole}</span>
            </div>
          </div>

          {/* 5. Keyword Tags */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {clip.tags.map(tag => (
              <span
                key={tag}
                className="text-[10px] font-medium text-zinc-300 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Horizontal Real-Time Video Progress Bar with Red Scrubber Dot from home.png */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-30 h-2 flex items-end cursor-pointer group pointer-events-auto"
        onClick={handleProgressClick}
        title="영상 재생 진행률"
      >
        <div className="w-full h-0.5 group-hover:h-1 bg-white/25 transition-all relative">
          <div
            className="h-full bg-red-600 relative transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          >
            {/* YouTube Red Scrubber Dot from home.png */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_6px_rgba(239,68,68,1)] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
