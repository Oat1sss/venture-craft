import React, { useState } from 'react';
import { LifestyleTier, SimState } from '../../engine/types';
import { LIFESTYLE_COSTS, SIDE_HUSTLE_GIGS } from '../../engine/names';
import { computeJobAcceptanceOdds } from '../../engine/simulation';
import { formatMoney } from '../../utils/format';
import { MoneyBurst } from '../MoneyBurst';

interface CareerHustleViewProps {
  state: SimState;
  onApplyJob: (jobId: string) => void;
  onQuitJob: () => void;
  onDoGig: (gigId: string) => void;
  onStudy: (mode: 'FREE_LIBRARY' | 'ONLINE_COURSE') => void;
  onBorrowPersonal: (amount: number) => void;
  onRepayPersonal: (amount: number) => void;
  onLaunchStore: (name: string, tier: 'DROPSHIP' | 'BRANDED') => void;
  onSetLifestyle: (tier: LifestyleTier) => void;
  onGoToHq: () => void;
}

export const CareerHustleView: React.FC<CareerHustleViewProps> = ({
  state,
  onApplyJob,
  onQuitJob,
  onDoGig,
  onStudy,
  onBorrowPersonal,
  onRepayPersonal,
  onLaunchStore,
  onSetLifestyle,
  onGoToHq,
}) => {
  const [storeName, setStoreName] = useState('PixelGoods Shop');
  const { personal } = state;
  const currentRent = LIFESTYLE_COSTS[personal.lifestyleTier];
  const playerStores = state.companies.filter((c) => c.isPlayerOwned && c.status === 'ACTIVE');

  return (
    <div className="space-y-5">
      {/* Survival & Work Status Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative pixel-box p-3.5 bg-[#FFFDF7]">
          <MoneyBurst value={personal.liquidCash} />
          <div className="text-xs font-semibold text-[#5B5670]">Wallet Cash</div>
          <div
            className={`font-mono-num text-xl font-bold mt-1 ${
              personal.liquidCash < 300 ? 'text-rose-700' : 'text-[#059669]'
            }`}
          >
            {formatMoney(personal.liquidCash)}
          </div>
          <div className="text-xs font-mono-num text-[#3B3459] mt-1">
            Rent: <span className="font-bold">{formatMoney(currentRent.monthlyCost)}/mo</span> ({currentRent.label})
          </div>
        </div>

        <div className="pixel-box p-3.5 bg-[#FFFDF7]">
          <div className="text-xs font-semibold text-[#5B5670]">Personal Debt (18% APR)</div>
          <div
            className={`font-mono-num text-xl font-bold mt-1 ${
              personal.personalDebt > 0 ? 'text-rose-700' : 'text-[#1B1929]'
            }`}
          >
            {formatMoney(personal.personalDebt)}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <button
              type="button"
              disabled={personal.personalDebt + 300 > 12_000}
              onClick={() => onBorrowPersonal(300)}
              className="pixel-btn px-2 py-0.5 bg-[#F59E0B] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
            >
              Borrow $300
            </button>
            <button
              type="button"
              disabled={personal.personalDebt <= 0 || personal.liquidCash < 200}
              onClick={() => onRepayPersonal(200)}
              className="pixel-btn px-2 py-0.5 bg-[#10B981] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
            >
              Pay $200
            </button>
          </div>
        </div>

        <div className="pixel-box p-3.5 bg-[#FFFDF7]">
          <div className="text-xs font-semibold text-[#5B5670]">Employment Status</div>
          <div className="font-bold text-sm text-[#1B1929] mt-1 truncate">
            {personal.currentJob ? personal.currentJob.title : 'UNEMPLOYED'}
          </div>
          <div className="text-xs font-mono-num text-[#3B3459] mt-1">
            {personal.currentJob
              ? `${personal.currentJob.employer} · ${formatMoney(personal.currentJob.monthlyPay)}/mo`
              : `${personal.jobRejections} rejections · ${personal.gigsCompleted} gigs done`}
          </div>
        </div>

        <div className="pixel-box p-3.5 bg-[#FFFDF7]">
          <div className="text-xs font-semibold text-[#5B5670]">Energy + Skills</div>
          <div className="font-mono-num text-xl font-bold text-[#2563EB] mt-1">
            {personal.energy}/100 Energy
          </div>
          <div className="text-xs font-mono-num text-[#3B3459] mt-1">
            Skill <span className="font-bold">{personal.skillLevel}/100</span> · Stress {personal.stress}/100
          </div>
        </div>
      </section>

      {/* Live Job / Hustle Feedback Banner */}
      {personal.lastJobFeedback && (
        <div
          className={`pixel-box p-3 text-xs font-semibold flex items-center justify-between gap-3 ${
            personal.lastJobFeedback.startsWith('Rejected') || personal.lastJobFeedback.startsWith('Down to')
              ? 'bg-rose-50 text-rose-900'
              : 'bg-emerald-50 text-emerald-950'
          }`}
        >
          <span>{personal.lastJobFeedback}</span>
          {personal.currentJob && (
            <button
              type="button"
              onClick={onQuitJob}
              className="pixel-btn px-2.5 py-1 bg-white text-[#1B1929] font-pixel text-[10px] shrink-0 cursor-pointer"
            >
              Quit Day Job
            </button>
          )}
        </div>
      )}

      {/* Main Split: Job Board vs Freelance Gigs + Upskilling */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Job Board */}
        <section className="xl:col-span-6 pixel-box p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-pixel text-sm text-[#1B1929]">JOB BOARD + APPLICATIONS</h2>
              <p className="text-xs text-[#5B5670]">
                10 Energy per interview. Hiring odds depend on your Skill ({personal.skillLevel}), Rep ({personal.reputation}), and Macro Economy.
              </p>
            </div>
            <span className="font-mono-num text-[11px] font-bold text-[#5B5670] shrink-0">
              {personal.jobApplicationsSent} Applied
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {state.jobMarket.map((job) => {
              const oddsPct = Math.round(computeJobAcceptanceOdds(personal, job, state.macro) * 100);
              const isCurrent = personal.currentJob?.title === job.title;
              return (
                <div
                  key={job.id}
                  className={`p-2.5 border-2 border-[#1B1929] flex flex-wrap items-center justify-between gap-2 text-xs ${
                    isCurrent ? 'bg-emerald-50' : 'bg-[#F6F1E4]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[#1B1929]">
                      {job.title} {job.isRemote ? '· Remote' : '· On-site'}
                    </div>
                    <div className="font-mono-num text-[11px] text-[#3B3459] mt-0.5">
                      {job.employer} · <span className="font-bold text-emerald-700">{formatMoney(job.monthlyPay)}/mo</span> · Req Skill {job.skillRequired}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono-num text-[11px] font-bold px-1.5 py-0.5 border border-[#1B1929] ${
                        oddsPct >= 60 ? 'bg-emerald-100 text-emerald-900' : oddsPct >= 30 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {oddsPct}% Odds
                    </span>
                    <button
                      type="button"
                      disabled={personal.energy < 10 || isCurrent}
                      onClick={() => onApplyJob(job.id)}
                      className="pixel-btn px-2.5 py-1.5 bg-[#2563EB] text-white font-pixel text-[10px] cursor-pointer"
                    >
                      {isCurrent ? 'Current' : 'Apply'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Freelance, Odd Gigs + Upskilling */}
        <section className="xl:col-span-6 pixel-box p-4 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-sm text-[#1B1929]">FREELANCE + ODD GIGS</h2>
              <span className="text-[11px] font-mono-num text-[#5B5670]">Advance +1D to recover Energy</span>
            </div>
            <div className="space-y-2">
              {SIDE_HUSTLE_GIGS.map((gig) => {
                const lockedSkill = personal.skillLevel < gig.skillRequired;
                const lowEnergy = personal.energy < gig.energyCost;
                return (
                  <div
                    key={gig.id}
                    className="p-2.5 bg-[#F6F1E4] border-2 border-[#1B1929] flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#1B1929]">
                        {gig.title}{' '}
                        <span className="text-[10px] font-pixel px-1 py-0.5 bg-white border border-[#1B1929] ml-1">
                          {gig.category}
                        </span>
                      </div>
                      <div className="font-mono-num text-[11px] text-[#3B3459] mt-0.5">
                        <span className="font-bold text-emerald-700">+${gig.payoutCash}</span> · -{gig.energyCost} Energy · +{gig.skillGain} Skill
                        {gig.skillRequired > 0 ? ` · Req Skill ${gig.skillRequired}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={lockedSkill || lowEnergy}
                      onClick={() => onDoGig(gig.id)}
                      className="pixel-btn px-3 py-1.5 bg-[#10B981] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                    >
                      {lockedSkill ? `Need ${gig.skillRequired}` : 'Work Gig'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upskilling Courses */}
          <div className="pt-3 border-t-2 border-[#1B1929]/15 space-y-2">
            <h3 className="font-pixel text-xs text-[#1B1929]">UPSKILL + TRAINING</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={personal.energy < 16}
                onClick={() => onStudy('FREE_LIBRARY')}
                className="pixel-btn p-2.5 text-left bg-[#FDE68A] text-[#1B1929] cursor-pointer"
              >
                <div className="font-pixel text-[11px]">Library Self-Study ($0)</div>
                <div className="text-[11px] font-mono-num mt-0.5">-16 Energy · +4 Skill · +1 Net</div>
              </button>
              <button
                type="button"
                disabled={personal.liquidCash < 320 || personal.energy < 20}
                onClick={() => onStudy('ONLINE_COURSE')}
                className="pixel-btn p-2.5 text-left bg-[#7C3AED] text-white cursor-pointer"
              >
                <div className="font-pixel text-[11px]">Online Bootcamp ($320)</div>
                <div className="text-[11px] font-mono-num mt-0.5">-20 Energy · +10 Skill · +3 Rep</div>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Split: Bootstrap Micro Online Store + Housing Tier */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <section className="xl:col-span-6 pixel-box p-4 space-y-3 bg-sky-50">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-pixel text-sm text-[#1B1929]">START AN ONLINE STORE (SOLO)</h2>
              <p className="text-xs text-[#5B5670]">
                Bootstrap an e-commerce store on a shoestring budget ($45/mo hosting, 0 staff) and grow into a real company.
              </p>
            </div>
            {playerStores.length > 0 && (
              <button
                type="button"
                onClick={onGoToHq}
                className="pixel-btn px-2.5 py-1.5 bg-[#2563EB] text-white font-pixel text-[10px] shrink-0 cursor-pointer"
              >
                Open Store HQ
              </button>
            )}
          </div>

          <div>
            <label htmlFor="micro-store-name" className="block text-xs font-semibold text-[#3B3459] mb-1">
              Storefront Name
            </label>
            <input
              id="micro-store-name"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. CozyPixel Merch"
              className="w-full px-3 py-2 text-xs bg-white border-2 border-[#1B1929]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!storeName.trim() || personal.liquidCash < 450}
              onClick={() => onLaunchStore(storeName, 'DROPSHIP')}
              className="pixel-btn p-3 text-left bg-[#F59E0B] text-[#1B1929] cursor-pointer"
            >
              <div className="font-pixel text-xs">Dropship Store ($450)</div>
              <div className="text-[11px] mt-1">
                $320 store cash · ~$280/mo starting sales · $45/mo hosting
              </div>
            </button>
            <button
              type="button"
              disabled={!storeName.trim() || personal.liquidCash < 2_400}
              onClick={() => onLaunchStore(storeName, 'BRANDED')}
              className="pixel-btn p-3 text-left bg-[#10B981] text-[#1B1929] cursor-pointer"
            >
              <div className="font-pixel text-xs">Branded DTC Shop ($2,400)</div>
              <div className="text-[11px] mt-1">
                $1,900 store cash · ~$1,150/mo sales · Higher margins
              </div>
            </button>
          </div>
        </section>

        <section className="xl:col-span-6 pixel-box p-4 space-y-3">
          <h2 className="font-pixel text-sm text-[#1B1929]">HOUSING + COST OF LIVING</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(LIFESTYLE_COSTS) as LifestyleTier[]).map((tier) => {
              const info = LIFESTYLE_COSTS[tier];
              const active = personal.lifestyleTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onSetLifestyle(tier)}
                  className={`p-2.5 text-left border-2 border-[#1B1929] flex items-center justify-between cursor-pointer ${
                    active ? 'bg-[#EC4899] text-white' : 'bg-[#F6F1E4] hover:bg-white text-[#1B1929]'
                  }`}
                >
                  <div>
                    <div className="font-pixel text-[11px]">{info.label}</div>
                    <div className="text-[11px] opacity-85">
                      Stress {info.stressDelta > 0 ? `+${info.stressDelta}` : info.stressDelta}/mo
                    </div>
                  </div>
                  <span className="font-mono-num font-bold text-xs">{formatMoney(info.monthlyCost)}/mo</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
