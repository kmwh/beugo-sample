import React from 'react';
import { useApp } from '../../context/useApp';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-[380px] px-4 pointer-events-none select-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl bg-[#0f0f0f]/95 border border-white/20 text-xs font-semibold text-white transition-all duration-200 animate-in fade-in slide-in-from-top-2"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-400 shrink-0" />}
          <span className="leading-snug">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
