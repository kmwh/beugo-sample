import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { 
  X, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

export const CourseFinalQuizModal: React.FC = () => {
  const { 
    activeFinalCourse, 
    closeFinalQuiz, 
    markCourseQuizComplete,
    showToast 
  } = useApp();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  if (!activeFinalCourse || !activeFinalCourse.finalQuiz || activeFinalCourse.finalQuiz.length === 0) {
    return null;
  }

  const quizzes = activeFinalCourse.finalQuiz;
  const currentQuiz = quizzes[currentQuestionIndex];
  const isCurrentAnswered = userAnswers[currentQuestionIndex] !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (isCurrentAnswered) return;

    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizzes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate score and mark complete
      let correct = 0;
      quizzes.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex) {
          correct++;
        }
      });
      const score = Math.round((correct / quizzes.length) * 100);
      markCourseQuizComplete(activeFinalCourse.id, score);
      if (score >= 60) {
        showToast(`축하합니다! 최종 퀴즈 ${score}점으로 강좌를 수료하셨습니다.`, 'success');
      } else {
        showToast(`최종 점수 ${score}점입니다. 재도전하여 60점 이상을 달성해보세요.`, 'info');
      }
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setShowResult(false);
  };

  // Calculate score for display
  let correctCount = 0;
  quizzes.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });
  const scorePercent = Math.round((correctCount / quizzes.length) * 100);
  const isPassed = scorePercent >= 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-[420px] bg-[#0f0f0f] border border-white/15 rounded-2xl p-6 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-300 block tracking-tight">
                강좌 최종 종합 평가 ({quizzes.length}문항)
              </span>
              <span className="text-xs text-zinc-300 font-medium line-clamp-1">
                {activeFinalCourse.title}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeFinalQuiz}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showResult ? (
          <div className="mt-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
              <span>문항 {currentQuestionIndex + 1} / {quizzes.length}</span>
              <span className="text-indigo-400 font-bold">{Math.round(((currentQuestionIndex + 1) / quizzes.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${((currentQuestionIndex + 1) / quizzes.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <h3 className="text-sm font-bold text-white mb-4 leading-relaxed">
              Q{currentQuestionIndex + 1}. {currentQuiz.question}
            </h3>

            {/* Choices */}
            <div className="space-y-2">
              {currentQuiz.options.map((opt, optIdx) => {
                let style = 'bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200';
                let icon = null;

                if (isCurrentAnswered) {
                  if (optIdx === currentQuiz.correctIndex) {
                    style = 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-bold shadow-sm';
                    icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                  } else if (optIdx === userAnswers[currentQuestionIndex]) {
                    style = 'bg-rose-950/60 border-rose-500/80 text-rose-200 font-bold shadow-sm';
                    icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
                  } else {
                    style = 'bg-white/[0.02] border-white/5 text-zinc-600 opacity-50';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isCurrentAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs leading-snug flex items-center justify-between gap-3 transition-all ${style} ${!isCurrentAnswered ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] text-zinc-300 shrink-0 font-mono font-bold">
                        {optIdx + 1}
                      </span>
                      <span className="font-medium text-xs leading-normal">{opt}</span>
                    </div>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation if answered */}
            {isCurrentAnswered && (
              <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="font-bold text-amber-300 mr-1.5 font-mono">[해설]</span>
                <span className="text-zinc-300 leading-relaxed">{currentQuiz.explanation}</span>
              </div>
            )}

            {/* Next Button */}
            {isCurrentAnswered && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-2.5 px-4 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <span>{currentQuestionIndex < quizzes.length - 1 ? '다음 문항' : '최종 결과 보기'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Final Results Screen */
          <div className="mt-4 text-center space-y-3.5">
            {/* Completion Badge */}
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-7 h-7" />
            </div>

            <div className={`inline-block px-3 py-1 rounded-full border text-[11px] font-bold ${
              isPassed ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}>
              {isPassed ? '수료 기준 달성' : '재도전 필요'}
            </div>

            <h3 className="text-base font-bold text-white">
              {isPassed ? '축하합니다! 코스를 수료하셨습니다.' : '수료 기준 점수에 도달하지 못했습니다.'}
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              총 {quizzes.length}문항 중 <span className="text-indigo-400 font-bold">{correctCount}문항</span> 정답
            </p>

            {/* Score Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 my-2">
              <span className="text-[11px] text-zinc-400 font-mono block mb-1">최종 평가 점수</span>
              <span className="text-2xl font-mono font-bold text-white">
                {scorePercent}점 <span className="text-xs font-normal text-zinc-400">/ 100점</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 풀기</span>
              </button>
              <button
                type="button"
                onClick={closeFinalQuiz}
                className="flex-1 py-2.5 px-3 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>수료 완료</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
