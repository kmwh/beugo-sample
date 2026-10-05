import React from 'react';
import { useApp } from '../../context/useApp';
import { PlaySquare, Compass } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activePage, setActivePage, activeCoursePlayer, user } = useApp();

  // Only hide bottom nav when active course full-screen player is opened
  if (activeCoursePlayer !== null) {
    return null;
  }

  const userInitial = user?.name ? user.name[0] : '김';

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] z-40 bg-[#0f0f0f]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around pointer-events-auto shadow-2xl">
      {/* 1. 홈 (Shorts Feed) */}
      <button
        type="button"
        onClick={() => setActivePage('home')}
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
          activePage === 'home' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <svg 
          className="w-5 h-5 transition-transform" 
          viewBox="0 0 24 24" 
          fill={activePage === 'home' ? 'white' : 'none'} 
          stroke={activePage === 'home' ? 'white' : 'currentColor'}
          strokeWidth={activePage === 'home' ? '0' : '1.8'}
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M17.77 10.32L15.93 9.27L17.84 8.16C19.78 7.04 20.43 4.58 19.31 2.64C18.19 0.7 15.73 0.05 13.79 1.17L6.16 5.58C4.54 6.52 3.65 8.3 3.86 10.15C4.07 12 5.34 13.53 7.11 14.07L6.16 14.62C4.22 15.74 3.57 18.2 4.69 20.14C5.81 22.08 8.27 22.73 10.21 21.61L17.84 17.2C19.46 16.26 20.35 14.48 20.14 12.63C19.93 10.78 18.66 9.25 16.89 8.71L17.77 10.32ZM10 14.5V8.5L15 11.5L10 14.5Z" 
            fill="currentColor"
          />
        </svg>
        <span className={`text-[10px] tracking-tight ${
          activePage === 'home' ? 'font-bold text-white' : 'font-medium text-zinc-400'
        }`}>
          홈
        </span>
      </button>

      {/* 2. 탐색 (Explore) */}
      <button
        type="button"
        onClick={() => setActivePage('explore')}
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
          activePage === 'explore' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Compass 
          className={`w-5 h-5 transition-transform ${
            activePage === 'explore' ? 'text-white stroke-[2.2]' : 'stroke-[1.8]'
          }`} 
        />
        <span className={`text-[10px] tracking-tight ${
          activePage === 'explore' ? 'font-bold text-white' : 'font-medium text-zinc-400'
        }`}>
          탐색
        </span>
      </button>

      {/* 3. 강좌 (Courses / 내 강의실) */}
      <button
        type="button"
        onClick={() => setActivePage('courses')}
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
          activePage === 'courses' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div className="relative">
          <PlaySquare 
            className={`w-5 h-5 transition-transform ${
              activePage === 'courses' ? 'fill-white text-white' : 'stroke-[1.8]'
            }`} 
          />
          {/* Subtle red notification dot on courses */}
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
        </div>
        <span className={`text-[10px] tracking-tight ${
          activePage === 'courses' ? 'font-bold text-white' : 'font-medium text-zinc-400'
        }`}>
          강좌
        </span>
      </button>

      {/* 4. 내 페이지 (My Page) */}
      <button
        type="button"
        onClick={() => setActivePage('mypage')}
        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all ${
          activePage === 'mypage' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <div 
          className={`w-5.5 h-5.5 rounded-full bg-[#f04b23] text-white flex items-center justify-center text-[10px] font-bold transition-all shadow-sm ${
            activePage === 'mypage' ? 'ring-2 ring-white scale-105' : 'opacity-85'
          }`}
        >
          {userInitial}
        </div>
        <span className={`text-[10px] tracking-tight ${
          activePage === 'mypage' ? 'font-bold text-white' : 'font-medium text-zinc-400'
        }`}>
          내 페이지
        </span>
      </button>
    </nav>
  );
};
