import React, { createContext, useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react';
import type { 
  Course, 
  VideoClip, 
  OnboardingData, 
  MemoItem, 
  AppPage, 
  QuizItem,
  User,
  AppSettings,
  CourseProgressInfo
} from '../types';
import { 
  INITIAL_COURSES, 
  INITIAL_ONBOARDING 
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

export interface AppContextType {
  // User Authentication & Profile
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  isLoginModalOpen: boolean;
  loginModalMessage: string;
  openLoginModal: (message?: string) => void;
  closeLoginModal: () => void;

  // Navigation
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
  selectedCourseDetailId: string | null;
  setSelectedCourseDetailId: (id: string | null) => void;

  // Course Dedicated Player Mode
  activeCoursePlayer: { courseId: string; activeClipIndex: number } | null;
  startCoursePlayback: (courseId: string, clipIndex?: number) => void;
  exitCoursePlayback: () => void;

  // Enrolled Courses (내 강의실)
  enrolledCourseIds: Set<string>;
  enrollCourse: (courseId: string) => void;
  unenrollCourse: (courseId: string) => void;

  // Course Study Progress & Streaks
  courseProgress: Record<string, CourseProgressInfo>;
  completeClipInCourse: (courseId: string, clipId: string) => void;
  markCourseQuizComplete: (courseId: string, score: number) => void;

  // Saved Clips (내가 따로 저장한 영상) & Liked Clips
  savedClipIds: Set<string>;
  toggleSaveClip: (clipId: string) => void;
  likedClipIds: Set<string>;
  toggleLike: (clipId: string) => void;

  // Courses & Clips Data
  courses: Course[];
  allClips: VideoClip[];
  activeFeedClipId: string;
  setActiveFeedClipId: (clipId: string) => void;
  currentClip: VideoClip;
  goToClip: (clipId: string, timestampSeconds?: number) => void;
  targetSeekTime: number | null;
  clearTargetSeekTime: () => void;
  viewCounts: Record<string, number>;
  recordView: (clipId: string) => void;

  // Transcript & Memos
  highlightedTranscriptIds: Set<string>;
  toggleHighlight: (transcriptId: string) => void;
  memos: MemoItem[];
  addMemo: (clipId: string, timestamp: string, content: string) => void;
  deleteMemo: (memoId: string) => void;

  // Quizzes
  activeClipQuiz: { clip: VideoClip; quiz: QuizItem } | null;
  openClipQuiz: (clip: VideoClip, quiz: QuizItem) => void;
  closeClipQuiz: () => void;
  activeFinalCourse: Course | null;
  openFinalQuiz: (course: Course) => void;
  closeFinalQuiz: () => void;

  // Onboarding & Settings
  onboarding: OnboardingData;
  updateOnboarding: (data: Partial<OnboardingData>) => void;
  appSettings: AppSettings;
  updateAppSettings: (data: Partial<AppSettings>) => void;

  // UI Modes & Toasts
  distractionFree: boolean;
  setDistractionFree: React.Dispatch<React.SetStateAction<boolean>>;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER: 'beugo_user_v3',
  ENROLLED: 'beugo_enrolled_courses_v3',
  COURSE_PROGRESS: 'beugo_course_progress_v3',
  SAVED_CLIPS: 'beugo_saved_clips_v3',
  LIKES: 'beugo_likes_v3',
  VIEWS: 'beugo_views_v3',
  MEMOS: 'beugo_memos_v3',
  HIGHLIGHTS: 'beugo_highlights_v3',
  ONBOARDING: 'beugo_onboarding_v3',
  SETTINGS: 'beugo_settings_v3',
};

const DEFAULT_SETTINGS: AppSettings = {
  autoPlay: true,
  startMuted: true,
  notificationsEnabled: true,
  streamQuality: 'auto',
};

const DEFAULT_PROGRESS: Record<string, CourseProgressInfo> = {
  'course-fe-1': {
    courseId: 'course-fe-1',
    completedClipIds: ['clip-fe-1-1'],
    streakDays: 3,
    lastStudiedAt: '2026-10-05',
  },
  'course-tax-1': {
    courseId: 'course-tax-1',
    completedClipIds: ['clip-tax-1-1', 'clip-tax-1-2'],
    streakDays: 5,
    lastStudiedAt: '2026-10-04',
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Toast Notifications System (defined first so all actions can call showToast)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastSeqRef = useRef(0);
  const lastToastRef = useRef<{ message: string; timestamp: number } | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const now = Date.now();
    if (lastToastRef.current && lastToastRef.current.message === message && now - lastToastRef.current.timestamp < 600) {
      return;
    }
    lastToastRef.current = { message, timestamp: now };

    toastSeqRef.current += 1;
    const id = `toast-${toastSeqRef.current}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  // 1. User & Auth State
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : {
        id: 'user-default',
        name: '김직장',
        email: 'worker.kim@company.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: '프로덕트 기획 / 3년차',
        company: '테크랩스 디지털사업부',
      };
    } catch {
      return null;
    }
  });

  const isLoggedIn = user !== null;

  const login = () => {
    const defaultUser: User = {
      id: 'user-default',
      name: '김직장',
      email: 'worker.kim@company.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      role: '프로덕트 기획 / 3년차',
      company: '테크랩스 디지털사업부',
    };
    setUser(defaultUser);
    showToast('김직장 님으로 로그인되었습니다.', 'success');
  };

  const logout = () => {
    setUser(null);
    showToast('로그아웃되었습니다.', 'info');
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...data };
    });
    showToast('프로필 정보가 수정되었습니다.', 'success');
  };

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState('로그인하고 실무 숏폼 학습을 시작하세요.');

  const openLoginModal = (message?: string) => {
    if (message) setLoginModalMessage(message);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  // 2. Navigation State
  const [activePage, setActivePage] = useState<AppPage>('home');
  const [selectedCourseDetailId, setSelectedCourseDetailId] = useState<string | null>(null);
  const [activeCoursePlayer, setActiveCoursePlayer] = useState<{ courseId: string; activeClipIndex: number } | null>(null);

  // 3. Enrolled Courses (내 강의실)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENROLLED);
      return saved ? new Set(JSON.parse(saved)) : new Set(['course-fe-1', 'course-tax-1']);
    } catch {
      return new Set(['course-fe-1', 'course-tax-1']);
    }
  });

  const enrollCourse = (courseId: string) => {
    setEnrolledCourseIds(prev => {
      const next = new Set(prev);
      next.add(courseId);
      return next;
    });
    // Initialize progress if needed
    setCourseProgress(prev => {
      if (prev[courseId]) return prev;
      return {
        ...prev,
        [courseId]: {
          courseId,
          completedClipIds: [],
          streakDays: 1,
          lastStudiedAt: new Date().toISOString().split('T')[0],
        }
      };
    });
    showToast('내 강의실에 강좌가 추가되었습니다!', 'success');
  };

  const unenrollCourse = (courseId: string) => {
    setEnrolledCourseIds(prev => {
      const next = new Set(prev);
      next.delete(courseId);
      return next;
    });
    showToast('강의실에서 강좌가 삭제되었습니다.', 'info');
  };

  // 4. Course Progress & Streak
  const [courseProgress, setCourseProgress] = useState<Record<string, CourseProgressInfo>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COURSE_PROGRESS);
      return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
    } catch {
      return DEFAULT_PROGRESS;
    }
  });

  const completeClipInCourse = (courseId: string, clipId: string) => {
    setCourseProgress(prev => {
      const current = prev[courseId] || {
        courseId,
        completedClipIds: [],
        streakDays: 1,
        lastStudiedAt: new Date().toISOString().split('T')[0],
      };
      if (current.completedClipIds.includes(clipId)) return prev;

      return {
        ...prev,
        [courseId]: {
          ...current,
          completedClipIds: [...current.completedClipIds, clipId],
          lastStudiedAt: new Date().toISOString().split('T')[0],
        }
      };
    });
  };

  const markCourseQuizComplete = (courseId: string, score: number) => {
    setCourseProgress(prev => {
      const current = prev[courseId] || {
        courseId,
        completedClipIds: [],
        streakDays: 1,
        lastStudiedAt: new Date().toISOString().split('T')[0],
      };
      return {
        ...prev,
        [courseId]: {
          ...current,
          isQuizPassed: score >= 60,
          finalScore: score,
        }
      };
    });
  };

  // 5. Course-Dedicated Player Mode
  const startCoursePlayback = (courseId: string, clipIndex: number = 0) => {
    setActiveCoursePlayer({ courseId, activeClipIndex: clipIndex });
  };

  const exitCoursePlayback = () => {
    setActiveCoursePlayer(null);
  };

  // 6. Saved Clips (내가 따로 저장한 영상)
  const [savedClipIds, setSavedClipIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CLIPS);
      return saved ? new Set(JSON.parse(saved)) : new Set(['clip-fe-1-1', 'clip-pm-1-1']);
    } catch {
      return new Set(['clip-fe-1-1']);
    }
  });

  const toggleSaveClip = (clipId: string) => {
    const isCurrentlySaved = savedClipIds.has(clipId);
    setSavedClipIds(prev => {
      const next = new Set(prev);
      if (next.has(clipId)) {
        next.delete(clipId);
      } else {
        next.add(clipId);
      }
      return next;
    });

    if (isCurrentlySaved) {
      showToast('저장한 영상에서 제외되었습니다.', 'info');
    } else {
      showToast('내 페이지 > 저장한 영상에 보관되었습니다.', 'success');
    }
  };

  // 7. Likes & Views
  const [likedClipIds, setLikedClipIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKES);
      return saved ? new Set(JSON.parse(saved)) : new Set(['clip-fe-1-1', 'clip-tax-1-1']);
    } catch {
      return new Set(['clip-fe-1-1']);
    }
  });

  const toggleLike = (clipId: string) => {
    setLikedClipIds(prev => {
      const next = new Set(prev);
      if (next.has(clipId)) {
        next.delete(clipId);
      } else {
        next.add(clipId);
      }
      return next;
    });
  };

  const [courses] = useState<Course[]>(INITIAL_COURSES);

  const allClips = useMemo(() => {
    return courses.flatMap(c => c.clips);
  }, [courses]);

  const [activeFeedClipId, setActiveFeedClipId] = useState<string>(allClips[0]?.id || 'clip-fe-1-1');
  const [targetSeekTime, setTargetSeekTime] = useState<number | null>(null);

  const clearTargetSeekTime = () => setTargetSeekTime(null);

  const goToClip = (clipId: string, timestampSeconds?: number) => {
    setActiveFeedClipId(clipId);
    if (timestampSeconds !== undefined) {
      setTargetSeekTime(timestampSeconds);
    }
    setActivePage('home');
  };

  const currentClip = useMemo(() => {
    return allClips.find(c => c.id === activeFeedClipId) || allClips[0];
  }, [allClips, activeFeedClipId]);

  const [viewCounts, setViewCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEWS);
      if (saved) return JSON.parse(saved);
      const initial: Record<string, number> = {};
      INITIAL_COURSES.forEach(c => c.clips.forEach(clip => {
        initial[clip.id] = clip.views;
      }));
      return initial;
    } catch {
      return {};
    }
  });

  const recordView = (clipId: string) => {
    setViewCounts(prev => ({
      ...prev,
      [clipId]: (prev[clipId] || 0) + 1,
    }));
  };

  // 8. Transcript & Memos
  const [highlightedTranscriptIds, setHighlightedTranscriptIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
      return saved ? new Set(JSON.parse(saved)) : new Set(['tr-fe-1-3', 'tr-pm-1-3']);
    } catch {
      return new Set();
    }
  });

  const toggleHighlight = (transcriptId: string) => {
    setHighlightedTranscriptIds(prev => {
      const next = new Set(prev);
      if (next.has(transcriptId)) {
        next.delete(transcriptId);
      } else {
        next.add(transcriptId);
      }
      return next;
    });
  };

  const [memos, setMemos] = useState<MemoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMOS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'memo-1',
          clipId: 'clip-fe-1-1',
          timestamp: '00:08',
          content: 'useActionState는 폼 제출 시 pending 상태 처리가 정말 깔끔함! 다음 사내 프로젝트에 적극 도입 검토.',
          createdAt: '2026-10-05 14:20',
        },
        {
          id: 'memo-2',
          clipId: 'clip-pm-1-1',
          timestamp: '00:09',
          content: 'INVEST 원칙: 스프린트 스토리는 무조건 Small하게 쪼개기!',
          createdAt: '2026-10-04 18:30',
        }
      ];
    } catch {
      return [];
    }
  });

  const addMemo = (clipId: string, timestamp: string, content: string) => {
    const newMemo: MemoItem = {
      id: `memo-${Date.now()}-${clipId}`,
      clipId,
      timestamp,
      content,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setMemos(prev => [newMemo, ...prev]);
    showToast('메모가 저장되었습니다.', 'success');
  };

  const deleteMemo = (memoId: string) => {
    setMemos(prev => prev.filter(m => m.id !== memoId));
    showToast('메모가 삭제되었습니다.', 'info');
  };

  // 9. Quizzes
  const [activeClipQuiz, setActiveClipQuiz] = useState<{ clip: VideoClip; quiz: QuizItem } | null>(null);
  const openClipQuiz = (clip: VideoClip, quiz: QuizItem) => setActiveClipQuiz({ clip, quiz });
  const closeClipQuiz = () => setActiveClipQuiz(null);

  const [activeFinalCourse, setActiveFinalCourse] = useState<Course | null>(null);
  const openFinalQuiz = (course: Course) => setActiveFinalCourse(course);
  const closeFinalQuiz = () => setActiveFinalCourse(null);

  // 10. Onboarding & Settings
  const [onboarding, setOnboarding] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
      return saved ? JSON.parse(saved) : INITIAL_ONBOARDING;
    } catch {
      return INITIAL_ONBOARDING;
    }
  });

  const updateOnboarding = (data: Partial<OnboardingData>) => {
    setOnboarding(prev => ({ ...prev, ...data }));
    showToast('학습 설정이 변경되었습니다.', 'success');
  };

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateAppSettings = (data: Partial<AppSettings>) => {
    setAppSettings(prev => ({ ...prev, ...data }));
    showToast('환경설정이 저장되었습니다.', 'success');
  };

  // 11. UI Modes
  const [distractionFree, setDistractionFree] = useState<boolean>(false);

  // 12. LocalStorage Syncing
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENROLLED, JSON.stringify(Array.from(enrolledCourseIds)));
  }, [enrolledCourseIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSE_PROGRESS, JSON.stringify(courseProgress));
  }, [courseProgress]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SAVED_CLIPS, JSON.stringify(Array.from(savedClipIds)));
  }, [savedClipIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(Array.from(likedClipIds)));
  }, [likedClipIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEWS, JSON.stringify(viewCounts));
  }, [viewCounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(Array.from(highlightedTranscriptIds)));
  }, [highlightedTranscriptIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
  }, [memos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(onboarding));
  }, [onboarding]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(appSettings));
  }, [appSettings]);

  const value = {
    user,
    isLoggedIn,
    login,
    logout,
    updateUserProfile,
    isLoginModalOpen,
    loginModalMessage,
    openLoginModal,
    closeLoginModal,
    activePage,
    setActivePage,
    selectedCourseDetailId,
    setSelectedCourseDetailId,
    activeCoursePlayer,
    startCoursePlayback,
    exitCoursePlayback,
    enrolledCourseIds,
    enrollCourse,
    unenrollCourse,
    courseProgress,
    completeClipInCourse,
    markCourseQuizComplete,
    savedClipIds,
    toggleSaveClip,
    likedClipIds,
    toggleLike,
    courses,
    allClips,
    activeFeedClipId,
    setActiveFeedClipId,
    currentClip,
    goToClip,
    targetSeekTime,
    clearTargetSeekTime,
    viewCounts,
    recordView,
    highlightedTranscriptIds,
    toggleHighlight,
    memos,
    addMemo,
    deleteMemo,
    activeClipQuiz,
    openClipQuiz,
    closeClipQuiz,
    activeFinalCourse,
    openFinalQuiz,
    closeFinalQuiz,
    onboarding,
    updateOnboarding,
    appSettings,
    updateAppSettings,
    distractionFree,
    setDistractionFree,
    toasts,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext };
