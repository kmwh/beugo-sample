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
        <div className="p-8 text-center text-zinc-300">
          <p className="text-xs font-semibold">강좌 정보를 찾을 수 없습니다.</p>
          <button
            type="button"
            onClick={() => setSelectedCourseDetailId(null)}
            className="mt-4 px-4 py-2 bg-white text-black text-xs rounded-full font-bold hover:bg-zinc-200 transition-all cursor-pointer"
          >
            강의실 목록으로 돌아가기
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
      <div className="w-full min-h-full bg-[#090a0f] text-zinc-100 flex flex-col p-4 pb-24 no-scrollbar select-none">
        
        {/* Top Back Navigation Bar: Pure Arrow without box or label */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCourseDetailId(null)}
              className="p-1 -ml-1 text-white hover:text-zinc-300 transition-colors cursor-pointer"
              title="뒤로가기"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h1 className="text-base font-bold text-white tracking-tight">강좌 상세</h1>
          </div>
          <span className="text-[11px] font-semibold text-indigo-300 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
            {course.category}
          </span>
        </div>

        {/* Course Header & Cover */}
        <div className="pt-3.5 space-y-3.5">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-md">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
            
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
                {course.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-zinc-200 text-[10px] font-medium border border-white/15">
                {course.difficulty}
              </span>
            </div>

            <div className="absolute bottom-3 left-3.5 right-3.5 text-white space-y-0.5">
              <h1 className="text-base font-bold line-clamp-1">
                {course.title}
              </h1>
              <p className="text-xs text-zinc-300 line-clamp-1 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>

          {/* Instructor & Goal Details */}
          <div className="p-3.5 bg-[#0f0f0f] rounded-2xl border border-white/10 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <img
                src={course.instructor.avatar}
                alt={course.instructor.name}
                className="w-9 h-9 rounded-full object-cover border border-white/20"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  {course.instructor.name}
                </span>
                <span className="text-xs text-zinc-400">
                  {course.instructor.role}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block font-mono">권장 학습량</span>
              <span className="text-xs font-bold text-indigo-300">
                {course.dailyGoalSuggestion}
              </span>
            </div>
          </div>

          {/* Progress & Streak Card */}
          <div className="p-4 bg-[#0f0f0f] rounded-2xl border border-white/10 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">학습 현황</span>
                <span className="text-xs text-zinc-400 font-mono">
                  [{completedCount} / {totalCount}강 완료]
                </span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{progress.streakDays}일 연속 학습</span>
              </div>
            </div>

            {/* Progress Bar: Rounded meter */}
            <div className="space-y-1.5">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>진도율</span>
                <span className="font-bold text-indigo-400">{progressPercent}%</span>
              </div>
            </div>

            {/* Final Quiz Status Banner */}
            {progress.isQuizPassed ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-emerald-300 font-mono">
                    최종 평가 통과 ({progress.finalScore}점)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openFinalQuiz(course)}
                  className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer"
                >
                  재응시
                </button>
              </div>
            ) : isCompletedAllClips ? (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-indigo-200">
                    전체 시청 완료! 최종 종합 퀴즈를 응시하세요.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openFinalQuiz(course)}
                  className="px-3 py-1 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  퀴즈 풀기
                </button>
              </div>
            ) : null}

            {/* Primary Action Button: [시청하기] */}
            <button
              type="button"
              onClick={() => startCoursePlayback(course.id, playbackIndex)}
              className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
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
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>커리큘럼 (총 {course.clips.length}강)</span>
              </h2>
              <span className="text-[11px] text-zinc-400">
                선택 시 해당 강좌 영상만 재생
              </span>
            </div>

            <div className="space-y-1.5">
              {course.clips.map((clip, index) => {
                const isClipCompleted = progress.completedClipIds.includes(clip.id);

                return (
                  <div
                    key={clip.id}
                    onClick={() => startCoursePlayback(course.id, index)}
                    className="p-3 bg-[#0f0f0f] border border-white/10 hover:border-white/25 rounded-xl flex items-center justify-between cursor-pointer group transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {isClipCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-600 shrink-0 group-hover:text-indigo-400 transition-colors" />
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-bold text-indigo-400">
                            [{clip.episodeIndex}강]
                          </span>
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                            {clip.clipTitle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {clip.durationSeconds}초 숏폼
                          </span>
                          {clip.clipQuiz && (
                            <span className="text-indigo-300">· 퀴즈 포함</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-zinc-400 group-hover:text-white font-semibold">
                      <span>재생</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course Memos Section */}
          <div className="space-y-2.5 pt-3.5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <h2 className="text-xs font-bold text-white">이 강좌의 메모</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-300 font-bold">
                  {courseMemos.length}
                </span>
              </div>
            </div>

            {/* Add Quick Memo Box */}
            <form onSubmit={handleAddCourseMemo} className="space-y-2.5 bg-[#0f0f0f] p-3.5 rounded-2xl border border-white/10 shadow-md">
              <div className="flex items-center gap-2">
                <select
                  value={selectedMemoClipId || course.clips[0]?.id || ''}
                  onChange={e => setSelectedMemoClipId(e.target.value)}
                  className="bg-white/10 border border-white/15 text-zinc-200 text-xs rounded-full px-3 py-1 focus:outline-none"
                >
                  {course.clips.map(c => (
                    <option key={c.id} value={c.id} className="bg-zinc-900 text-white">
                      {c.episodeIndex}강: {c.clipTitle.slice(0, 16)}...
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-400">에 메모 추가</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemoText}
                  onChange={e => setNewMemoText(e.target.value)}
                  placeholder="기억할 핵심 내용을 기록하세요..."
                  className="flex-1 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-white/35"
                />
                <button
                  type="submit"
                  disabled={!newMemoText.trim()}
                  className="px-3.5 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>등록</span>
                </button>
              </div>
            </form>

            {/* Memos List */}
            {courseMemos.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs bg-[#0f0f0f] rounded-2xl border border-white/10 p-4">
                <FileText className="w-6 h-6 mx-auto mb-1.5 text-zinc-500" />
                <p className="font-semibold text-zinc-300">아직 작성된 강좌 메모가 없습니다.</p>
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
                      className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            if (clipIdx !== -1) {
                              startCoursePlayback(course.id, clipIdx);
                            }
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 hover:text-white"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>
                            {clip ? `${clip.episodeIndex}강` : '강좌'} · {memo.timestamp}
                          </span>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-400">{memo.createdAt}</span>
                          <button
                            type="button"
                            onClick={() => deleteMemo(memo.id)}
                            className="text-zinc-400 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                            title="메모 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="p-4 bg-[#0f0f0f] border border-white/10 rounded-2xl space-y-2.5 mt-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">강좌 최종 종합 퀴즈</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                총 3문항 (60점 이상 수료)
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              모든 강좌 영상이 끝나면 최종 퀴즈를 풀어 학습 내용을 점검하고 수료증을 획득할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={() => openFinalQuiz(course)}
              className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
              className="text-xs text-zinc-500 hover:text-rose-400 underline transition-colors cursor-pointer"
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
    <div className="w-full min-h-full bg-[#090a0f] text-zinc-100 flex flex-col p-4 pb-24 no-scrollbar select-none">
      
      {/* Page Header */}
      <div className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">내 강의실</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              현재 수강 중인 강좌의 진도와 연속 학습일을 확인하세요.
            </p>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-300 font-bold">
            {enrolledCourses.length}개 수강 중
          </span>
        </div>
      </div>

      {/* Enrolled Courses List */}
      <div className="pt-3.5">
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3 bg-[#0f0f0f] border border-white/10 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mx-auto text-zinc-400">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-200">
                현재 수강 중인 강좌가 없습니다.
              </p>
              <p className="text-[11px] text-zinc-500">
                '탐색' 화면에서 실무에 필요한 숏폼 강좌를 찾아 담아보세요!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('explore')}
              className="px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
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
                  className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-all shadow-md"
                >
                  {/* Card Thumbnail Header */}
                  <div
                    onClick={() => setSelectedCourseDetailId(course.id)}
                    className="relative aspect-[21/9] w-full overflow-hidden bg-black cursor-pointer group"
                  >
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
                        {course.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-zinc-200 text-[10px] font-medium border border-white/15">
                        {course.difficulty}
                      </span>
                    </div>

                    {/* Streak badge */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{progress.streakDays}일 연속</span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-bold truncate">
                      <span className="truncate pr-2">{course.title}</span>
                      <span className="text-[10px] text-zinc-300 shrink-0 font-mono">
                        {course.clips.length}개 클립
                      </span>
                    </div>
                  </div>

                  {/* Course Body & Progress */}
                  <div className="p-3.5 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400">진도율</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-400">
                            {completedCount}/{totalCount}강
                          </span>
                          <span className="font-bold text-indigo-400">
                            {progressPercent}%
                          </span>
                        </div>
                      </div>
                      
                      {/* Meter Bar */}
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setSelectedCourseDetailId(course.id)}
                        className="flex-1 py-2 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
                      >
                        상세 및 메모
                      </button>
                      <button
                        type="button"
                        onClick={() => startCoursePlayback(course.id)}
                        className="flex-1 py-2 px-3 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
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
