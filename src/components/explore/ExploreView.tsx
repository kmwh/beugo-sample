import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/useApp';
import type { JobCategory, Course } from '../../types';
import { 
  Search, 
  Clock, 
  Eye, 
  Play, 
  Layers, 
  Plus, 
  Check, 
  BookOpen, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const CATEGORIES: ('전체' | JobCategory)[] = [
  '전체',
  '프론트엔드',
  '백엔드',
  '기획/PM',
  '세무/회계(스마트A)',
  '데이터/AI',
];

export const ExploreView: React.FC = () => {
  const { 
    courses, 
    goToClip, 
    enrolledCourseIds, 
    enrollCourse,
    unenrollCourse,
    setSelectedCourseDetailId,
    setActivePage,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'전체' | JobCategory>('전체');
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);

  // Unified Search (Searches course title, description, tags, and all transcript text)
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (selectedCategory !== '전체' && course.category !== selectedCategory) {
        return false;
      }
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      const matchesTitle = course.title.toLowerCase().includes(term);
      const matchesDesc = course.description.toLowerCase().includes(term);
      const matchesTags = course.clips.some(c => c.tags.some(t => t.toLowerCase().includes(term)));
      const matchesTranscripts = course.clips.some(c => 
        c.transcripts.some(t => t.text.toLowerCase().includes(term))
      );

      return matchesTitle || matchesDesc || matchesTags || matchesTranscripts;
    });
  }, [courses, selectedCategory, searchTerm]);

  const handleOpenCourseDetail = (course: Course) => {
    setSelectedCourseForDetail(course);
  };

  const handleGoToCourseInClassroom = (courseId: string) => {
    setSelectedCourseForDetail(null);
    setSelectedCourseDetailId(courseId);
    setActivePage('courses');
  };

  // =====================================================
  // VIEW 1: Separate Course Detail Subpage (Requirement 2 & 1)
  // =====================================================
  if (selectedCourseForDetail) {
    const course = selectedCourseForDetail;
    const isEnrolled = enrolledCourseIds.has(course.id);

    return (
      <div className="w-full min-h-full bg-[#090a0f] text-zinc-100 flex flex-col p-4 pb-24 no-scrollbar select-none">
        
        {/* Top Back Navigation Bar: Pure Arrow without box or label */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCourseForDetail(null)}
              className="p-1 -ml-1 text-white hover:text-zinc-300 transition-colors cursor-pointer"
              title="뒤로가기"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            <h1 className="text-base font-bold text-white tracking-tight">강좌 상세</h1>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
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
              <h2 className="text-base font-bold line-clamp-1">
                {course.title}
              </h2>
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

          {/* Curriculum List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>커리큘럼 (총 {course.clips.length}강)</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">숏폼 집중 코스</span>
            </div>

            <div className="space-y-1.5">
              {course.clips.map(clip => (
                <div
                  key={clip.id}
                  className="p-3 bg-[#0f0f0f] border border-white/10 rounded-xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px] shrink-0 border border-indigo-500/30">
                      {clip.episodeIndex}강
                    </span>
                    <span className="text-xs text-zinc-200 font-medium truncate">{clip.clipTitle}</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono shrink-0 ml-2">
                    {clip.durationSeconds}초
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2">
            {isEnrolled ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => unenrollCourse(course.id)}
                  className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-zinc-400 transition-colors cursor-pointer"
                >
                  강의실 제외
                </button>
                <button
                  type="button"
                  onClick={() => handleGoToCourseInClassroom(course.id)}
                  className="flex-1 py-2.5 px-4 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>내 강의실에서 수강하기</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (course.clips[0]) {
                      setSelectedCourseForDetail(null);
                      goToClip(course.clips[0].id);
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>1화 미리보기</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    enrollCourse(course.id);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>내 강의실에 추가</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // VIEW 2: Explore Course List
  // =====================================================
  return (
    <div className="w-full min-h-full bg-[#090a0f] text-zinc-100 flex flex-col p-4 pb-24 no-scrollbar select-none">
      
      {/* 1. Page Header & Unified Search Bar */}
      <div className="space-y-3 pb-3.5 border-b border-white/10">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">강좌 탐색</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            실무 직무 강좌를 검색하고 내 강의실에 담아 학습하세요.
          </p>
        </div>

        {/* Unified Search Input (Pill rounded style) */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="강좌명, 직무 키워드, 자막 내용으로 검색..."
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-full pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-white/30 transition-colors font-sans shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white p-0.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips: Rounded-full pills matching Home */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black shadow-white/20 font-bold'
                    : 'bg-[#0f0f0f] text-zinc-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Course List */}
      <div className="pt-3.5">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-white">
            강좌 목록 <span className="text-indigo-400 font-mono">[{filteredCourses.length}]</span>
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#0f0f0f] border border-white/10 rounded-2xl">
            <Layers className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
            <p className="text-xs font-semibold text-zinc-300">검색 조건에 맞는 강좌가 없습니다.</p>
            <p className="text-[11px] text-zinc-500 mt-1">다른 검색어나 카테고리를 선택해보세요.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredCourses.map(course => {
              const isEnrolled = enrolledCourseIds.has(course.id);

              return (
                <div
                  key={course.id}
                  onClick={() => handleOpenCourseDetail(course)}
                  className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-all cursor-pointer group shadow-md"
                >
                  {/* Thumbnail Cover */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold border border-white/20">
                        {course.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-zinc-300 text-[10px] font-medium border border-white/15">
                        {course.difficulty}
                      </span>
                    </div>

                    {isEnrolled && (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-sm border border-emerald-400/30">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>수강 중</span>
                      </div>
                    )}

                    {/* Bottom Metadata inside thumbnail */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-zinc-200 border border-white/15 text-[11px] font-medium">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>{course.dailyGoalSuggestion}</span>
                      </span>
                      <span className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-zinc-300 border border-white/15 text-[10px]">
                        <Eye className="w-3 h-3 text-zinc-400" />
                        <span>{course.views.toLocaleString()}회</span>
                      </span>
                    </div>
                  </div>

                  {/* Course Info Card Body */}
                  <div className="p-3.5 space-y-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Instructor & CTA Row */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={course.instructor.avatar}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover border border-white/20"
                        />
                        <span className="text-xs font-semibold text-zinc-200">
                          {course.instructor.name}
                        </span>
                        <span className="text-zinc-500 text-[10px]">·</span>
                        <span className="text-xs text-zinc-400">
                          {course.instructor.role}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        상세보기 <ArrowRight className="w-3 h-3" />
                      </span>
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
