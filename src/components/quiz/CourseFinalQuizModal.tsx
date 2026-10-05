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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-zinc-800 text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-300 block">
                강좌 최종 종합 퀴즈 ({quizzes.length}문항)
              </span>
              <span className="text-xs text-zinc-400 font-medium line-clamp-1">
                {activeFinalCourse.title}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeFinalQuiz}
            className="p-1 text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showResult ? (
          <div className="mt-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span>문항 {currentQuestionIndex + 1} / {quizzes.length}</span>
              <span className="text-indigo-400 font-medium">{Math.round(((currentQuestionIndex + 1) / quizzes.length) * 100)}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${((currentQuestionIndex + 1) / quizzes.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <h3 className="text-sm font-semibold text-white mb-3.5 leading-relaxed">
              Q{currentQuestionIndex + 1}. {currentQuiz.question}
            </h3>

            {/* Choices */}
            <div className="space-y-2">
              {currentQuiz.options.map((opt, optIdx) => {
                let style = 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 text-zinc-200';
                let icon = null;

                if (isCurrentAnswered) {
                  if (optIdx === currentQuiz.correctIndex) {
                    style = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-medium';
                    icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
                  } else if (optIdx === userAnswers[currentQuestionIndex]) {
                    style = 'bg-rose-950/40 border-rose-500/50 text-rose-300 font-medium';
                    icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
                  } else {
                    style = 'bg-zinc-900/40 border-zinc-900 text-zinc-600';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={isCurrentAnswered}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs leading-snug flex items-center justify-between gap-3 transition-colors ${style}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 shrink-0 font-medium">
                        {optIdx + 1}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation if answered */}
            {isCurrentAnswered && (
              <div className="mt-3.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300">
                <span className="font-semibold text-zinc-200 mr-1.5">[해설]</span>
                <span className="text-zinc-400">{currentQuiz.explanation}</span>
              </div>
            )}

            {/* Next Button */}
            {isCurrentAnswered && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{currentQuestionIndex < quizzes.length - 1 ? '다음 문항' : '최종 결과 보기'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Final Results Screen */
          <div className="mt-4 text-center">
            {/* Completion Badge */}
            <div className="w-12 h-12 rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-full bg-zinc-800 text-amber-400 text-xs font-medium mb-2">
              {isPassed ? '수료 완료' : '재도전 권장'}
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              {isPassed ? '강좌 최종 종합 평가 합격!' : '아쉽게 기준 점수에 미치지 못했습니다.'}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              총 {quizzes.length}문항 중 <span className="text-indigo-400 font-semibold">{correctCount}문항</span> 정답
            </p>

            {/* Score Card */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 mb-4">
              <span className="text-[11px] text-zinc-400 font-medium block mb-1">최종 점수</span>
              <span className="text-2xl font-bold text-white">
                {scorePercent}점 / 100점
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRestart}
                className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 풀기</span>
              </button>
              <button
                type="button"
                onClick={closeFinalQuiz}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>완료</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
