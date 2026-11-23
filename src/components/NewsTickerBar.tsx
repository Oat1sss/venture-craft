import React from 'react';
import { Newspaper } from 'lucide-react';
import { NewsArticle } from '../engine/types';

interface NewsTickerBarProps {
  latestArticle: NewsArticle | null;
  pendingDecisionCount: number;
  onOpenNews: () => void;
}

export const NewsTickerBar: React.FC<NewsTickerBarProps> = ({
  latestArticle,
  pendingDecisionCount,
  onOpenNews,
}) => {
  if (!latestArticle) return null;

  const badgeBg =
    latestArticle.sentiment === 'POSITIVE'
      ? 'bg-[#10B981] text-[#1B1929]'
      : latestArticle.sentiment === 'NEGATIVE'
      ? 'bg-[#E11D48] text-white'
      : 'bg-[#F59E0B] text-[#1B1929]';

  return (
    <div className="w-full bg-[#2B2640] text-[#FFFDF7] border-b-2 border-[#1B1929] px-4 py-1.5 flex items-center justify-between gap-3 text-xs">
      <button
        type="button"
        onClick={onOpenNews}
        className="flex items-center gap-2.5 min-w-0 text-left hover:underline cursor-pointer"
      >
        <span className={`px-1.5 py-0.5 font-pixel text-[10px] border border-[#1B1929] shrink-0 ${badgeBg}`}>
          {latestArticle.category}
        </span>
        <span className="font-semibold truncate text-[#FDE68A]">
          {latestArticle.headline}
        </span>
        <span className="hidden md:inline text-[#94A3B8] shrink-0 font-mono-num">
          · {latestArticle.source}
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenNews}
        className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1B1929] hover:bg-[#3B3459] border border-[#4C456E] text-[11px] font-pixel shrink-0 cursor-pointer"
      >
        <Newspaper className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>NEWS WIRE</span>
        {pendingDecisionCount > 0 && (
          <span className="px-1 bg-[#E11D48] text-white font-mono-num font-bold">
            {pendingDecisionCount}
          </span>
        )}
      </button>
    </div>
  );
};
