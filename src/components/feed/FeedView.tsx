import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/useApp';
import { VideoPlayer } from './VideoPlayer';
import { FloatingActionBar } from './FloatingActionBar';
import { TranscriptMemoSheet } from './TranscriptMemoSheet';
import { QuizBanner } from './QuizBanner';
import { Search, Volume2, VolumeX } from 'lucide-react';
import type { JobCategory } from '../../types';

export const FeedView: React.FC = () => {
  const { 
    courses,
    activeFeedClipId, 
    setActiveFeedClipId, 
    targetSeekTime,
    clearTargetSeekTime,
    openClipQuiz,
    setSelectedCourseDetailId,
    setActivePage,
    distractionFree,
  } = useApp();

  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Filter categories
  const categories = ['전체', '프론트엔드', '백엔드', '기획/PM', '세무/회계(스마트A)', '데이터/AI'];

  // Home screen shorts: Episode 1 (Preview) of each course
  const previewClips = useMemo(() => {
    const clips = courses.map(course => course.clips[0]).filter(Boolean);
    if (selectedCategory === '전체') return clips;
    return clips.filter(c => c.category === selectedCategory as JobCategory);
  }, [courses, selectedCategory]);

  const activeClip = useMemo(() => {
    return previewClips.find(c => c.id === activeFeedClipId) || previewClips[0];
  }, [previewClips, activeFeedClipId]);

  const [isTranscriptSheetOpen, setIsTranscriptSheetOpen] = useState(false);
  const [currentVideoSeconds, setCurrentVideoSeconds] = useState(0);
  const [showQuizBanner, setShowQuizBanner] = useState(false);
  const [hasDismissedBanner, setHasDismissedBanner] = useState(false);
  const [lastTrackedClipId, setLastTrackedClipId] = useState(activeFeedClipId);

  // Reset banner state when clip changes
  if (activeFeedClipId !== lastTrackedClipId) {
    setLastTrackedClipId(activeFeedClipId);
    setShowQuizBanner(false);
    setHasDismissedBanner(false);
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Viewport intersection observer: only the centered preview clip has isActive=true
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const clipId = entry.target.getAttribute('data-clip-id');
            if (clipId && clipId !== activeFeedClipId) {
              setActiveFeedClipId(clipId);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    previewClips.forEach(clip => {
      const el = itemRefs.current[clip.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [previewClips, activeFeedClipId, setActiveFeedClipId]);

  // Scroll to clip if needed
  useEffect(() => {
    const el = itemRefs.current[activeFeedClipId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeFeedClipId]);

  const handleTimeUpdate = (cur: number, _dur: number, ratio: number) => {
    setCurrentVideoSeconds(cur);

    // 80% Clip Quiz Trigger
    if (ratio >= 0.8 && !hasDismissedBanner && !showQuizBanner && activeClip?.clipQuiz) {
      setShowQuizBanner(true);
    }
  };

  const handleSeekFromSheet = (seconds: number) => {
    const video = containerRef.current?.querySelector(`[data-clip-id="${activeFeedClipId}"] video`) as HTMLVideoElement | null;
    if (video) {
      video.currentTime = seconds;
      video.play().catch(() => {});
    }
    setIsTranscriptSheetOpen(false);
  };

  // Navigates to Course Detail page in '강좌' tab
  const handleTitleClick = (courseId: string) => {
    setSelectedCourseDetailId(courseId);
    setActivePage('courses');
  };

  if (!activeClip) return null;

  return (
    <div className="relative w-full h-[calc(100dvh-56px)] min-h-[500px] bg-black overflow-hidden select-none">
      
      {/* Top Header Bar */}
      {!distractionFree && (
        <div className="absolute top-0 inset-x-0 z-40 px-3.5 pt-3 pb-1 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center justify-between w-full">
            {/* Left: beugo service logo */}
            <div className="flex items-center select-none">
              <span className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                beugo
              </span>
            </div>

            {/* Right Controls: Volume Button to the LEFT of Search (돋보기) */}
            <div className="flex items-center gap-1 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsMuted(prev => !prev)}
                className="p-2 text-white hover:text-zinc-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] active:scale-95 transition-all cursor-pointer"
                title={isMuted ? '음소거 해제' : '음소거'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 stroke-[2.2]" />
                ) : (
                  <Volume2 className="w-5 h-5 stroke-[2.2]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActivePage('explore')}
                className="p-2 text-white hover:text-zinc-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] active:scale-95 transition-all cursor-pointer"
                title="강좌 검색"
              >
                <Search className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Filter Chips Row: horizontal scrollable pills like home.png */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto pb-0.5">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  const matched = courses.find(c => cat === '전체' || c.category === cat);
                  if (matched?.clips[0]) {
                    setActiveFeedClipId(matched.clips[0].id);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md active:scale-95 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-black shadow-white/20'
                    : 'bg-black/50 text-white/90 backdrop-blur-md border border-white/20 hover:bg-black/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Continuous Vertical Scroll Container (Previews Only) */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {previewClips.map(clip => {
          const isActive = clip.id === activeFeedClipId;

          return (
            <div
              key={clip.id}
              ref={el => { itemRefs.current[clip.id] = el; }}
              data-clip-id={clip.id}
              className="relative w-full h-full min-h-full snap-start snap-always flex items-center justify-center overflow-hidden"
            >
              <VideoPlayer
                clip={clip}
                isActive={isActive}
                onTimeUpdate={handleTimeUpdate}
                onOpenTranscriptSheet={() => setIsTranscriptSheetOpen(true)}
                targetSeekTime={isActive ? targetSeekTime : null}
                onClearSeekTime={clearTargetSeekTime}
                onTitleClick={() => handleTitleClick(clip.courseId)}
                showPreviewBadge={true}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(prev => !prev)}
              />

              {/* Floating Action Bar */}
              {isActive && (
                <FloatingActionBar
                  clip={clip}
                  onOpenTranscriptSheet={() => setIsTranscriptSheetOpen(true)}
                />
              )}

              {/* 80% Progress Clip Confirmation Quiz Card */}
              {isActive && showQuizBanner && clip.clipQuiz && (
                <QuizBanner
                  clip={clip}
                  quiz={clip.clipQuiz}
                  onOpenQuiz={() => {
                    setShowQuizBanner(false);
                    openClipQuiz(clip, clip.clipQuiz);
                  }}
                  onDismiss={() => {
                    setShowQuizBanner(false);
                    setHasDismissedBanner(true);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Transcript & Memo Bottom Sheet */}
      <TranscriptMemoSheet
        clip={activeClip}
        isOpen={isTranscriptSheetOpen}
        onClose={() => setIsTranscriptSheetOpen(false)}
        currentTimeSeconds={currentVideoSeconds}
        onSeek={handleSeekFromSheet}
      />
    </div>
  );
};
