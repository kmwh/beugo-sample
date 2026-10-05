import React from 'react';
import { useApp } from '../../context/useApp';
import { X, LogIn, CheckCircle2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, loginModalMessage } = useApp();

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-200">
              <LogIn className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">로그인</h3>
          </div>
          <button
            type="button"
            onClick={closeLoginModal}
            className="p-1 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Message */}
        <div className="my-3.5 p-2.5 rounded-xl bg-zinc-800/60 text-xs text-zinc-300">
          {loginModalMessage}
        </div>

        {/* Benefits list */}
        <div className="space-y-2 my-4 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>관심 직무 맞춤 숏폼 추천</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>유료 강좌 소장 및 수강권 관리</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>자막 하이라이트 및 학습 메모 저장</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>강좌별 학습 진도 및 수료 퀴즈 관리</span>
          </div>
        </div>

        {/* Fast 1-Click Login Button */}
        <button
          type="button"
          onClick={login}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
        >
          간편 로그인 (김직장 계정)
        </button>

        {/* Skip button */}
        <div className="mt-2.5 text-center">
          <button
            type="button"
            onClick={closeLoginModal}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
