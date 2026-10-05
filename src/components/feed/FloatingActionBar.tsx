import React from 'react';
import { useApp } from '../../context/useApp';
import type { VideoClip } from '../../types';
import { 
  Heart, 
  Bookmark, 
  FileText, 
  Eye, 
  Share2 
} from 'lucide-react';

interface FloatingActionBarProps {
  clip: VideoClip;
  onOpenTranscriptSheet: () => void;
}

export const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  clip,
  onOpenTranscriptSheet,
}) => {
  const { 
    likedClipIds, 
    toggleLike, 
    savedClipIds,
    toggleSaveClip,
    distractionFree, 
    setDistractionFree,
    showToast,
  } = useApp();

  const isLiked = likedClipIds.has(clip.id);
  const isSaved = savedClipIds.has(clip.id);

  const handleShare = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    showToast('강의 링크가 복사되었습니다.', 'success');
  };

  // Format likes count similar to YouTube (e.g. 9.9천)
  const totalLikes = clip.likes + (isLiked ? 1 : 0);
  const formattedLikes = totalLikes >= 1000 
    ? `${(totalLikes / 1000).toFixed(1)}천`
    : `${totalLikes}`;

  // Distraction-free mode toggle button
  if (distractionFree) {
    return (
      <div className="absolute bottom-20 right-3.5 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => setDistractionFree(false)}
          className="p-3 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
          title="몰입모드 해제"
        >
          <Eye className="w-5 h-5 text-indigo-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-16 right-2.5 z-30 flex flex-col items-center gap-4 pointer-events-auto select-none">
      
      {/* 1. 좋아요 (Heart with count - YouTube floating icon style) */}
      <button
        type="button"
        onClick={() => toggleLike(clip.id)}
        className="group flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
        title="좋아요"
      >
        <div className="p-1 active:scale-75 transition-transform">
          <Heart
            className={`w-7 h-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] transition-all ${
              isLiked 
                ? 'fill-rose-500 text-rose-500 scale-110' 
                : 'text-white stroke-[2.2] group-hover:scale-105'
            }`}
          />
        </div>
        <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tracking-tight">
          {formattedLikes}
        </span>
      </button>

      {/* 2. 저장 (Bookmark - YouTube floating icon style) */}
      <button
        type="button"
        onClick={() => toggleSaveClip(clip.id)}
        className="group flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
        title={isSaved ? '저장됨' : '저장하기'}
      >
        <div className="p-1 active:scale-75 transition-transform">
          <Bookmark 
            className={`w-7 h-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] transition-all ${
              isSaved 
                ? 'fill-amber-400 text-amber-400 scale-110' 
                : 'text-white stroke-[2.2] group-hover:scale-105'
            }`} 
          />
        </div>
        <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tracking-tight">
          저장
        </span>
      </button>

      {/* 3. 대본/메모 (Transcript & Notes) */}
      <button
        type="button"
        onClick={onOpenTranscriptSheet}
        className="group flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
        title="대본 & 메모"
      >
        <div className="p-1 active:scale-75 transition-transform">
          <FileText className="w-7 h-7 text-white stroke-[2.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform" />
        </div>
        <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tracking-tight">
          대본/메모
        </span>
      </button>

      {/* 4. 몰입모드 (Distraction-Free) */}
      <button
        type="button"
        onClick={() => setDistractionFree(true)}
        className="group flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
        title="화면 정보 숨기기"
      >
        <div className="p-1 active:scale-75 transition-transform">
          <Eye className="w-7 h-7 text-white stroke-[2.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform" />
        </div>
        <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tracking-tight">
          몰입모드
        </span>
      </button>

      {/* 5. 공유 (Share) */}
      <button
        type="button"
        onClick={handleShare}
        className="group flex flex-col items-center gap-1 focus:outline-none cursor-pointer"
        title="링크 복사"
      >
        <div className="p-1 active:scale-75 transition-transform">
          <Share2 className="w-7 h-7 text-white stroke-[2.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform" />
        </div>
        <span className="text-[11px] font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tracking-tight">
          공유
        </span>
      </button>
    </div>
  );
};
