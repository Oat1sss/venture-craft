import React, { useState } from 'react';
import { SimState } from '../../engine/types';
import { SECTOR_LABELS } from '../../engine/names';
import { formatMoney, MACRO_META } from '../../utils/format';

interface WorldMacroViewProps {
  state: SimState;
}

export const WorldMacroView: React.FC<WorldMacroViewProps> = ({ state }) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PUBLIC' | 'EXITED'>('ALL');
  const macroMeta = MACRO_META[state.macro.regime];

  const filtered = state.companies
    .filter((c) => {
      if (filter === 'ACTIVE') return c.status === 'ACTIVE';
      if (filter === 'PUBLIC') return c.isPublic && c.status === 'ACTIVE';
      if (filter === 'EXITED') return c.status === 'ACQUIRED' || c.status === 'BANKRUPT';
      return true;
    })
    .sort((a, b) => b.valuation - a.valuation);

  return (
    <div className="space-y-5">
      {/* Macro Economic Dashboard */}
      <section className="pixel-box p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1B1929]/15 pb-3">
          <div>
            <h2 className="font-pixel text-sm text-[#1B1929]">GLOBAL MACROECONOMIC CYCLE</h2>
            <p className="text-xs text-[#5B5670]">{macroMeta.shortNote}</p>
          </div>
          <span className={`px-3 py-1 font-pixel text-xs border-2 border-[#1B1929] ${macroMeta.bg} ${macroMeta.text}`}>
            {macroMeta.label} (~{Math.max(1, Math.ceil(state.macro.regimeDaysLeft / 30))} mo left)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-[#F6F1E4] border-2 border-[#1B1929]">
            <div className="text-[11px] text-[#5B5670]">Central Bank Rate</div>
            <div className="font-mono-num text-lg font-bold text-[#1B1929] mt-0.5">
              {state.macro.interestRate.toFixed(2)}%
            </div>
          </div>
          <div className="p-3 bg-[#F6F1E4] border-2 border-[#1B1929]">
            <div className="text-[11px] text-[#5B5670]">Inflation (CPI)</div>
            <div className="font-mono-num text-lg font-bold text-[#1B1929] mt-0.5">
              {state.macro.inflationRate.toFixed(2)}%
            </div>
          </div>
          <div className="p-3 bg-[#F6F1E4] border-2 border-[#1B1929]">
            <div className="text-[11px] text-[#5B5670]">GDP Growth</div>
            <div
              className={`font-mono-num text-lg font-bold mt-0.5 ${
                state.macro.gdpGrowth >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {state.macro.gdpGrowth >= 0 ? '+' : ''}{state.macro.gdpGrowth.toFixed(2)}%
            </div>
          </div>
          <div className="p-3 bg-[#F6F1E4] border-2 border-[#1B1929]">
            <div className="text-[11px] text-[#5B5670]">Equity Multiple Index</div>
            <div className="font-mono-num text-lg font-bold text-[#2563EB] mt-0.5">
              {state.macro.marketSentiment.toFixed(2)}x
            </div>
          </div>
          <div className="p-3 bg-[#F6F1E4] border-2 border-[#1B1929]">
            <div className="text-[11px] text-[#5B5670]">Crypto Liquidity</div>
            <div className="font-mono-num text-lg font-bold text-[#F59E0B] mt-0.5">
              {state.macro.cryptoSentiment.toFixed(2)}x
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic World Company Registry */}
      <section className="pixel-box p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-pixel text-sm text-[#1B1929]">DYNAMIC WORLD COMPANIES</h2>
          <div className="flex items-center gap-1.5">
            {(['ALL', 'ACTIVE', 'PUBLIC', 'EXITED'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-[11px] font-pixel border-2 border-[#1B1929] cursor-pointer ${
                  filter === f ? 'bg-[#1B1929] text-white' : 'bg-[#F6F1E4] text-[#1B1929]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#1B1929] text-[#5B5670]">
                <th className="py-2 pr-3">Company</th>
                <th className="py-2 px-2">Sector</th>
                <th className="py-2 px-2">Status / Stage</th>
                <th className="py-2 px-2 text-right">Monthly Rev</th>
                <th className="py-2 px-2 text-right">Valuation</th>
                <th className="py-2 pl-2 text-right">Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B1929]/15">
              {filtered.map((co) => (
                <tr key={co.id} className="hover:bg-[#F6F1E4]">
                  <td className="py-2 pr-3 font-bold text-[#1B1929]">
                    {co.name}{' '}
                    {co.isPlayerOwned && (
                      <span className="text-[11px] font-pixel text-[#2563EB]">[YOU]</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-[#3B3459]">{SECTOR_LABELS[co.sector]}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`font-semibold ${
                        co.status === 'BANKRUPT'
                          ? 'text-rose-700'
                          : co.status === 'ACQUIRED'
                          ? 'text-violet-700'
                          : co.isPublic
                          ? 'text-emerald-700'
                          : 'text-[#1B1929]'
                      }`}
                    >
                      {co.status === 'ACTIVE' ? co.stage.replace('_', ' ') : co.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono-num">
                    {formatMoney(co.monthlyRevenue)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono-num font-bold">
                    {formatMoney(co.valuation)}
                  </td>
                  <td className="py-2 pl-2 text-right font-mono-num">
                    {co.users.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
