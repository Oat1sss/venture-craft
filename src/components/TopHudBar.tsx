import React from 'react';
import { Pause, Play, Volume2, VolumeX, Settings } from 'lucide-react';
import { SimState } from '../engine/types';
import { computeFounderNetWorth } from '../engine/simulation';
import { formatMoney, formatSimDate, MACRO_META } from '../utils/format';
import { MoneyBurst } from './MoneyBurst';

interface TopHudBarProps {
  state: SimState;
  autoPlaySpeed: number; // 0 = paused, 1 = 1 day/sec, 3 = fast
  muted: boolean;
  onStepDays: (days: number) => void;
  onToggleAutoPlay: (speed: number) => void;
  onSelectCompany: (companyId: string) => void;
  onToggleMute: () => void;
  onOpenMenu: () => void;
}

export const TopHudBar: React.FC<TopHudBarProps> = ({
  state,
  autoPlaySpeed,
  muted,
  onStepDays,
  onToggleAutoPlay,
  onSelectCompany,
  onToggleMute,
  onOpenMenu,
}) => {
  const playerCompanies = state.companies.filter((c) => c.isPlayerOwned && c.status === 'ACTIVE');
  const activeCo = playerCompanies.find((c) => c.id === state.activeCompanyId) ?? null;
  const netWorth = computeFounderNetWorth(state);
  const macroInfo = MACRO_META[state.macro.regime];

  return (
    <header className="w-full bg-[#1B1929] text-[#FFFDF7] border-b-4 border-[#1B1929] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Zone 1: Wordmark + Active Venture Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <svg width="24" height="24" viewBox="0 0 16 16" className="bg-[#F59E0B] border border-[#FFFDF7]/30 p-0.5" aria-hidden="true">
            <rect x="2" y="9" width="3" height="5" fill="#1B1929" />
            <rect x="6" y="6" width="3" height="8" fill="#2563EB" />
            <rect x="10" y="3" width="4" height="11" fill="#10B981" />
          </svg>
          <span className="font-pixel text-sm sm:text-base tracking-tight whitespace-nowrap">
            VENTURE CRAFT
          </span>
        </div>

        {playerCompanies.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] hidden sm:inline" aria-hidden="true">/</span>
            <select
              aria-label="Active startup selector"
              value={activeCo?.id ?? ''}
              onChange={(e) => onSelectCompany(e.target.value)}
              className="bg-[#2B2640] text-[#FFFDF7] border-2 border-[#4C456E] px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#F59E0B] max-w-[180px] truncate cursor-pointer"
            >
              {playerCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.stage.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Zone 2: Time Pace & Macro Date */}
      <div className="flex items-center flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-[#2B2640] border-2 border-[#4C456E] px-2.5 py-1 text-xs">
          <span className="font-mono-num font-bold text-[#FDE68A]" data-testid="hud-date">
            {formatSimDate(state.year, state.month, state.dayOfMonth)}
          </span>
          <span className="text-[#94A3B8]" aria-hidden="true">·</span>
          <span className={`px-1.5 py-0.5 font-semibold text-[11px] ${macroInfo.bg} ${macroInfo.text}`}>
            {macroInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Time pace controls">
          <button
            type="button"
            onClick={() => onToggleAutoPlay(autoPlaySpeed > 0 ? 0 : 1)}
            aria-label={autoPlaySpeed > 0 ? 'Pause auto advance' : 'Play auto advance'}
            className={`px-2 py-1 text-xs font-pixel border-2 border-[#1B1929] cursor-pointer flex items-center gap-1 ${
              autoPlaySpeed > 0 ? 'bg-[#10B981] text-[#1B1929]' : 'bg-[#3B3459] text-white hover:bg-[#4C456E]'
            }`}
          >
            {autoPlaySpeed > 0 ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onStepDays(1)}
            className="px-2 py-1 text-xs font-mono-num font-bold bg-[#3B3459] hover:bg-[#4C456E] text-white border-2 border-[#1B1929] cursor-pointer whitespace-nowrap"
          >
            +1D
          </button>
          <button
            type="button"
            onClick={() => onStepDays(7)}
            className="px-2 py-1 text-xs font-mono-num font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-2 border-[#1B1929] cursor-pointer whitespace-nowrap"
          >
            +1W
          </button>
          <button
            type="button"
            onClick={() => onStepDays(30)}
            className="px-2 py-1 text-xs font-mono-num font-bold bg-[#F59E0B] hover:bg-[#D97706] text-[#1B1929] border-2 border-[#1B1929] cursor-pointer whitespace-nowrap"
          >
            +1M
          </button>
          <button
            type="button"
            onClick={() => onStepDays(365)}
            className="px-2 py-1 text-xs font-mono-num font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-2 border-[#1B1929] cursor-pointer whitespace-nowrap"
          >
            +1Y
          </button>
        </div>
      </div>

      {/* Zone 3: Personal Cash, Net Worth & Utility Buttons */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 text-xs">
          <div className="relative">
            <MoneyBurst value={state.personal.liquidCash} className="-top-5 right-0" />
            <span className="text-[#94A3B8] mr-1">Cash:</span>
            <span className="font-mono-num font-bold text-[#34D399]" data-testid="hud-personal-cash">
              {formatMoney(state.personal.liquidCash)}
            </span>
          </div>
          <span className="text-[#4C456E]" aria-hidden="true">|</span>
          <div className="relative">
            <MoneyBurst value={netWorth} className="-top-5 right-0" />
            <span className="text-[#94A3B8] mr-1">Net Worth:</span>
            <span className="font-mono-num font-bold text-[#FDE68A]" data-testid="hud-net-worth">
              {formatMoney(netWorth)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          className="p-1.5 bg-[#2B2640] hover:bg-[#3B3459] border-2 border-[#4C456E] cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4 text-[#94A3B8]" /> : <Volume2 className="w-4 h-4 text-[#34D399]" />}
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open pause and save menu"
          className="px-2.5 py-1.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-pixel text-xs border-2 border-[#1B1929] cursor-pointer flex items-center gap-1 whitespace-nowrap"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Menu</span>
        </button>
      </div>
    </header>
  );
};
