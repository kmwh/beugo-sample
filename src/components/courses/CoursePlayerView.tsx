import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/useApp';
import type { VideoClip } from '../../types';
import { VideoPlayer } from '../feed/VideoPlayer';
import { FloatingActionBar } from '../feed/FloatingActionBar';
import { TranscriptMemoSheet } from '../feed/TranscriptMemoSheet';
import { QuizBanner } from '../feed/QuizBanner';
import { ArrowLeft, Award } from 'lucide-react';

interface CoursePlayerViewProps {
  courseId: string;
  initialClipIndex?: number;
  onExit: () => void;
}

export const CoursePlayerView: React.FC<CoursePlayerViewProps> = ({
  courseId,
  initialClipIndex = 0,
  onExit,
}) => {
  const { 
    courses, 
    completeClipInCourse, 
    openFinalQuiz, 
    openClipQuiz,
    targetSeekTime,
    clearTargetSeekTime
  } = useApp();

  const course = courses.find(c => c.id === courseId);
  const clips: VideoClip[] = useMemo(() => course?.clips || [], [course]);

  const [activeClipIndex, setActiveClipIndex] = useState(
    Math.min(initialClipIndex, Math.max(0, clips.length - 1))
  );
  const activeClip = clips[activeClipIndex] || clips[0];

  const [isTranscriptSheetOpen, setIsTranscriptSheetOpen] = useState(false);
  const [currentVideoSeconds, setCurrentVideoSeconds] = useState(0);
  const [showQuizBanner, setShowQuizBanner] = useState(false);
  const [hasDismissedBanner, setHasDismissedBanner] = useState(false);
  const [lastTrackedClipIndex, setLastTrackedClipIndex] = useState(activeClipIndex);
  const hasTriggeredFinalQuizRef = useRef(false);

  // Reset banner state on clip index change
  if (activeClipIndex !== lastTrackedClipIndex) {
    setLastTrackedClipIndex(activeClipIndex);
    setShowQuizBanner(false);
    setHasDismissedBanner(false);
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Viewport IntersectionObserver: observe only this course's clips
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const clipId = entry.target.getAttribute('data-clip-id');
            const foundIdx = clips.findIndex(c => c.id === clipId);
            if (foundIdx !== -1 && foundIdx !== activeClipIndex) {
              setActiveClipIndex(foundIdx);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    clips.forEach(clip => {
      const el = itemRefs.current[clip.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [clips, activeClipIndex]);

  // Scroll to active clip when activeClipIndex changes
  useEffect(() => {
    const activeId = clips[activeClipIndex]?.id;
    if (activeId && itemRefs.current[activeId]) {
      itemRefs.current[activeId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeClipIndex, clips]);

  const handleTimeUpdate = (cur: number, _dur: number, ratio: number) => {
    setCurrentVideoSeconds(cur);

    if (!activeClip || !course) return;

    // Mark current clip as completed when ratio reaches 70%
    if (ratio >= 0.7) {
      completeClipInCourse(course.id, activeClip.id);
    }

    // Clip confirmation quiz banner at 80%
    if (ratio >= 0.8 && !hasDismissedBanner && !showQuizBanner && activeClip.clipQuiz) {
      setShowQuizBanner(true);
    }

    // When the LAST clip finishes (ratio >= 0.90), trigger the course final quiz!
    const isLastEpisode = activeClip.episodeIndex === activeClip.totalEpisodes;
    if (
      isLastEpisode && 
      ratio >= 0.90 && 
      !hasTriggeredFinalQuizRef.current &&
      course.finalQuiz &&
      course.finalQuiz.length > 0
    ) {
      hasTriggeredFinalQuizRef.current = true;
      openFinalQuiz(course);
    }
  };

  const handleSeekFromSheet = (seconds: number) => {
    const video = containerRef.current?.querySelector(`[data-clip-id="${activeClip?.id}"] video`) as HTMLVideoElement | null;
    if (video) {
      video.currentTime = seconds;
      video.play().catch(() => {});
    }
    setIsTranscriptSheetOpen(false);
  };

  if (!course || clips.length === 0 || !activeClip) {
    return null;
  }

  return (
    <div className="relative w-full h-[calc(100dvh-56px)] min-h-[500px] bg-black overflow-hidden select-none">
      
      {/* Top Floating Course Title Bar & Exit Button */}
      <div className="absolute top-4 left-4 right-16 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={onExit}
          className="p-1.5 text-white hover:text-zinc-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-colors cursor-pointer"
          title="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <div className="bg-black/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 min-w-0 shadow-lg">
          <span className="text-xs font-bold text-white truncate max-w-[170px]">
            {course.title}
          </span>
          <span className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full shrink-0">
            {activeClip.episodeIndex}/{activeClip.totalEpisodes}강
          </span>
        </div>
      </div>

      {/* Manual Quiz Trigger Button for User Convenience */}
      {course.finalQuiz && (
        <button
          type="button"
          onClick={() => openFinalQuiz(course)}
          className="absolute top-4 right-14 z-40 p-2 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 hover:bg-black transition-all shadow-lg pointer-events-auto cursor-pointer"
          title="강좌 최종 종합 퀴즈 응시"
        >
          <Award className="w-4 h-4" />
        </button>
      )}

      {/* Course Clips Vertical Scroll Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {clips.map(clip => {
          const isActive = clip.id === activeClip.id;

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
              />

              {/* Floating Action Bar */}
              {isActive && (
                <FloatingActionBar
                  clip={clip}
                  onOpenTranscriptSheet={() => setIsTranscriptSheetOpen(true)}
                />
              )}

              {/* 80% Clip Quiz Card */}
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

      {/* Transcript & Memo Sheet */}
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
