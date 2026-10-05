import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import type { JobCategory, User } from '../../types';
import { 
  Bookmark, 
  Heart, 
  Settings, 
  User as UserIcon, 
  Play, 
  Trash2, 
  LogOut, 
  LogIn, 
  Clock, 
  Sun, 
  Briefcase, 
  Moon, 
  VolumeX, 
  Bell, 
  Film,
  Compass,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  FolderLock,
  ListVideo,
  ArrowLeft
} from 'lucide-react';

const CATEGORIES: { label: JobCategory; desc: string; icon: string }[] = [
  { label: '프론트엔드', desc: 'React 19, Next.js 실무', icon: '⚡' },
  { label: '백엔드', desc: 'Spring Boot, 분산 시스템', icon: '🛠️' },
  { label: '기획/PM', desc: '애자일, 유저스토리 작성법', icon: '📊' },
  { label: '세무/회계(스마트A)', desc: '더존 스마트A, 부가세 실무', icon: '📑' },
  { label: '데이터/AI', desc: 'ChatGPT 프롬프트 엔지니어링', icon: '🤖' },
];

const TIME_SLOTS = [
  { id: 'commute', label: '출퇴근길', icon: Briefcase },
  { id: 'lunch', label: '점심시간', icon: Sun },
  { id: 'night', label: '취침 전', icon: Moon },
];

export const MyPageView: React.FC = () => {
  const {
    user,
    isLoggedIn,
    login,
    logout,
    updateUserProfile,
    savedClipIds,
    toggleSaveClip,
    likedClipIds,
    toggleLike,
    allClips,
    goToClip,
    onboarding,
    updateOnboarding,
    appSettings,
    updateAppSettings,
    setActivePage,
    showToast,
  } = useApp();

  // Navigation subpage state (Requirement 3: Navigate like detail page instead of modal)
  const [isSettingsSubpage, setIsSettingsSubpage] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState<'goals' | 'app' | 'profile'>('goals');
  const [selectedFolder, setSelectedFolder] = useState<'saved' | 'liked' | null>(null);

  // Profile Edit Draft
  const [profileDraft, setProfileDraft] = useState<Partial<User>>({
    name: user?.name || '',
    role: user?.role || '',
    company: user?.company || '',
    avatar: user?.avatar || '',
  });

  // Goal & Interests Draft
  const [selectedInterests, setSelectedInterests] = useState<JobCategory[]>(
    onboarding.interests.length > 0 ? onboarding.interests : ['프론트엔드', '기획/PM']
  );
  const [draftTargetMinutes, setDraftTargetMinutes] = useState<number>(
    onboarding.dailyTargetMinutes || 10
  );
  const [draftTimeSlot, setDraftTimeSlot] = useState<string>(
    onboarding.preferredTimeSlot || 'commute'
  );

  // Filtered Clips
  const savedClips = allClips.filter(c => savedClipIds.has(c.id));
  const likedClips = allClips.filter(c => likedClipIds.has(c.id));
  const recentHistoryClips = allClips.slice(0, 6);

  // Handlers
  const handleOpenSettings = (tab: 'goals' | 'app' | 'profile' = 'goals') => {
    setProfileDraft({
      name: user?.name || '',
      role: user?.role || '',
      company: user?.company || '',
      avatar: user?.avatar || '',
    });
    setSelectedInterests(onboarding.interests.length > 0 ? onboarding.interests : ['프론트엔드', '기획/PM']);
    setDraftTargetMinutes(onboarding.dailyTargetMinutes || 10);
    setDraftTimeSlot(onboarding.preferredTimeSlot || 'commute');
    setSettingsActiveTab(tab);
    setIsSettingsSubpage(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileDraft);
  };

  const toggleInterest = (cat: JobCategory) => {
    setSelectedInterests(prev => {
      if (prev.includes(cat)) {
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleSaveGoals = () => {
    updateOnboarding({
      interests: selectedInterests,
      dailyTargetMinutes: draftTargetMinutes,
      preferredTimeSlot: draftTimeSlot,
    });
    showToast('학습 목표가 저장되었습니다.', 'success');
  };

  const handlePlayClip = (clipId: string) => {
    goToClip(clipId);
    setSelectedFolder(null);
    setActivePage('home');
  };

  const handlePlayAllInFolder = (folder: 'saved' | 'liked') => {
    const list = folder === 'saved' ? savedClips : likedClips;
    if (list.length > 0) {
      handlePlayClip(list[0].id);
    } else {
      showToast('재생할 영상이 없습니다.', 'warning');
    }
  };

  const userInitial = user?.name ? user.name[0] : '김';

  // ==========================================
  // VIEW 1: Settings Subpage (Requirement 3)
  // ==========================================
  if (isSettingsSubpage) {
    return (
      <div className="w-full min-h-full bg-[#090a0f] text-zinc-100 flex flex-col p-4 pb-24 no-scrollbar select-none">
        
        {/* Top Back Navigation Bar: Pure Arrow without box or label */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsSubpage(false)}
              className="p-1 -ml-1 text-white hover:text-zinc-300 transition-colors cursor-pointer"
              title="뒤로가기"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h1 className="text-base font-bold text-white tracking-tight">설정</h1>
          </div>
        </div>

        {/* Tab Selection Pills */}
        <div className="pt-3.5 pb-2 flex bg-white/5 border border-white/10 p-1 rounded-full shrink-0 my-3">
          <button
            type="button"
            onClick={() => setSettingsActiveTab('goals')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              settingsActiveTab === 'goals'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            관심사 / 목표
          </button>
          <button
            type="button"
            onClick={() => setSettingsActiveTab('app')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              settingsActiveTab === 'app'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            기본 설정
          </button>
          <button
            type="button"
            onClick={() => setSettingsActiveTab('profile')}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              settingsActiveTab === 'profile'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            프로필 관리
          </button>
        </div>

        {/* Tab 1: 관심사 및 일일 목표 (Interests & Goals) */}
        {settingsActiveTab === 'goals' && (
          <div className="flex-1 space-y-4 pt-1">
            {/* Interest categories */}
            <div className="space-y-2 bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-md">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-400" />
                관심 직무 분야 (1개 이상 선택)
              </span>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {CATEGORIES.map(c => {
                  const isChecked = selectedInterests.includes(c.label);
                  return (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => toggleInterest(c.label)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-950/60 border-indigo-500/80 text-white font-bold'
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.icon}</span>
                        <div>
                          <p className="font-semibold text-xs leading-none">{c.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{c.desc}</p>
                        </div>
                      </div>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Target */}
            <div className="space-y-2 bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-md">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                하루 목표 학습량
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[10, 20, 30].map(minutes => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setDraftTargetMinutes(minutes)}
                    className={`py-2 px-1 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                      draftTargetMinutes === minutes
                        ? 'bg-white text-black border-white font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{minutes}분</span>
                    <span className="block text-[10px] opacity-75">약 {Math.round(minutes / 3)}편</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-2 bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-md">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                선호 학습 시간대
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {TIME_SLOTS.map(t => {
                  const Icon = t.icon;
                  const isChecked = draftTimeSlot === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDraftTimeSlot(t.id)}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-white text-black border-white font-bold shadow-sm'
                          : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveGoals}
                className="w-full py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
              >
                목표 저장하기
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: 기본 설정 (서비스 환경설정) */}
        {settingsActiveTab === 'app' && (
          <div className="flex-1 space-y-3 pt-1">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 space-y-3.5 shadow-md">
              {/* Autoplay toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-white block">자동 다음 영상 재생</span>
                  <span className="text-[11px] text-zinc-400">영상 시청 완료 시 다음 숏폼으로 연속 전환</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.autoPlay}
                  onChange={e => updateAppSettings({ autoPlay: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer shrink-0 rounded"
                />
              </div>

              {/* Start Muted toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                    시작 시 기본 음소거
                  </span>
                  <span className="text-[11px] text-zinc-400">이동 중 소음 방지를 위해 기본 무음 재생</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.startMuted}
                  onChange={e => updateAppSettings({ startMuted: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer shrink-0 rounded"
                />
              </div>

              {/* Notifications toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-zinc-400" />
                    학습 리마인드 알림 받기
                  </span>
                  <span className="text-[11px] text-zinc-400">선호 시간대에 숏폼 학습 알림 전송</span>
                </div>
                <input
                  type="checkbox"
                  checked={appSettings.notificationsEnabled}
                  onChange={e => updateAppSettings({ notificationsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer shrink-0 rounded"
                />
              </div>

              {/* Video Streaming Quality */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-zinc-400" />
                    재생 화질 설정
                  </span>
                  <span className="text-[11px] text-zinc-400">네트워크 데이터 사용량 조절</span>
                </div>
                <select
                  value={appSettings.streamQuality}
                  onChange={e => updateAppSettings({ streamQuality: e.target.value as 'auto' | 'high' | 'saver' })}
                  className="bg-black/60 border border-white/15 text-white text-xs rounded-full px-3 py-1.5 focus:outline-none"
                >
                  <option value="auto">자동 (맞춤)</option>
                  <option value="high">고화질 (1080p)</option>
                  <option value="saver">데이터 절약</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 프로필 관리 */}
        {settingsActiveTab === 'profile' && (
          <div className="flex-1 space-y-3 pt-1">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-4 shadow-md">
              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">이름</label>
                  <input
                    type="text"
                    value={profileDraft.name || ''}
                    onChange={e => setProfileDraft(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">직무 / 연차</label>
                  <input
                    type="text"
                    value={profileDraft.role || ''}
                    onChange={e => setProfileDraft(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="예: 프론트엔드 개발 / 2년차"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">소속 회사 / 부서</label>
                  <input
                    type="text"
                    value={profileDraft.company || ''}
                    onChange={e => setProfileDraft(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="예: 테크랩스 디지털사업부"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                  >
                    프로필 저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // VIEW 2: Playlist Folder Subpage
  // ==========================================
  if (selectedFolder) {
    const isSaved = selectedFolder === 'saved';
    const folderClips = isSaved ? savedClips : likedClips;

    return (
      <div className="w-full min-h-full bg-[#090a0f] text-zinc-100 flex flex-col p-4 pb-24 no-scrollbar select-none">
        
        {/* Top Back Navigation Bar: Pure Arrow without box or label */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedFolder(null)}
              className="p-1 -ml-1 text-white hover:text-zinc-300 transition-colors cursor-pointer"
              title="뒤로가기"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <div className="flex items-center gap-2">
              {isSaved ? (
                <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
              ) : (
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              )}
              <h1 className="text-base font-bold text-white tracking-tight">
                {isSaved ? '저장한 영상' : '좋아요한 영상'}
              </h1>
              <span className="text-xs text-zinc-400 font-mono">[{folderClips.length}]</span>
            </div>
          </div>
        </div>

        {/* Playlist Action Bar: 전체 재생 */}
        <div className="py-3 flex items-center justify-between border-b border-white/10">
          <span className="text-xs text-zinc-400 font-medium">비공개 재생목록</span>
          <button
            type="button"
            onClick={() => handlePlayAllInFolder(selectedFolder)}
            disabled={folderClips.length === 0}
            className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>전체 재생</span>
          </button>
        </div>

        {/* Clips List */}
        <div className="flex-1 py-3.5 space-y-2.5">
          {folderClips.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs bg-[#0f0f0f] rounded-2xl border border-white/10 p-6">
              {isSaved ? (
                <Bookmark className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
              ) : (
                <Heart className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
              )}
              <p className="font-bold text-zinc-300 text-sm">
                {isSaved ? '저장한 영상이 없습니다.' : '좋아요 표시한 영상이 없습니다.'}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {isSaved 
                  ? '홈 숏폼 시청 중 우측의 [저장] 북마크 버튼을 눌러보세요.'
                  : '마음에 드는 영상 우측의 하트 아이콘을 눌러보세요.'}
              </p>
            </div>
          ) : (
            folderClips.map(clip => (
              <div
                key={clip.id}
                className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-white/20 transition-all shadow-sm"
              >
                <div
                  onClick={() => handlePlayClip(clip.id)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                >
                  <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                    <img
                      src={clip.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-white text-white opacity-90" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-indigo-400 font-bold block">
                      {clip.category} · {clip.episodeIndex}강
                    </span>
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {clip.clipTitle}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {clip.courseTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePlayClip(clip.id)}
                    className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
                  >
                    재생
                  </button>
                  {isSaved ? (
                    <button
                      type="button"
                      onClick={() => toggleSaveClip(clip.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="저장 취소"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleLike(clip.id)}
                      className="p-1.5 text-rose-500 hover:text-zinc-500 transition-colors cursor-pointer"
                      title="좋아요 취소"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 3: Main My Page View
  // ==========================================
  return (
    <div className="w-full min-h-full bg-[#090a0f] text-zinc-100 flex flex-col p-4 pb-24 no-scrollbar select-none">
      
      {/* 1. Page Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">내 페이지</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            시청 기록, 저장 폴더 및 학습 설정을 관리하세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-rose-950/40 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={login}
              className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. User Profile Card (Requirement 4: 설정 버튼만 유지하고 그 밑의 설정 변경 버튼 제거) */}
      <div className="pt-4">
        {isLoggedIn && user ? (
          <div className="p-4 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Large circular avatar with initial letter */}
                <div className="w-13 h-13 rounded-full bg-[#f04b23] text-white flex items-center justify-center text-xl font-extrabold shadow-lg shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white tracking-tight truncate">{user.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                      회원
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5 truncate">{user.role}</p>
                  <p className="text-[11px] text-zinc-400 font-medium truncate">{user.company || user.email}</p>
                </div>
              </div>

              {/* Settings Button on Profile (Requirement 4: Single dedicated Settings button) */}
              <button
                type="button"
                onClick={() => handleOpenSettings('goals')}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 active:scale-95"
                title="설정 (관심사/목표 및 환경설정)"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-300" />
                <span>설정</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#0f0f0f] border border-white/10 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">게스트 이용 중</span>
                <p className="text-xs text-zinc-400">로그인하고 학습 데이터를 안전하게 보관하세요.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={login}
              className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>간편 로그인</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. 최근 시청 영상 (기록) - YouTube History Carousel */}
      <div className="pt-5">
        <div 
          onClick={() => showToast('전체 시청 기록을 불러왔습니다.', 'info')}
          className="flex items-center gap-1 text-sm font-bold text-white hover:text-zinc-300 cursor-pointer mb-3 group"
        >
          <span>최근 시청한 영상 (기록)</span>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {recentHistoryClips.map(clip => (
            <div
              key={clip.id}
              onClick={() => handlePlayClip(clip.id)}
              className="w-28 shrink-0 space-y-1.5 cursor-pointer group/item"
            >
              {/* 9:16 Vertical Shorts Thumbnail Card */}
              <div className="aspect-[9/16] rounded-xl overflow-hidden relative bg-zinc-900 border border-white/10 shadow-sm group-hover/item:border-white/30 transition-all">
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.clipTitle}
                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white">
                  <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                </div>
              </div>

              <h4 className="text-[11px] font-semibold text-white group-hover/item:text-indigo-300 line-clamp-2 leading-tight">
                {clip.clipTitle}
              </h4>
              <p className="text-[10px] text-zinc-400 truncate">
                {clip.instructorName}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 재생목록 / 폴더 형식 (YouTube Playlist Folders) */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ListVideo className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold text-white tracking-tight">재생목록 (보관함 폴더)</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">2개 폴더</span>
        </div>

        {/* YouTube-Style Folder Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Folder 1: 저장한 영상 (Saved Videos Folder) */}
          <div 
            onClick={() => setSelectedFolder('saved')}
            className="group cursor-pointer flex flex-col space-y-2"
          >
            {/* Stacked Folder Effect Thumbnail Container */}
            <div className="relative pt-1.5">
              {/* Top layered pseudo-card effect */}
              <div className="absolute top-0 inset-x-2 h-2 rounded-t-xl bg-white/10 border-t border-x border-white/10" />
              
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-white/30 transition-all shadow-md">
                {savedClips.length > 0 ? (
                  <img
                    src={savedClips[0].thumbnailUrl}
                    alt="저장한 영상"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                    <Bookmark className="w-7 h-7 mb-1 opacity-50" />
                    <span className="text-[10px]">영상 없음</span>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Bottom Right YouTube-Style Badge: Icon + Count */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                  <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{savedClips.length}</span>
                </div>
              </div>
            </div>

            {/* Folder Information */}
            <div className="px-0.5 space-y-0.5">
              <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                저장한 영상
              </h3>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                <FolderLock className="w-3 h-3" />
                <span>비공개 · 동영상 {savedClips.length}개</span>
              </p>
            </div>
          </div>

          {/* Folder 2: 좋아요한 영상 (Liked Videos Folder) */}
          <div 
            onClick={() => setSelectedFolder('liked')}
            className="group cursor-pointer flex flex-col space-y-2"
          >
            {/* Stacked Folder Effect Thumbnail Container */}
            <div className="relative pt-1.5">
              {/* Top layered pseudo-card effect */}
              <div className="absolute top-0 inset-x-2 h-2 rounded-t-xl bg-white/10 border-t border-x border-white/10" />
              
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-white/30 transition-all shadow-md">
                {likedClips.length > 0 ? (
                  <img
                    src={likedClips[0].thumbnailUrl}
                    alt="좋아요한 영상"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                    <Heart className="w-7 h-7 mb-1 opacity-50" />
                    <span className="text-[10px]">영상 없음</span>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Bottom Right YouTube-Style Badge: Icon + Count */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>{likedClips.length}</span>
                </div>
              </div>
            </div>

            {/* Folder Information */}
            <div className="px-0.5 space-y-0.5">
              <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                좋아요 표시한 영상
              </h3>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-medium">
                <FolderLock className="w-3 h-3" />
                <span>비공개 · 동영상 {likedClips.length}개</span>
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
