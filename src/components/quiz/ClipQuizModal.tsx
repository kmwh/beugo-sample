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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[390px] bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl text-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-zinc-800 text-indigo-400">
              <HelpCircle className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">
                1문항 확인 퀴즈
              </span>
              <span className="text-xs text-zinc-200 font-medium line-clamp-1">
                {clip.clipTitle}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeClipQuiz}
            className="p-1 text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Text */}
        <div className="my-4">
          <h3 className="text-sm font-semibold text-white leading-relaxed">
            Q. {quiz.question}
          </h3>
        </div>

        {/* Choices */}
        <div className="space-y-2">
          {quiz.options.map((option, idx) => {
            let itemStyle = 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 text-zinc-200';
            let icon = null;

            if (isAnswered) {
              if (idx === quiz.correctIndex) {
                itemStyle = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-medium';
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
              } else if (idx === selectedIndex) {
                itemStyle = 'bg-rose-950/40 border-rose-500/50 text-rose-300 font-medium';
                icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
              } else {
                itemStyle = 'bg-zinc-900/40 border-zinc-900 text-zinc-600';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3 rounded-xl border text-xs leading-snug flex items-center justify-between gap-3 transition-colors ${itemStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 shrink-0 font-medium">
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation Box on Answer */}
        {isAnswered && (
          <div className="mt-3.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs">
            <div className="font-semibold mb-1">
              {isCorrect ? (
                <span className="text-emerald-400">정답입니다!</span>
              ) : (
                <span className="text-rose-400">오답입니다.</span>
              )}
            </div>
            <p className="text-zinc-400 leading-relaxed">
              {quiz.explanation}
            </p>
          </div>
        )}

        {/* Close Action */}
        {isAnswered && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={closeClipQuiz}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>계속 시청하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
