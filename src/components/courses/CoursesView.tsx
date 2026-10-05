import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import { CoursePlayerView } from './CoursePlayerView';
import { 
  Play, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Award, 
  Flame, 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Trash2, 
  Sparkles,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';

export const CoursesView: React.FC = () => {
  const {
    courses,
    enrolledCourseIds,
    unenrollCourse,
    courseProgress,
    selectedCourseDetailId,
    setSelectedCourseDetailId,
    activeCoursePlayer,
    startCoursePlayback,
    exitCoursePlayback,
    openFinalQuiz,
    memos,
    addMemo,
    deleteMemo,
    setActivePage,
  } = useApp();

  const [newMemoText, setNewMemoText] = useState('');
  const [selectedMemoClipId, setSelectedMemoClipId] = useState<string>('');

  // 1. If currently in Course Player mode, render dedicated player
  if (activeCoursePlayer) {
    return (
      <CoursePlayerView
        courseId={activeCoursePlayer.courseId}
        initialClipIndex={activeCoursePlayer.activeClipIndex}
        onExit={exitCoursePlayback}
      />
    );
  }

  // 2. If a specific course is selected, render Course Detail view
  if (selectedCourseDetailId) {
    const course = courses.find(c => c.id === selectedCourseDetailId);

    if (!course) {
      return (
        <div className="p-6 text-center text-zinc-400">
          <p className="text-sm">강좌를 찾을 수 없습니다.</p>
          <button
            type="button"
            onClick={() => setSelectedCourseDetailId(null)}
            className="mt-3 px-4 py-2 bg-zinc-800 text-xs text-white rounded-lg"
          >
            목록으로 돌아가기
          </button>
        </div>
      );
    }

    const progress = courseProgress[course.id] || {
      courseId: course.id,
      completedClipIds: [],
      streakDays: 1,
      lastStudiedAt: '',
    };

    const completedCount = progress.completedClipIds.length;
    const totalCount = course.clips.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isCompletedAllClips = completedCount === totalCount && totalCount > 0;

    // Course Memos (memos created on any clip belonging to this course)
    const courseClipIds = new Set(course.clips.map(c => c.id));
    const courseMemos = memos.filter(m => courseClipIds.has(m.clipId));

    // First unwatched clip index
    const firstUnwatchedIndex = course.clips.findIndex(
      clip => !progress.completedClipIds.includes(clip.id)
    );
    const playbackIndex = firstUnwatchedIndex !== -1 ? firstUnwatchedIndex : 0;

    const handleAddCourseMemo = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMemoText.trim()) return;
      const targetClipId = selectedMemoClipId || course.clips[0]?.id;
      if (targetClipId) {
        addMemo(targetClipId, '강좌 노트', newMemoText.trim());
        setNewMemoText('');
      }
    };

    return (
      <div className="w-full min-h-full bg-zinc-950 text-zinc-100 flex flex-col p-4 pb-20 no-scrollbar">
        
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setSelectedCourseDetailId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>내 강의실 목록</span>
          </button>
          <span className="text-[11px] text-zinc-500 font-mono">
            {course.category}
          </span>
        </div>

        {/* Course Header & Cover */}
        <div className="pt-3 space-y-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-zinc-900/90 backdrop-blur-sm text-white text-[10px] font-medium border border-zinc-700">
                {course.category}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-900/90 backdrop-blur-sm text-zinc-300 text-[10px] font-medium border border-zinc-700">
                {course.difficulty}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h1 className="text-sm font-bold line-clamp-1">
                {course.title}
              </h1>
              <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
                {course.description}
              </p>
            </div>
          </div>

          {/* Instructor & Goal Details */}
          <div className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-8 h-8 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  {course.instructor.name}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {course.instructor.role}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block">학습 권장</span>
              <span className="text-[11px] font-medium text-indigo-300">
                {course.dailyGoalSuggestion}
              </span>
            </div>
          </div>

          {/* Progress & Streak Card */}
          <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">학습 현황</span>
                <span className="text-[11px] text-zinc-400">
                  ({completedCount}/{totalCount}강 완료)
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{progress.streakDays}일 연속 학습</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>진도율</span>
                <span className="font-bold text-indigo-400">{progressPercent}%</span>
              </div>
            </div>

            {/* Final Quiz Status Banner */}
            {progress.isQuizPassed ? (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">
                    최종 평가 통과 ({progress.finalScore}점)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openFinalQuiz(course)}
                  className="text-[11px] text-emerald-400 underline font-medium"
                >
                  재응시
                </button>
              </div>
            ) : isCompletedAllClips ? (
              <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-300">
                    모든 클립 시청 완료! 최종 퀴즈에 도전하세요.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openFinalQuiz(course)}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold"
                >
                  퀴즈 풀기
                </button>
              </div>
            ) : null}

            {/* Primary Action Button: [시청하기] */}
            <button
              type="button"
              onClick={() => startCoursePlayback(course.id, playbackIndex)}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {progressPercent === 0 
                  ? '시청하기 (1강부터 시작)' 
                  : progressPercent === 100 
                  ? '처음부터 다시 시청하기' 
                  : `${playbackIndex + 1}강 이어서 시청하기`}
              </span>
            </button>
          </div>

          {/* Curriculum Clip List */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>커리큘럼</span>
              </h2>
              <span className="text-[10px] text-zinc-500">
                선택 시 해당 강좌 영상만 재생됩니다
              </span>
            </div>

            <div className="space-y-2">
              {course.clips.map((clip, index) => {
                const isClipCompleted = progress.completedClipIds.includes(clip.id);

                return (
                  <div
                    key={clip.id}
                    onClick={() => startCoursePlayback(course.id, index)}
                    className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      {isClipCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-600 shrink-0 group-hover:text-indigo-400 transition-colors" />
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-semibold text-indigo-400">
                            {clip.episodeIndex}강
                          </span>
                          <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                            {clip.clipTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {clip.durationSeconds}초 숏폼
                          </span>
                          {clip.clipQuiz && (
                            <span className="text-zinc-400 font-medium">· 퀴즈 포함</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 font-medium">
                        재생
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course Memos Section */}
          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <h2 className="text-xs font-bold text-white">이 강좌의 메모</h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {courseMemos.length}
                </span>
              </div>
            </div>

            {/* Add Quick Memo Box */}
            <form onSubmit={handleAddCourseMemo} className="space-y-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <select
                  value={selectedMemoClipId || course.clips[0]?.id || ''}
                  onChange={e => setSelectedMemoClipId(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                >
                  {course.clips.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.episodeIndex}강: {c.clipTitle.slice(0, 14)}...
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-zinc-500">에 메모 추가</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemoText}
                  onChange={e => setNewMemoText(e.target.value)}
                  placeholder="학습 중 기억할 핵심 포인트를 기록하세요..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />
                <button
                  type="submit"
                  disabled={!newMemoText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>등록</span>
                </button>
              </div>
            </form>

            {/* Memos List */}
            {courseMemos.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs bg-zinc-900/30 rounded-xl border border-zinc-800/60">
                <FileText className="w-6 h-6 mx-auto mb-1.5 text-zinc-600" />
                <p>아직 작성된 강좌 메모가 없습니다.</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  영상을 시청하며 대본/메모 탭이나 위 입력창에서 중요한 내용을 기록해보세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {courseMemos.map(memo => {
                  const clip = course.clips.find(c => c.id === memo.clipId);
                  const clipIdx = course.clips.findIndex(c => c.id === memo.clipId);

                  return (
                    <div
                      key={memo.id}
                      className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (clipIdx !== -1) {
                              startCoursePlayback(course.id, clipIdx);
                            }
                          }}
                          className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>
                            {clip ? `${clip.episodeIndex}강` : '강좌'} · {memo.timestamp}
                          </span>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500">{memo.createdAt}</span>
                          <button
                            type="button"
                            onClick={() => deleteMemo(memo.id)}
                            className="text-zinc-500 hover:text-rose-400 p-0.5 transition-colors"
                            title="메모 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
                        {memo.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Course Final Quiz Section */}
          <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2.5 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">강좌 최종 종합 퀴즈</span>
              </div>
              <span className="text-[10px] text-zinc-400">총 3문항 (60점 이상 수료)</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              모든 강좌 영상이 끝나면 최종 퀴즈를 풀어 학습 내용을 점검하고 수료증을 획득할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => openFinalQuiz(course)}
              className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>최종 퀴즈 풀기</span>
            </button>
          </div>

          {/* Unenroll option */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                unenrollCourse(course.id);
                setSelectedCourseDetailId(null);
              }}
              className="text-[11px] text-zinc-500 hover:text-rose-400 underline transition-colors"
            >
              내 강의실에서 강좌 삭제
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Default: Enrolled Courses List (내 강의실)
  const enrolledCourses = courses.filter(c => enrolledCourseIds.has(c.id));

  return (
    <div className="w-full min-h-full bg-zinc-950 text-zinc-100 flex flex-col p-4 pb-20 no-scrollbar">
      
      {/* Page Header */}
      <div className="pb-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">내 강의실</h1>
            <p className="text-[11px] text-zinc-400">
              현재 수강 중인 강좌의 진도와 연속 학습일을 확인하세요.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
            {enrolledCourses.length}개 수강 중
          </span>
        </div>
      </div>

      {/* Enrolled Courses List */}
      <div className="pt-4">
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-300">
                현재 수강 중인 강좌가 없습니다.
              </p>
              <p className="text-[11px] text-zinc-500">
                '탐색' 화면에서 실무에 필요한 숏폼 강좌를 찾아 담아보세요!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('explore')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
            >
              강좌 탐색하러 가기
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {enrolledCourses.map(course => {
              const progress = courseProgress[course.id] || {
                courseId: course.id,
                completedClipIds: [],
                streakDays: 1,
                lastStudiedAt: '',
              };

              const completedCount = progress.completedClipIds.length;
              const totalCount = course.clips.length;
              const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={course.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  {/* Card Thumbnail Header */}
                  <div
                    onClick={() => setSelectedCourseDetailId(course.id)}
                    className="relative aspect-[21/9] w-full overflow-hidden bg-black cursor-pointer group"
                  >
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-zinc-900/80 backdrop-blur-sm text-white text-[10px] font-medium">
                        {course.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900/80 backdrop-blur-sm text-zinc-300 text-[10px] font-medium">
                        {course.difficulty}
                      </span>
                    </div>

                    {/* Streak badge */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{progress.streakDays}일 연속</span>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs font-bold truncate">
                      <span className="truncate pr-2">{course.title}</span>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                        {course.clips.length}개 클립
                      </span>
                    </div>
                  </div>

                  {/* Course Body & Progress */}
                  <div className="p-3.5 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">학습 진도율</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-400">
                            {completedCount}/{totalCount}강
                          </span>
                          <span className="font-bold text-indigo-400">
                            {progressPercent}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Bar */}
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => setSelectedCourseDetailId(course.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-colors text-center"
                      >
                        상세 및 메모
                      </button>
                      <button
                        type="button"
                        onClick={() => startCoursePlayback(course.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>시청하기</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
