import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/useApp';
import { VideoPlayer } from './VideoPlayer';
import { FloatingActionBar } from './FloatingActionBar';
import { TranscriptMemoSheet } from './TranscriptMemoSheet';
import { QuizBanner } from './QuizBanner';

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
  } = useApp();

  // Home screen shorts: Strictly Episode 1 (Preview) of each course
  const previewClips = useMemo(() => {
    return courses.map(course => course.clips[0]).filter(Boolean);
  }, [courses]);

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
      
      {/* Floating Logo: Only in Home screen, floating top-left with NO background */}
      <div className="absolute top-4 left-4 z-40 pointer-events-none select-none flex items-center gap-1.5">
        <span className="text-lg font-black tracking-tight text-white drop-shadow-md">
          배우고
        </span>
        <span className="text-[10px] font-semibold text-white/70 px-1.5 py-0.5 rounded bg-white/10 backdrop-blur-sm">
          3분 에듀
        </span>
      </div>

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
