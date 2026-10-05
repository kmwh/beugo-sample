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
    <div className="absolute top-16 left-3 right-3 z-40 animate-in fade-in duration-200 pointer-events-auto select-none">
      <div className="bg-[#0f0f0f]/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-3.5 shadow-2xl text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-300">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-indigo-400">
              [{clip.episodeIndex}강 학습 확인 퀴즈]
            </span>
            <span className="text-xs font-bold text-white truncate mt-0.5">
              {quiz.question}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenQuiz}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <span>퀴즈 풀기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
