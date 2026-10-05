import React from 'react';
import { HelpCircle, ArrowRight, X } from 'lucide-react';
import type { VideoClip, QuizItem } from '../../types';

interface QuizBannerProps {
  clip: VideoClip;
  quiz: QuizItem;
  onOpenQuiz: () => void;
  onDismiss: () => void;
}

export const QuizBanner: React.FC<QuizBannerProps> = ({
  clip,
  quiz,
  onOpenQuiz,
  onDismiss,
}) => {
  return (
    <div className="absolute top-12 left-3 right-3 z-40 animate-in fade-in duration-200 pointer-events-auto">
      <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-lg text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-300">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-zinc-400">
              학습 확인 퀴즈
            </span>
            <span className="text-xs font-semibold text-zinc-100 truncate">
              {quiz.question}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenQuiz}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            <span>[{clip.episodeIndex}강 퀴즈 풀기]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
            title="닫기"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
