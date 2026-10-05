import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import type { JobCategory, User } from '../../types';
import { 
  Bookmark, 
  Heart, 
  Settings, 
  Sliders, 
  User as UserIcon, 
  Play, 
  Trash2, 
  LogOut, 
  LogIn, 
  Clock, 
  Sun, 
  Briefcase, 
  Moon, 
  Check, 
  X, 
  Edit3, 
  VolumeX, 
  Bell, 
  Film,
  Compass,
  CheckCircle2
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
  } = useApp();

  // Active collection sub-tab: 'saved' | 'liked'
  const [activeCollectionTab, setActiveCollectionTab] = useState<'saved' | 'liked'>('saved');

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

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

  // Handlers
  const handleOpenEditProfile = () => {
    setProfileDraft({
      name: user?.name || '',
      role: user?.role || '',
      company: user?.company || '',
      avatar: user?.avatar || '',
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileDraft);
    setIsEditProfileOpen(false);
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
    setIsGoalModalOpen(false);
  };

  return (
    <div className="w-full min-h-full bg-zinc-950 text-zinc-100 flex flex-col p-4 pb-20 no-scrollbar">
      
      {/* 1. Page Title */}
      <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white">내 페이지</h1>
          <p className="text-[11px] text-zinc-400">
            저장 영상, 프로필 및 서비스 환경을 관리하세요.
          </p>
        </div>
      </div>

      {/* 2. User Profile Card */}
      <div className="pt-3">
        {isLoggedIn && user ? (
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-700 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{user.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                      회원
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5">{user.role}</p>
                  <p className="text-[10px] text-zinc-500">{user.company || user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                title="프로필 수정"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>계정 동기화 중</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">게스트 이용 중</span>
                <p className="text-[11px] text-zinc-400">로그인하고 학습 데이터를 안전하게 보관하세요.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={login}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Saved Clips & Liked Clips Collection */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full">
            <button
              type="button"
              onClick={() => setActiveCollectionTab('saved')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeCollectionTab === 'saved'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>저장한 영상 ({savedClips.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCollectionTab('liked')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeCollectionTab === 'liked'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>좋아요한 영상 ({likedClips.length})</span>
            </button>
          </div>
        </div>

        {/* Saved Clips List */}
        {activeCollectionTab === 'saved' && (
          <div className="space-y-2.5">
            {savedClips.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-4">
                <Bookmark className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="font-semibold text-zinc-300">저장한 영상이 없습니다.</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  숏폼 시청 중 우측의 [저장] 북마크 버튼을 눌러 모아보세요.
                </p>
              </div>
            ) : (
              savedClips.map(clip => (
                <div
                  key={clip.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div
                    onClick={() => goToClip(clip.id)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black shrink-0">
                      <img
                        src={clip.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-3 h-3 fill-white text-white opacity-80" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-indigo-400 font-mono font-medium block">
                        {clip.category} · {clip.episodeIndex}강
                      </span>
                      <h4 className="text-xs font-semibold text-zinc-200 truncate">
                        {clip.clipTitle}
                      </h4>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {clip.courseTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => goToClip(clip.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-medium transition-colors"
                    >
                      재생
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSaveClip(clip.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="저장 취소"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Liked Clips List */}
        {activeCollectionTab === 'liked' && (
          <div className="space-y-2.5">
            {likedClips.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-2xl border border-zinc-800/80 p-4">
                <Heart className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="font-semibold text-zinc-300">좋아요 표시한 영상이 없습니다.</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  마음에 드는 영상 우측의 하트 아이콘을 눌러보세요.
                </p>
              </div>
            ) : (
              likedClips.map(clip => (
                <div
                  key={clip.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div
                    onClick={() => goToClip(clip.id)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black shrink-0">
                      <img
                        src={clip.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-3 h-3 fill-white text-white opacity-80" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-indigo-400 font-mono font-medium block">
                        {clip.category} · {clip.episodeIndex}강
                      </span>
                      <h4 className="text-xs font-semibold text-zinc-200 truncate">
                        {clip.clipTitle}
                      </h4>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {clip.courseTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => goToClip(clip.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-medium transition-colors"
                    >
                      재생
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleLike(clip.id)}
                      className="p-1.5 text-rose-500 hover:text-zinc-500 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="좋아요 취소"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 4. Interests & Goal Settings Card */}
      <div className="pt-4">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold text-white">학습 관심사 및 일일 목표</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              재설정
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">관심 직무</span>
              <span className="font-semibold text-zinc-200">
                {onboarding.interests.join(', ') || '전체'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">일일 목표 학습량</span>
              <span className="font-semibold text-indigo-300">
                하루 {onboarding.dailyTargetMinutes}분 (숏폼 약 {Math.round(onboarding.dailyTargetMinutes / 3)}편)
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-zinc-400">선호 시간대</span>
              <span className="font-semibold text-zinc-200">
                {onboarding.preferredTimeSlot === 'commute' ? '출퇴근길' : onboarding.preferredTimeSlot === 'lunch' ? '점심시간' : '취침 전'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Service Preferences / 자잘한 설정들 */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-zinc-400" />
          <h2 className="text-xs font-bold text-white">서비스 환경설정</h2>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3.5">
          {/* Autoplay toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-zinc-200 block">자동 다음 영상 재생</span>
              <span className="text-[10px] text-zinc-500">영상 시청 완료 시 다음 숏폼으로 연속 전환</span>
            </div>
            <input
              type="checkbox"
              checked={appSettings.autoPlay}
              onChange={e => updateAppSettings({ autoPlay: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Start Muted toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                시작 시 기본 음소거
              </span>
              <span className="text-[10px] text-zinc-500">공공장소나 출퇴근길 소음 방지를 위해 기본 음소거</span>
            </div>
            <input
              type="checkbox"
              checked={appSettings.startMuted}
              onChange={e => updateAppSettings({ startMuted: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Notifications toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-zinc-400" />
                학습 리마인드 알림 받기
              </span>
              <span className="text-[10px] text-zinc-500">선호 시간대에 숏폼 학습 리마인더 전송</span>
            </div>
            <input
              type="checkbox"
              checked={appSettings.notificationsEnabled}
              onChange={e => updateAppSettings({ notificationsEnabled: e.target.checked })}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Video Streaming Quality */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-zinc-400" />
                재생 화질 설정
              </span>
              <span className="text-[10px] text-zinc-500">네트워크 데이터 사용량 조절</span>
            </div>
            <select
              value={appSettings.streamQuality}
              onChange={e => updateAppSettings({ streamQuality: e.target.value as 'auto' | 'high' | 'saver' })}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="auto">자동 (네트워크 맞춤)</option>
              <option value="high">고화질 (1080p 권장)</option>
              <option value="saver">데이터 절약 (480p)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[380px] bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-xs font-bold text-white">프로필 수정</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 pt-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">이름</label>
                <input
                  type="text"
                  value={profileDraft.name || ''}
                  onChange={e => setProfileDraft(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
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
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">소속 회사 / 부서</label>
                <input
                  type="text"
                  value={profileDraft.company || ''}
                  onChange={e => setProfileDraft(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="예: 네이버웹툰 서비스개발팀"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">프로필 이미지 URL</label>
                <input
                  type="url"
                  value={profileDraft.avatar || ''}
                  onChange={e => setProfileDraft(prev => ({ ...prev, avatar: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-400"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Interest & Goals Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white">관심사 및 일일 목표 재설정</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interest categories */}
            <div className="my-4 space-y-2">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                관심 직무 분야 (다중 선택)
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {CATEGORIES.map(cat => {
                  const isSelected = selectedInterests.includes(cat.label);
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => toggleInterest(cat.label)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-600 text-white'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cat.icon}</span>
                        <div>
                          <span className="text-xs font-medium block">{cat.label}</span>
                          <span className="text-[10px] text-zinc-500">{cat.desc}</span>
                        </div>
                      </div>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Minutes */}
            <div className="my-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  하루 목표 시간
                </span>
                <span className="font-bold text-indigo-400">
                  {draftTargetMinutes}분
                </span>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-2">
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="10"
                  value={draftTargetMinutes}
                  onChange={e => setDraftTargetMinutes(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 px-0.5">
                  <span className={draftTargetMinutes === 10 ? 'text-zinc-200 font-medium' : ''}>10분 (가볍게 3편)</span>
                  <span className={draftTargetMinutes === 20 ? 'text-zinc-200 font-medium' : ''}>20분 (집중형 6편)</span>
                  <span className={draftTargetMinutes === 30 ? 'text-zinc-200 font-medium' : ''}>30분 (스파르타 10편)</span>
                </div>
              </div>
            </div>

            {/* Preferred Time Slot */}
            <div className="my-4 space-y-2">
              <span className="text-xs font-medium text-zinc-300 block">
                선호 학습 시간대
              </span>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => {
                  const isSelected = draftTimeSlot === slot.id;
                  const Icon = slot.icon;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setDraftTimeSlot(slot.id)}
                      className={`py-2 px-1 rounded-xl border text-center text-xs flex flex-col items-center gap-1 transition-colors ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-600 text-white font-medium'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{slot.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveGoals}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
