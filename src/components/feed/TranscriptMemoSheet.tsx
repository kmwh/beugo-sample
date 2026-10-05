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
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end pointer-events-auto">
      <div 
        className="w-full bg-zinc-900 border-t border-zinc-800 rounded-t-2xl max-h-[80%] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar & Header */}
        <div className="pt-2.5 px-4 pb-2.5 border-b border-zinc-800">
          <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-2.5" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('transcripts')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'transcripts'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>대본 ({clip.transcripts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('memos')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'memos'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>메모 ({clipMemos.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar max-h-[50vh]">
          {activeTab === 'transcripts' ? (
            <div className="space-y-2">
              <div className="px-1 text-[11px] text-zinc-500">
                문장을 클릭하여 하이라이트를 설정하거나 시간을 눌러 이동할 수 있습니다.
              </div>

              {clip.transcripts.map(line => {
                const isHighlighted = highlightedTranscriptIds.has(line.id);
                const isCurrent = Math.abs(currentTimeSeconds - line.seconds) <= 3;

                return (
                  <div
                    key={line.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isHighlighted
                        ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200'
                        : isCurrent
                        ? 'bg-zinc-800/80 border-zinc-700 text-white'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
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
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors shrink-0"
                      title="해당 시간으로 이동"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{line.time}</span>
                    </button>

                    {/* Sentence text */}
                    <div className="flex-1 text-xs leading-relaxed">
                      <span className={isHighlighted ? 'underline decoration-indigo-400 underline-offset-2' : ''}>
                        {line.text}
                      </span>
                    </div>

                    {/* Highlight indicator icon */}
                    <div className="shrink-0 pt-0.5">
                      {isHighlighted ? (
                        <Check className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Highlighter className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {clipMemos.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                  작성된 메모가 없습니다.<br />아래 입력창에 메모를 남겨보세요.
                </div>
              ) : (
                clipMemos.map(memo => (
                  <div
                    key={memo.id}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-200 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span className="font-mono text-indigo-400">
                        {memo.timestamp}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{memo.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => deleteMemo(memo.id)}
                          className="text-zinc-500 hover:text-rose-400"
                          title="메모 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-100 break-words">
                      {memo.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom memo input */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800">
          <form onSubmit={handleAddMemo} className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1.5 rounded-lg">
              {currentFormattedTime}
            </span>
            <input
              type="text"
              value={memoInput}
              onChange={e => setMemoInput(e.target.value)}
              placeholder="메모를 입력하세요..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
            <button
              type="submit"
              disabled={!memoInput.trim()}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shrink-0"
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
