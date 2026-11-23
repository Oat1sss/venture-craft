import React, { useState } from 'react';
import { Company, NewsCategory, SimState } from '../../engine/types';
import { SECTOR_LABELS } from '../../engine/names';
import { formatMoney } from '../../utils/format';

interface NewsWireViewProps {
  state: SimState;
  activeCompany: Company | null;
  onResolveDecision: (decisionId: string, choiceId: string) => void;
  onIssuePressRelease: (companyId: string | null, angle: 'GROWTH' | 'EARNINGS') => void;
}

export const NewsWireView: React.FC<NewsWireViewProps> = ({
  state,
  activeCompany,
  onResolveDecision,
  onIssuePressRelease,
}) => {
  const [catFilter, setCatFilter] = useState<'ALL' | NewsCategory>('ALL');

  const articles = state.newsFeed.filter((n) =>
    catFilter === 'ALL' ? true : n.category === catFilter
  );

  return (
    <div className="space-y-5">
      {/* Interactive CEO / Press Decisions Queue */}
      {state.pendingDecisions.length > 0 && (
        <section className="pixel-box p-4 space-y-3 bg-amber-50">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-sm text-[#1B1929]">
              EXECUTIVE DESK · PENDING MEDIA + MARKET DECISIONS
            </h2>
            <span className="font-mono-num text-xs font-bold text-rose-700">
              {state.pendingDecisions.length} Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {state.pendingDecisions.map((dec) => {
              const targetCo = state.companies.find((c) => c.id === dec.companyId);
              return (
                <div key={dec.id} className="p-3.5 bg-[#FFFDF7] border-2 border-[#1B1929] space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono-num text-[#5B5670]">
                      <span>Day {dec.day} · {dec.category}</span>
                      {targetCo && <span className="font-bold text-[#2563EB]">{targetCo.name}</span>}
                    </div>
                    <div className="font-bold text-sm text-[#1B1929] mt-1">{dec.title}</div>
                    <p className="text-xs text-[#3B3459] mt-1">{dec.description}</p>
                  </div>

                  <div className="space-y-2">
                    {dec.choices.map((ch) => {
                      const cantAfford = targetCo ? targetCo.cash < ch.costCash : false;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          disabled={cantAfford}
                          onClick={() => onResolveDecision(dec.id, ch.id)}
                          className="pixel-btn w-full p-2.5 text-left bg-[#F6F1E4] hover:bg-white cursor-pointer"
                        >
                          <div className="font-pixel text-[11px] text-[#1B1929]">{ch.label}</div>
                          <div className="text-[11px] text-[#059669] font-semibold mt-0.5">{ch.effectSummary}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PR & Narrative Desk + Breaking News Wire */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <section className="xl:col-span-4 pixel-box p-4 space-y-3">
          <h2 className="font-pixel text-sm text-[#1B1929]">PRESS + PR DESK</h2>
          <p className="text-xs text-[#5B5670]">
            Broadcast official press releases ($8,000) to shape market narrative, boost company hype, and lift your founder reputation.
          </p>
          <div className="p-3 bg-[#F6F1E4] border border-[#1B1929] text-xs space-y-1">
            <div>Subject: <span className="font-bold">{activeCompany ? activeCompany.name : state.personal.founderName}</span></div>
            {activeCompany && (
              <div className="font-mono-num text-[#3B3459]">
                Hype {activeCompany.hype}/100 · Cash {formatMoney(activeCompany.cash)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled={activeCompany ? activeCompany.cash < 8000 : state.personal.liquidCash < 8000}
              onClick={() => onIssuePressRelease(activeCompany?.id ?? null, 'GROWTH')}
              className="pixel-btn w-full py-2.5 px-3 bg-[#2563EB] text-white font-pixel text-xs cursor-pointer"
            >
              Announce Hypergrowth ($8K)
            </button>
            <button
              type="button"
              disabled={activeCompany ? activeCompany.cash < 8000 : state.personal.liquidCash < 8000}
              onClick={() => onIssuePressRelease(activeCompany?.id ?? null, 'EARNINGS')}
              className="pixel-btn w-full py-2.5 px-3 bg-[#10B981] text-[#1B1929] font-pixel text-xs cursor-pointer"
            >
              Publish Margin Guidance ($8K)
            </button>
          </div>
        </section>

        <section className="xl:col-span-8 pixel-box p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-pixel text-sm text-[#1B1929]">GLOBAL FINANCIAL NEWS WIRE</h2>
            <div className="flex flex-wrap items-center gap-1">
              {(['ALL', 'BREAKING', 'ECONOMY', 'MARKETS', 'TECH', 'INDUSTRIAL', 'POLICY'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCatFilter(cat)}
                  className={`px-2 py-1 text-[10px] font-pixel border border-[#1B1929] cursor-pointer ${
                    catFilter === cat ? 'bg-[#1B1929] text-white' : 'bg-[#F6F1E4] text-[#1B1929]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {articles.map((art) => (
              <article
                key={art.id}
                className="p-3 bg-[#F6F1E4] border-2 border-[#1B1929] space-y-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num text-[#5B5670]">
                  <span>
                    Day {art.day} · {art.source} · {art.category}
                    {art.affectedSector && art.affectedSector !== 'ALL'
                      ? ` · ${SECTOR_LABELS[art.affectedSector]}`
                      : ''}
                  </span>
                  {typeof art.marketImpactPct === 'number' && (
                    <span
                      className={`font-bold ${
                        art.marketImpactPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {art.marketImpactPct >= 0 ? '+' : ''}{art.marketImpactPct}% Sector Pulse
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-[#1B1929]">{art.headline}</h3>
                <p className="text-xs text-[#3B3459] leading-relaxed">{art.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
