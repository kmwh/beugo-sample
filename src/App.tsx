import React from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { BottomNav } from './components/layout/BottomNav';
import { FeedView } from './components/feed/FeedView';
import { ExploreView } from './components/explore/ExploreView';
import { CoursesView } from './components/courses/CoursesView';
import { MyPageView } from './components/mypage/MyPageView';
import { LoginModal } from './components/auth/LoginModal';
import { ClipQuizModal } from './components/quiz/ClipQuizModal';
import { CourseFinalQuizModal } from './components/quiz/CourseFinalQuizModal';
import { Toast } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { activePage } = useApp();

  return (
    <div className="min-h-screen w-full bg-[#050608] flex justify-center text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Mobile-First Container (Modoodoc Frame: Max 460px) */}
      <div className="w-full max-w-[460px] min-h-screen bg-[#090a0f] border-x border-white/[0.06] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col relative overflow-x-hidden">
        
        {/* Main Page Views (No Header, floating logo only on Home) */}
        <main className="flex-1 w-full flex flex-col overflow-hidden pb-14">
          {activePage === 'home' && <FeedView />}
          {activePage === 'explore' && <ExploreView />}
          {activePage === 'courses' && <CoursesView />}
          {activePage === 'mypage' && <MyPageView />}
        </main>

        {/* Bottom Navigation (홈, 탐색, 강좌, 내 페이지) */}
        <BottomNav />

        {/* Global Modals & Notifications */}
        <LoginModal />
        <ClipQuizModal />
        <CourseFinalQuizModal />
        <Toast />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
