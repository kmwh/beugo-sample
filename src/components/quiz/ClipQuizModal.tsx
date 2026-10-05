import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { X, CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';

export const ClipQuizModal: React.FC = () => {
  const { 
    activeClipQuiz, 
    closeClipQuiz, 
    showToast,
  } = useApp();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!activeClipQuiz) return null;

  const { clip, quiz } = activeClipQuiz;
  const isAnswered = selectedIndex !== null;
  const isCorrect = isAnswered && selectedIndex === quiz.correctIndex;

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);

    if (index === quiz.correctIndex) {
      showToast('정답입니다!', 'success');
    } else {
      showToast('오답입니다. 해설을 확인해보세요.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-[400px] bg-[#0f0f0f] border border-white/15 rounded-2xl p-6 shadow-2xl text-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-full bg-white/10 text-indigo-400 border border-white/15">
              <HelpCircle className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-bold text-indigo-400 block tracking-tight">
                [{clip.episodeIndex}강] 확인 퀴즈
              </span>
              <span className="text-xs text-zinc-300 font-medium line-clamp-1">
                {clip.clipTitle}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeClipQuiz}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Text */}
        <div className="my-4">
          <h3 className="text-sm font-bold text-white leading-relaxed">
            Q. {quiz.question}
          </h3>
        </div>

        {/* Choices */}
        <div className="space-y-2">
          {quiz.options.map((option, idx) => {
            let itemStyle = 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200';
            let icon = null;

            if (isAnswered) {
              if (idx === quiz.correctIndex) {
                itemStyle = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-bold shadow-sm';
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
              } else if (idx === selectedIndex) {
                itemStyle = 'bg-rose-950/60 border-rose-500/80 text-rose-200 font-bold shadow-sm';
                icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
              } else {
                itemStyle = 'bg-white/[0.02] border-white/5 text-zinc-600 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs leading-snug flex items-center justify-between gap-3 transition-all ${itemStyle} ${!isAnswered ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] text-zinc-300 shrink-0 font-mono font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-xs leading-normal">{option}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation Box on Answer */}
        {isAnswered && (
          <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <div className="font-bold mb-1.5">
              {isCorrect ? (
                <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" /> 정답입니다!
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5 text-xs font-mono">
                  <XCircle className="w-4 h-4" /> 해설을 확인하세요.
                </span>
              )}
            </div>
            <p className="text-zinc-300 leading-relaxed font-normal">
              {quiz.explanation}
            </p>
          </div>
        )}

        {/* Close Action */}
        {isAnswered && (
          <div className="mt-4">
            <button
              type="button"
              onClick={closeClipQuiz}
              className="w-full py-2.5 px-4 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>계속 시청하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
