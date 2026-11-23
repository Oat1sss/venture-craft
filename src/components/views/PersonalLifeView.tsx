import React from 'react';
import { Company, LifestyleTier, SimState } from '../../engine/types';
import { LIFESTYLE_COSTS, PERSONAL_ASSETS_CATALOG } from '../../engine/names';
import { computeFounderNetWorth } from '../../engine/simulation';
import { formatMoney } from '../../utils/format';
import { PixelSparkline } from '../PixelCharts';
import { MoneyBurst } from '../MoneyBurst';

interface PersonalLifeViewProps {
  state: SimState;
  activeCompany: Company | null;
  onSetLifestyle: (tier: LifestyleTier) => void;
  onSetSalary: (salary: number) => void;
  onSecondarySale: (companyId: string, pct: number) => void;
  onBuyAsset: (assetId: string) => void;
  onTakeVacation: () => void;
  onAllocateTBills: (delta: number) => void;
}

export const PersonalLifeView: React.FC<PersonalLifeViewProps> = ({
  state,
  activeCompany,
  onSetLifestyle,
  onSetSalary,
  onSecondarySale,
  onBuyAsset,
  onTakeVacation,
  onAllocateTBills,
}) => {
  const netWorth = computeFounderNetWorth(state);
  const { personal } = state;

  return (
    <div className="space-y-5">
      {/* Personal Status & Net Worth */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 pixel-box p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-pixel text-sm text-[#1B1929]">
                {personal.founderName.toUpperCase()} — PERSONAL LEDGER
              </h2>
              <p className="text-xs text-[#5B5670]">
                Reputation {personal.reputation}/100 · Network {personal.networkScore}/100
              </p>
            </div>
            <PixelSparkline values={personal.netWorthHistory} color="#10B981" width={140} height={42} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
              <div className="text-[#5B5670]">Total Net Worth</div>
              <div className="font-mono-num font-bold text-base text-[#059669]">
                {formatMoney(netWorth)}
              </div>
            </div>
            <div className="relative p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
              <MoneyBurst value={personal.liquidCash} />
              <div className="text-[#5B5670]">Liquid Cash</div>
              <div className="font-mono-num font-bold text-base text-[#1B1929]">
                {formatMoney(personal.liquidCash)}
              </div>
            </div>
            <div className="p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
              <div className="text-[#5B5670]">Stress Level</div>
              <div className={`font-mono-num font-bold text-base ${personal.stress > 70 ? 'text-rose-700' : 'text-[#1B1929]'}`}>
                {personal.stress}/100
              </div>
            </div>
            <div className="p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
              <div className="text-[#5B5670]">Founder Energy</div>
              <div className="font-mono-num font-bold text-base text-[#2563EB]">
                {personal.energy}/100
              </div>
            </div>
          </div>

          {/* Salary Draw & Secondary Share Liquidity */}
          <div className="pt-2 border-t-2 border-[#1B1929]/15 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label htmlFor="salary-draw" className="font-semibold text-[#3B3459]">
                  Monthly Founder Salary Draw
                </label>
                <span className="font-mono-num font-bold">
                  {formatMoney(personal.monthlySalaryDraw)}/mo
                </span>
              </div>
              <input
                id="salary-draw"
                type="range"
                min={0}
                max={45000}
                step={500}
                value={personal.monthlySalaryDraw}
                onChange={(e) => onSetSalary(Number(e.target.value))}
                className="w-full accent-[#10B981]"
              />
            </div>

            {/* Personal High-Yield Treasury Bills */}
            <div className="p-2.5 bg-emerald-50 border border-[#1B1929] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-[#1B1929]">Personal Treasury Bills (T-Bills)</span>
                  <span className="ml-2 font-mono-num text-[#059669] font-bold">
                    {state.macro.interestRate.toFixed(2)}% Yield
                  </span>
                </div>
                <span className="font-mono-num font-bold text-[#1B1929]">
                  Invested: {formatMoney(personal.tBillsBalance)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={personal.liquidCash < 10_000}
                  onClick={() => onAllocateTBills(10_000)}
                  className="pixel-btn px-2.5 py-1 bg-[#10B981] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                >
                  +$10K T-Bills
                </button>
                <button
                  type="button"
                  disabled={personal.liquidCash < 50_000}
                  onClick={() => onAllocateTBills(50_000)}
                  className="pixel-btn px-2.5 py-1 bg-[#10B981] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                >
                  +$50K T-Bills
                </button>
                <button
                  type="button"
                  disabled={personal.tBillsBalance < 10_000}
                  onClick={() => onAllocateTBills(-10_000)}
                  className="pixel-btn px-2.5 py-1 bg-white text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                >
                  -$10K Redeem
                </button>
                <button
                  type="button"
                  disabled={personal.tBillsBalance < 50_000}
                  onClick={() => onAllocateTBills(-50_000)}
                  className="pixel-btn px-2.5 py-1 bg-white text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                >
                  -$50K Redeem
                </button>
              </div>
            </div>

            {activeCompany && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
                <div className="text-xs">
                  <span className="font-bold">Secondary Share Liquidity ({activeCompany.name})</span>
                  <div className="text-[11px] text-[#5B5670]">
                    Sell 5% of your personal equity for immediate cash
                  </div>
                </div>
                <button
                  type="button"
                  disabled={activeCompany.playerShares / activeCompany.sharesTotal <= 0.1}
                  onClick={() => onSecondarySale(activeCompany.id, 5)}
                  className="pixel-btn px-3 py-1.5 bg-[#F59E0B] text-[#1B1929] font-pixel text-[11px] cursor-pointer"
                >
                  Sell 5% Stake
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lifestyle & Wellbeing */}
        <div className="lg:col-span-5 pixel-box p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="font-pixel text-sm text-[#1B1929]">LIFESTYLE + WELLBEING</h2>
            <div className="space-y-2">
              {(Object.keys(LIFESTYLE_COSTS) as LifestyleTier[]).map((tier) => {
                const info = LIFESTYLE_COSTS[tier];
                const active = personal.lifestyleTier === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => onSetLifestyle(tier)}
                    className={`w-full p-2.5 text-left border-2 border-[#1B1929] flex items-center justify-between cursor-pointer ${
                      active ? 'bg-[#EC4899] text-white' : 'bg-[#F6F1E4] hover:bg-white text-[#1B1929]'
                    }`}
                  >
                    <div>
                      <div className="font-pixel text-xs">{info.label}</div>
                      <div className="text-[11px] opacity-85">
                        Stress {info.stressDelta > 0 ? `+${info.stressDelta}` : info.stressDelta}/mo · +{info.repBonus} Rep
                      </div>
                    </div>
                    <span className="font-mono-num font-bold text-xs">{formatMoney(info.monthlyCost)}/mo</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={personal.liquidCash < 4500}
            onClick={onTakeVacation}
            className="pixel-btn w-full py-2.5 bg-[#10B981] text-[#1B1929] font-pixel text-xs cursor-pointer"
          >
            Take 1-Week Retreat ($4,500 · -28 Stress)
          </button>
        </div>
      </section>

      {/* Personal Assets & Real Estate */}
      <section className="pixel-box p-4 space-y-3">
        <h2 className="font-pixel text-sm text-[#1B1929]">REAL ESTATE + TROPHY ASSETS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PERSONAL_ASSETS_CATALOG.map((item) => {
            const owned = personal.assetsOwned.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-3 border-2 border-[#1B1929] flex flex-col justify-between gap-3 ${
                  owned ? 'bg-emerald-50' : 'bg-[#F6F1E4]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel text-xs text-[#1B1929]">{item.name}</span>
                    <span className="text-[11px] font-mono-num text-[#5B5670]">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-mono-num text-[#3B3459] mt-1.5">
                    Price {formatMoney(item.price)} · Upkeep {formatMoney(item.monthlyUpkeep)}/mo
                  </div>
                  <div className="text-[11px] text-[#5B5670] mt-0.5">
                    +{item.reputationBoost} Reputation · -{item.stressRelief} Stress
                  </div>
                </div>
                {owned ? (
                  <span className="font-pixel text-xs text-emerald-800">OWNED IN PORTFOLIO</span>
                ) : (
                  <button
                    type="button"
                    disabled={personal.liquidCash < item.price}
                    onClick={() => onBuyAsset(item.id)}
                    className="pixel-btn py-2 px-3 bg-[#2563EB] text-white font-pixel text-xs cursor-pointer"
                  >
                    Purchase ({formatMoney(item.price)})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
