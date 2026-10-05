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
  X, 
  BookOpen, 
  ArrowRight
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

  return (
    <div className="w-full min-h-full bg-zinc-950 text-zinc-100 flex flex-col p-4 pb-20 no-scrollbar">
      
      {/* 1. Page Title & Unified Search Bar */}
      <div className="space-y-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-base font-bold text-white">강좌 탐색</h1>
          <p className="text-[11px] text-zinc-400">
            관심 있는 실무 강좌를 찾고 내 강의실에 담아보세요.
          </p>
        </div>

        {/* Unified Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="강좌명, 실무 키워드, 자막 내용으로 검색..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-8 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Course List */}
      <div className="pt-3">
        <div className="flex items-center justify-between mb-3 text-xs text-zinc-400">
          <span className="font-medium text-zinc-300">
            강좌 목록 ({filteredCourses.length}개)
          </span>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            검색 조건에 맞는 강좌가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCourses.map(course => {
              const isEnrolled = enrolledCourseIds.has(course.id);

              return (
                <div
                  key={course.id}
                  onClick={() => handleOpenCourseDetail(course)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-zinc-900/80 backdrop-blur-sm text-white text-[10px] font-medium">
                        {course.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900/80 backdrop-blur-sm text-zinc-300 text-[10px] font-medium">
                        {course.difficulty}
                      </span>
                    </div>

                    {isEnrolled && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3" />
                        <span>수강 중</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px]">
                      <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm text-zinc-300">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {course.dailyGoalSuggestion}
                      </span>
                      <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm text-zinc-300">
                        <Eye className="w-3 h-3" />
                        {course.views.toLocaleString()}회
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-3.5 space-y-1.5">
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400">
                        {course.instructor.name} · {course.instructor.role}
                      </span>

                      <span className="text-xs font-medium text-indigo-400 flex items-center gap-0.5">
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

      {/* 3. Course Detail Modal & '내 강의실에 추가' Action */}
      {selectedCourseForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[420px] bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400">강좌 상세 설명</span>
              <button
                type="button"
                onClick={() => setSelectedCourseForDetail(null)}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden my-3 bg-black">
              <img
                src={selectedCourseForDetail.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-white text-[10px] font-medium">
                  {selectedCourseForDetail.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-zinc-300 text-[10px] font-medium">
                  {selectedCourseForDetail.difficulty}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1 mb-4">
              <h2 className="text-sm font-bold text-white">
                {selectedCourseForDetail.title}
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                {selectedCourseForDetail.description}
              </p>
            </div>

            {/* Instructor Info */}
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-2.5 mb-4">
              <img
                src={selectedCourseForDetail.instructor.avatar}
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  {selectedCourseForDetail.instructor.name}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {selectedCourseForDetail.instructor.role}
                </span>
              </div>
            </div>

            {/* Curriculum List */}
            <div className="space-y-2 mb-5">
              <span className="text-xs font-semibold text-zinc-300 block">
                커리큘럼 (총 {selectedCourseForDetail.clips.length}강)
              </span>
              <div className="space-y-1.5">
                {selectedCourseForDetail.clips.map(clip => (
                  <div
                    key={clip.id}
                    className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-200 line-clamp-1">{clip.clipTitle}</span>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">
                      {clip.durationSeconds}초 숏폼
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Add to My Classroom or Go to Classroom */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {enrolledCourseIds.has(selectedCourseForDetail.id) ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => unenrollCourse(selectedCourseForDetail.id)}
                    className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-400 transition-colors"
                  >
                    강의실에서 제외
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGoToCourseInClassroom(selectedCourseForDetail.id)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
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
                      if (selectedCourseForDetail.clips[0]) {
                        setSelectedCourseForDetail(null);
                        goToClip(selectedCourseForDetail.clips[0].id);
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>1화 미리보기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      enrollCourse(selectedCourseForDetail.id);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>내 강의실에 추가</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
