import React from 'react';
import { SimState } from '../engine/types';
import { computeFounderNetWorth } from '../engine/simulation';
import { formatMoney } from '../utils/format';

interface GameModalsProps {
  mode: 'PAUSED' | 'GAMEOVER' | null;
  state: SimState;
  onResume: () => void;
  onSaveToLocal: () => void;
  onRestartToTitle: () => void;
  saveToast: string | null;
}

export const GameModals: React.FC<GameModalsProps> = ({
  mode,
  state,
  onResume,
  onSaveToLocal,
  onRestartToTitle,
  saveToast,
}) => {
  if (!mode) return null;
  const netWorth = computeFounderNetWorth(state);
  const ownedCount = state.companies.filter((c) => c.isPlayerOwned).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1B1929]/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'GAMEOVER' ? 'Simulation Ended' : 'Sandbox Menu'}
    >
      <div className="pixel-box bg-[#FFFDF7] max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between border-b-2 border-[#1B1929] pb-3">
          <h2 className="font-pixel text-lg text-[#1B1929]">
            {mode === 'GAMEOVER' ? 'SANDBOX COMPLETE' : 'SANDBOX MENU'}
          </h2>
          <span className="font-mono-num text-xs font-bold text-[#5B5670]">
            Day {state.totalDays}
          </span>
        </div>

        {mode === 'GAMEOVER' && state.gameOverReason && (
          <p className="text-sm text-rose-800 bg-rose-50 border-2 border-rose-800 p-3 font-medium">
            {state.gameOverReason}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 bg-[#F6F1E4] border-2 border-[#1B1929]">
            <div className="text-[11px] text-[#5B5670]">Net Worth</div>
            <div className="font-mono-num font-bold text-sm text-[#1B1929] mt-0.5">{formatMoney(netWorth)}</div>
          </div>
          <div className="p-2.5 bg-[#F6F1E4] border-2 border-[#1B1929]">
            <div className="text-[11px] text-[#5B5670]">Ventures</div>
            <div className="font-mono-num font-bold text-sm text-[#1B1929] mt-0.5">{ownedCount}</div>
          </div>
          <div className="p-2.5 bg-[#F6F1E4] border-2 border-[#1B1929]">
            <div className="text-[11px] text-[#5B5670]">Funds</div>
            <div className="font-mono-num font-bold text-sm text-[#1B1929] mt-0.5">{state.playerFunds.length}</div>
          </div>
        </div>

        {saveToast && (
          <div className="p-2.5 bg-emerald-100 border-2 border-[#1B1929] text-xs font-semibold text-emerald-950">
            {saveToast}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {mode === 'PAUSED' && (
            <>
              <button
                type="button"
                onClick={onResume}
                className="pixel-btn w-full py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] text-[#1B1929] hover:text-white font-pixel text-xs uppercase cursor-pointer"
              >
                Resume Simulation
              </button>
              <button
                type="button"
                onClick={onSaveToLocal}
                className="pixel-btn w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#1B1929] font-pixel text-xs uppercase cursor-pointer"
              >
                Save Sandbox Progress
              </button>
            </>
          )}
          <button
            type="button"
            data-start={mode === 'GAMEOVER' ? 'true' : undefined}
            onClick={onRestartToTitle}
            className="pixel-btn w-full py-2.5 px-4 bg-[#F6F1E4] hover:bg-[#E2D9C5] text-[#1B1929] font-pixel text-xs uppercase cursor-pointer"
          >
            {mode === 'GAMEOVER' ? 'Start New Sandbox' : 'Return to Title Screen'}
          </button>
        </div>
      </div>
    </div>
  );
};
