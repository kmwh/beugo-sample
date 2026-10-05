import React from 'react';
import { useApp } from '../../context/useApp';
import type { AppPage } from '../../types';
import { PlaySquare, Compass, BookOpen, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activePage, setActivePage, distractionFree, activeCoursePlayer } = useApp();

  // If in distraction-free or active course player mode, hide nav bar
  if (distractionFree || activeCoursePlayer !== null) {
    return null;
  }

  const tabs: { id: AppPage; label: string; icon: typeof PlaySquare }[] = [
    { id: 'home', label: '홈', icon: PlaySquare },
    { id: 'explore', label: '탐색', icon: Compass },
    { id: 'courses', label: '강좌', icon: BookOpen },
    { id: 'mypage', label: '내 페이지', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-2 flex items-center justify-around pointer-events-auto">
      {tabs.map(tab => {
        const isActive = activePage === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActivePage(tab.id)}
            className={`flex flex-col items-center gap-1 relative py-1 px-3 rounded-lg transition-colors ${
              isActive ? 'text-white font-semibold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[11px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
