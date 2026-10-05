export type JobCategory = 
  | '프론트엔드'
  | '백엔드'
  | '기획/PM'
  | '세무/회계(스마트A)'
  | '데이터/AI';

export type DifficultyLevel = '입문' | '초급' | '중급';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  company?: string;
}

export interface TranscriptLine {
  id: string;
  time: string; // e.g. "00:08"
  seconds: number;
  text: string;
  isHighlighted?: boolean;
}

export interface QuizOption {
  id: number;
  text: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number; // 0-based
  explanation: string;
}

export interface MemoItem {
  id: string;
  clipId: string;
  timestamp: string; // e.g. "00:15"
  content: string;
  createdAt: string;
}

export interface VideoClip {
  id: string;
  courseId: string;
  courseTitle: string;
  clipTitle: string;
  episodeIndex: number; // 1
  totalEpisodes: number; // 3
  category: JobCategory;
  difficulty: DifficultyLevel;
  videoUrl: string;
  durationSeconds: number;
  instructorName: string;
  instructorRole: string;
  tags: string[];
  transcripts: TranscriptLine[];
  clipQuiz: QuizItem;
  price: number; // 0 for free, or price in KRW
  views: number;
  likes: number;
  thumbnailUrl: string;
}

export interface Course {
  id: string;
  title: string;
  category: JobCategory;
  difficulty: DifficultyLevel;
  totalDurationMinutes: number;
  dailyGoalSuggestion: string; // "총 15분 · 하루 10분 시청 시 2일 완성"
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  clips: VideoClip[];
  finalQuiz: QuizItem[];
  thumbnailUrl: string;
  description: string;
  price: number; // 0 for free, 15000 etc.
  views: number;
  likes: number;
}

export interface OnboardingData {
  isOnboarded: boolean;
  interests: JobCategory[];
  dailyTargetMinutes: number; // 10, 20, 30
  preferredTimeSlot: string; // 'commute' | 'lunch' | 'night'
}

export interface AppSettings {
  autoPlay: boolean;
  startMuted: boolean;
  notificationsEnabled: boolean;
  streamQuality: 'auto' | 'high' | 'saver';
}

export interface CourseProgressInfo {
  courseId: string;
  completedClipIds: string[];
  streakDays: number;
  lastStudiedAt: string;
  isQuizPassed?: boolean;
  finalScore?: number;
}

export interface AdminStats {
  totalViews: number;
  avgCompletionRate: number;
  quizAccuracyRate: number;
  estimatedRevenue: number;
}

export type AppPage = 'home' | 'explore' | 'courses' | 'mypage';
