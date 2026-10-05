import React from 'react';
import { useApp } from '../../context/useApp';
import { X, LogIn, CheckCircle2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, loginModalMessage } = useApp();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-[390px] bg-[#0f0f0f] border border-white/15 rounded-2xl p-6 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <LogIn className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">로그인</h3>
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Message */}
        <div className="my-3.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 font-medium leading-relaxed">
          {loginModalMessage}
        </div>

        {/* Benefits list */}
        <div className="space-y-2.5 my-4 bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>관심 직무 맞춤 숏폼 추천</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>내 강의실 강좌 수강 및 연속 학습일 기록</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>자막 하이라이트 및 학습 메모 저장</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>강좌별 학습 진도율 및 최종 수료 퀴즈 응시</span>
          </div>
        </div>

        {/* Fast 1-Click Login Button */}
        <button
          type="button"
          onClick={login}
          className="w-full py-2.5 px-4 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-all cursor-pointer shadow-sm"
        >
          간편 로그인 (김직장 계정으로 시작)
        </button>

        {/* Skip button */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={closeLoginModal}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
