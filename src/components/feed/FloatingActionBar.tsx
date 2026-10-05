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

  // If in distraction-free mode, show only a small subtle restore button
  if (distractionFree) {
    return (
      <div className="absolute bottom-20 right-3 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => setDistractionFree(false)}
          className="p-2.5 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          title="몰입모드 해제"
        >
          <Eye className="w-5 h-5 text-indigo-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-16 right-3 z-30 flex flex-col items-center gap-3 pointer-events-auto">
      
      {/* 1. 좋아요 */}
      <button
        type="button"
        onClick={() => toggleLike(clip.id)}
        className="group flex flex-col items-center gap-0.5 focus:outline-none"
        title="좋아요"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors ${
            isLiked
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
              : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`}
          />
        </div>
        <span className="text-[10px] font-medium text-zinc-400">
          {clip.likes + (isLiked ? 1 : 0)}
        </span>
      </button>

      {/* 2. 저장 (내 페이지에서 모아보기) */}
      <button
        type="button"
        onClick={() => toggleSaveClip(clip.id)}
        className="group flex flex-col items-center gap-0.5 focus:outline-none"
        title={isSaved ? '저장됨' : '저장하기'}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors ${
            isSaved
              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
              : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-400' : ''}`} />
        </div>
        <span className="text-[10px] font-medium text-zinc-400">
          저장
        </span>
      </button>

      {/* 3. 대본/메모 */}
      <button
        type="button"
        onClick={onOpenTranscriptSheet}
        className="group flex flex-col items-center gap-0.5 focus:outline-none"
        title="대본 & 메모"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
          <FileText className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium text-zinc-400">
          대본/메모
        </span>
      </button>

      {/* 4. 몰입모드 */}
      <button
        type="button"
        onClick={() => setDistractionFree(true)}
        className="group flex flex-col items-center gap-0.5 focus:outline-none"
        title="몰입모드"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
          <Eye className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium text-zinc-400">
          몰입모드
        </span>
      </button>

      {/* 5. 공유 */}
      <button
        type="button"
        onClick={handleShare}
        className="group flex flex-col items-center gap-0.5 focus:outline-none"
        title="공유"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
          <Share2 className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium text-zinc-400">
          공유
        </span>
      </button>
    </div>
  );
};
