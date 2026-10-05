import React, { useState } from 'react';
import { useApp } from '../../context/useApp';
import type { VideoClip } from '../../types';
import { 
  X, 
  FileText, 
  Highlighter, 
  Send, 
  Trash2, 
  Play, 
  Check 
} from 'lucide-react';

interface TranscriptMemoSheetProps {
  clip: VideoClip;
  isOpen: boolean;
  onClose: () => void;
  currentTimeSeconds: number;
  onSeek: (seconds: number) => void;
}

export const TranscriptMemoSheet: React.FC<TranscriptMemoSheetProps> = ({
  clip,
  isOpen,
  onClose,
  currentTimeSeconds,
  onSeek,
}) => {
  const { 
    highlightedTranscriptIds, 
    toggleHighlight, 
    memos, 
    addMemo, 
    deleteMemo 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'transcripts' | 'memos'>('transcripts');
  const [memoInput, setMemoInput] = useState('');

  if (!isOpen) return null;

  const clipMemos = memos.filter(m => m.clipId === clip.id);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentFormattedTime = formatSeconds(currentTimeSeconds);

  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoInput.trim()) return;
    addMemo(clip.id, currentFormattedTime, memoInput);
    setMemoInput('');
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-none select-none">
      {/* Transparent upper area: Video is completely unobstructed, clicking closes the sheet */}
      <div 
        className="flex-1 pointer-events-auto cursor-pointer" 
        onClick={onClose} 
      />

      <div 
        className="w-full bg-[#0f0f0f]/95 backdrop-blur-2xl border-t border-white/15 rounded-t-2xl h-[48%] max-h-[50%] flex flex-col shadow-[0_-10px_35px_rgba(0,0,0,0.85)] pointer-events-auto animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar & Header */}
        <div className="pt-2.5 px-4 pb-2.5 border-b border-white/10">
          <div className="w-10 h-1 bg-white/25 rounded-full mx-auto mb-2" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('transcripts')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'transcripts'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>대본 [{clip.transcripts.length}]</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('memos')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'memos'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'bg-white/10 text-zinc-300 hover:text-white'
                }`}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>메모 [{clipMemos.length}]</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar max-h-[50vh]">
          {activeTab === 'transcripts' ? (
            <div className="space-y-1.5">
              <div className="px-1 text-[11px] text-zinc-400 font-mono">
                문장 선택 시 하이라이트 저장 / 시간 선택 시 해당 위치로 점프
              </div>

              {clip.transcripts.map(line => {
                const isHighlighted = highlightedTranscriptIds.has(line.id);
                const isCurrent = Math.abs(currentTimeSeconds - line.seconds) <= 3;

                return (
                  <div
                    key={line.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      isHighlighted
                        ? 'bg-indigo-950/50 border-indigo-500/60 text-white'
                        : isCurrent
                        ? 'bg-white/15 border-white/30 text-white'
                        : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                    }`}
                    onClick={() => toggleHighlight(line.id)}
                  >
                    {/* Timestamp seek button */}
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onSeek(line.seconds);
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-mono font-bold text-indigo-300 hover:bg-white hover:text-black transition-colors shrink-0 border border-white/15"
                      title="해당 시간으로 이동"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{line.time}</span>
                    </button>

                    {/* Sentence text */}
                    <div className="flex-1 text-xs leading-relaxed font-normal pt-0.5">
                      <span className={isHighlighted ? 'bg-indigo-500/30 text-indigo-200 font-semibold px-1 rounded' : ''}>
                        {line.text}
                      </span>
                    </div>

                    {/* Highlight indicator icon */}
                    <div className="shrink-0 pt-0.5">
                      {isHighlighted ? (
                        <Check className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Highlighter className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {clipMemos.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs bg-white/5 rounded-2xl border border-white/10">
                  <FileText className="w-6 h-6 mx-auto mb-1.5 text-zinc-500" />
                  <p className="font-semibold text-zinc-200">작성된 메모가 없습니다.</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">아래 입력창에서 학습 요점을 기록해보세요.</p>
                </div>
              ) : (
                clipMemos.map(memo => (
                  <div
                    key={memo.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-100 flex flex-col gap-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[11px]">
                        {memo.timestamp}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 font-mono text-[10px]">{memo.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => deleteMemo(memo.id)}
                          className="p-1 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="메모 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-200 break-words whitespace-pre-wrap">
                      {memo.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom memo input */}
        <div className="p-3 bg-[#0a0a0a] border-t border-white/10">
          <form onSubmit={handleAddMemo} className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-xs font-bold text-zinc-300 bg-white/10 border border-white/15 px-2.5 py-1.5 rounded-full">
              {currentFormattedTime}
            </span>
            <input
              type="text"
              value={memoInput}
              onChange={e => setMemoInput(e.target.value)}
              placeholder="이 장면에 메모를 입력하세요..."
              className="flex-1 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-white/40"
            />
            <button
              type="submit"
              disabled={!memoInput.trim()}
              className="p-2 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
              title="메모 등록"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
