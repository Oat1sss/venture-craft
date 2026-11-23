import React, { useState } from 'react';
import { Company, FundStrategy, SimState, VentureSector } from '../../engine/types';
import { SECTOR_LABELS } from '../../engine/names';
import { computeFundNav } from '../../engine/simulation';
import { formatMoney } from '../../utils/format';
import { MoneyBurst } from '../MoneyBurst';

interface FundingVcViewProps {
  state: SimState;
  activeCompany: Company | null;
  onAcceptOffer: (offerId: string) => void;
  onRejectOffer: (offerId: string) => void;
  onRequestRound: (coId: string) => void;
  onTakePublic: (coId: string) => void;
  onFoundFund: (name: string, strategy: FundStrategy, gpCommit: number) => void;
  onFundInvest: (fundId: string, coId: string, checkSize: number) => void;
  onFundExit: (fundId: string, idx: number) => void;
  onFundRaiseLp: (fundId: string, amount: number) => void;
  onFundLeverage: (fundId: string, delta: number) => void;
  onFundUpdateTerms: (
    fundId: string,
    updates: { managementFeePct?: number; carryPct?: number; hurdleRatePct?: number; sectorFocus?: VentureSector | 'ALL' }
  ) => void;
  onFundTBills: (fundId: string, delta: number) => void;
  onFundBuyPublic: (fundId: string, coId: string, usd: number) => void;
  onFundDistribute: (fundId: string, amount: number) => void;
  onFundActivist: (fundId: string, idx: number, action: 'CUT_BURN' | 'GROWTH_MANDATE') => void;
}

export const FundingVcView: React.FC<FundingVcViewProps> = ({
  state,
  activeCompany,
  onAcceptOffer,
  onRejectOffer,
  onRequestRound,
  onTakePublic,
  onFoundFund,
  onFundInvest,
  onFundExit,
  onFundRaiseLp,
  onFundLeverage,
  onFundUpdateTerms,
  onFundTBills,
  onFundBuyPublic,
  onFundDistribute,
  onFundActivist,
}) => {
  const [fundName, setFundName] = useState('');
  const [strategy, setStrategy] = useState<FundStrategy>('EARLY_VC');
  const [gpCommit, setGpCommit] = useState(100_000);
  const [selectedFundId, setSelectedFundId] = useState<string>(state.playerFunds[0]?.id ?? '');
  const [checkSize, setCheckSize] = useState(250_000);

  const activeFund =
    state.playerFunds.find((f) => f.id === selectedFundId) ?? state.playerFunds[0] ?? null;

  const dealFlowCompanies = state.companies.filter(
    (c) => !c.isPlayerOwned && c.status === 'ACTIVE'
  );

  const handleCreateFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundName.trim() || state.personal.liquidCash < gpCommit) return;
    onFoundFund(fundName, strategy, gpCommit);
    setFundName('');
  };

  return (
    <div className="space-y-5">
      {/* Startup Fundraising & IPO Section */}
      {activeCompany && (
        <section className="pixel-box p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1B1929]/15 pb-3">
            <div>
              <h2 className="font-pixel text-sm text-[#1B1929]">
                RAISING CAPITAL FOR {activeCompany.name.toUpperCase()}
              </h2>
              <p className="text-xs text-[#5B5670]">
                Stage: {activeCompany.stage.replace('_', ' ')} · Valuation {formatMoney(activeCompany.valuation)} · IPO unlocks at $15M valuation
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!activeCompany.isPublic && (
                <>
                  <button
                    type="button"
                    onClick={() => onRequestRound(activeCompany.id)}
                    className="pixel-btn px-3 py-2 bg-[#F59E0B] text-[#1B1929] font-pixel text-xs cursor-pointer"
                  >
                    Pitch VCs
                  </button>
                  <button
                    type="button"
                    disabled={activeCompany.valuation < 15_000_000}
                    onClick={() => onTakePublic(activeCompany.id)}
                    className="pixel-btn px-3 py-2 bg-[#10B981] text-[#1B1929] font-pixel text-xs cursor-pointer"
                  >
                    Launch IPO
                  </button>
                </>
              )}
              {activeCompany.isPublic && (
                <span className="font-pixel text-xs px-3 py-1.5 bg-emerald-100 border-2 border-[#1B1929] text-emerald-900">
                  PUBLICLY TRADED ({activeCompany.ticker})
                </span>
              )}
            </div>
          </div>

          {state.vcOffers.length === 0 ? (
            <p className="text-xs text-[#5B5670]">
              No active term sheets on the table. Click &ldquo;Pitch VCs&rdquo; or delegate to a hired CFO.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.vcOffers.map((offer) => {
                const targetCo = state.companies.find((c) => c.id === offer.companyId);
                return (
                  <div
                    key={offer.id}
                    className="p-3.5 bg-[#F6F1E4] border-2 border-[#1B1929] flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-pixel text-xs text-[#1B1929]">{offer.roundName}</span>
                        <span className="font-mono-num text-[11px] text-[#5B5670]">
                          Exp Day {offer.expiryDay}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#2563EB] mt-0.5">
                        {offer.firmName} {targetCo ? `→ ${targetCo.name}` : ''}
                      </div>
                      <div className="mt-2 space-y-1 text-xs font-mono-num">
                        <div>Investment: <span className="font-bold text-emerald-700">{formatMoney(offer.amount)}</span></div>
                        <div>Pre-Money: <span className="font-bold">{formatMoney(offer.preMoneyValuation)}</span></div>
                        <div>Dilution: <span className="font-bold text-rose-700">{offer.equityPercent}%</span> {offer.boardSeat ? '· +Board Seat' : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onAcceptOffer(offer.id)}
                        className="pixel-btn flex-1 py-1.5 bg-[#10B981] text-[#1B1929] font-pixel text-[11px] cursor-pointer"
                      >
                        Sign Term Sheet
                      </button>
                      <button
                        type="button"
                        onClick={() => onRejectOffer(offer.id)}
                        className="pixel-btn px-2.5 py-1.5 bg-white text-[#1B1929] font-pixel text-[11px] cursor-pointer"
                      >
                        Pass
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Become a VC / Fund Manager Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Found New Fund */}
        <section className="xl:col-span-4 pixel-box p-4 space-y-3">
          <h2 className="font-pixel text-sm text-[#1B1929]">START YOUR OWN VC / FUND</h2>
          <p className="text-xs text-[#5B5670]">
            Commit personal GP capital to raise 3x–10x LP commitments, earn 2% management fees, and collect 20% carry on exits.
          </p>
          <form onSubmit={handleCreateFund} className="space-y-3">
            <div>
              <label htmlFor="fund-name" className="block text-xs font-semibold text-[#3B3459] mb-1">
                Fund Name
              </label>
              <input
                id="fund-name"
                type="text"
                placeholder="e.g. Pixel Horizon Fund I"
                value={fundName}
                onChange={(e) => setFundName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F6F1E4] border-2 border-[#1B1929]"
                required
              />
            </div>
            <div>
              <label htmlFor="fund-strategy" className="block text-xs font-semibold text-[#3B3459] mb-1">
                Mandate
              </label>
              <select
                id="fund-strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as FundStrategy)}
                className="w-full px-3 py-2 text-xs bg-[#F6F1E4] border-2 border-[#1B1929]"
              >
                <option value="EARLY_VC">Early-Stage VC</option>
                <option value="GROWTH_EQUITY">Growth Equity</option>
                <option value="HEDGE_QUANT">Quant Hedge Fund</option>
                <option value="CRYPTO_FUND">Crypto Venture Fund</option>
              </select>
            </div>
            <div>
              <label htmlFor="gp-commit" className="block text-xs font-semibold text-[#3B3459] mb-1">
                Your GP Commit ($)
              </label>
              <input
                id="gp-commit"
                type="number"
                min={50000}
                step={25000}
                value={gpCommit}
                onChange={(e) => setGpCommit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono-num bg-[#F6F1E4] border-2 border-[#1B1929]"
              />
            </div>
            <button
              type="submit"
              disabled={!fundName.trim() || state.personal.liquidCash < gpCommit}
              className="pixel-btn w-full py-2.5 bg-[#7C3AED] text-white font-pixel text-xs cursor-pointer"
            >
              Launch Fund ({formatMoney(gpCommit)} GP)
            </button>
          </form>
        </section>

        {/* Active Fund Portfolio & Deal Flow */}
        <section className="xl:col-span-8 pixel-box p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-pixel text-sm text-[#1B1929]">FUND DEPLOYMENT + DEAL FLOW</h2>
            {state.playerFunds.length > 0 && (
              <select
                aria-label="Select managed fund"
                value={activeFund?.id ?? ''}
                onChange={(e) => setSelectedFundId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#F6F1E4] border-2 border-[#1B1929]"
              >
                {state.playerFunds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({formatMoney(f.cashAvailable)} dry powder)
                  </option>
                ))}
              </select>
            )}
          </div>

          {!activeFund ? (
            <p className="text-xs text-[#5B5670]">
              You don&apos;t manage an investment fund yet. Launch one on the left to start deploying LP capital into world startups.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="relative p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
                  <MoneyBurst value={activeFund.cashAvailable} />
                  <div className="text-[#5B5670]">Dry Powder</div>
                  <div className="font-mono-num font-bold text-sm text-[#059669]">
                    {formatMoney(activeFund.cashAvailable)}
                  </div>
                </div>
                <div className="p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
                  <div className="text-[#5B5670]">Fund NAV</div>
                  <div className="font-mono-num font-bold text-sm text-[#2563EB]">
                    {formatMoney(computeFundNav(activeFund, state.companies))}
                  </div>
                </div>
                <div className="p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
                  <div className="text-[#5B5670]">T-Bills / Leverage</div>
                  <div className="font-mono-num font-bold text-sm">
                    {formatMoney(activeFund.tBillsAllocated)} / {formatMoney(activeFund.debtBorrowed)}
                  </div>
                </div>
                <div className="p-2.5 bg-[#F6F1E4] border border-[#1B1929]">
                  <div className="text-[#5B5670]">Profits / Dist.</div>
                  <div className="font-mono-num font-bold text-sm text-[#7C3AED]">
                    {formatMoney(activeFund.realizedProfits)}
                  </div>
                </div>
              </div>

              {/* Deep Fund Governance, Capital Raise, Leverage & Terms Controls */}
              <div className="p-3 bg-amber-50 border-2 border-[#1B1929] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-pixel text-xs text-[#1B1929]">FUND GOVERNANCE + CAPITAL CONTROLS</span>
                  <span className="font-mono-num text-[11px] text-[#3B3459]">
                    {activeFund.managementFeePct.toFixed(1)}% Mgmt · {activeFund.carryPct}% Carry · {activeFund.hurdleRatePct}% Hurdle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label htmlFor="fund-focus" className="block text-[11px] font-semibold text-[#5B5670] mb-0.5">
                      Sector Mandate
                    </label>
                    <select
                      id="fund-focus"
                      value={activeFund.sectorFocus}
                      onChange={(e) =>
                        onFundUpdateTerms(activeFund.id, { sectorFocus: e.target.value as VentureSector | 'ALL' })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#1B1929]"
                    >
                      <option value="ALL">All Sectors (Generalist)</option>
                      {(Object.keys(SECTOR_LABELS) as VentureSector[]).map((sec) => (
                        <option key={sec} value={sec}>
                          {SECTOR_LABELS[sec]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fund-mgmt-fee" className="block text-[11px] font-semibold text-[#5B5670] mb-0.5">
                      Mgmt Fee %
                    </label>
                    <input
                      id="fund-mgmt-fee"
                      type="number"
                      min={0.5}
                      max={4}
                      step={0.5}
                      value={activeFund.managementFeePct}
                      onChange={(e) =>
                        onFundUpdateTerms(activeFund.id, { managementFeePct: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#1B1929] font-mono-num"
                    />
                  </div>
                  <div>
                    <label htmlFor="fund-carry" className="block text-[11px] font-semibold text-[#5B5670] mb-0.5">
                      GP Carry %
                    </label>
                    <input
                      id="fund-carry"
                      type="number"
                      min={10}
                      max={35}
                      step={5}
                      value={activeFund.carryPct}
                      onChange={(e) =>
                        onFundUpdateTerms(activeFund.id, { carryPct: Number(e.target.value) })
                      }
                      className="w-full px-2 py-1 bg-white border border-[#1B1929] font-mono-num"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onFundRaiseLp(activeFund.id, 1_000_000)}
                    className="pixel-btn px-2.5 py-1 bg-[#10B981] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                  >
                    +Raise $1M LP
                  </button>
                  <button
                    type="button"
                    onClick={() => onFundLeverage(activeFund.id, 500_000)}
                    className="pixel-btn px-2.5 py-1 bg-[#F59E0B] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                  >
                    +Borrow $500K Credit
                  </button>
                  <button
                    type="button"
                    disabled={activeFund.debtBorrowed <= 0 || activeFund.cashAvailable < 250_000}
                    onClick={() => onFundLeverage(activeFund.id, -250_000)}
                    className="pixel-btn px-2.5 py-1 bg-white text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                  >
                    Repay $250K
                  </button>
                  <button
                    type="button"
                    disabled={activeFund.cashAvailable < 500_000}
                    onClick={() => onFundTBills(activeFund.id, 500_000)}
                    className="pixel-btn px-2.5 py-1 bg-[#2563EB] text-white font-pixel text-[10px] cursor-pointer"
                  >
                    +$500K T-Bills
                  </button>
                  <button
                    type="button"
                    disabled={activeFund.tBillsAllocated < 500_000}
                    onClick={() => onFundTBills(activeFund.id, -500_000)}
                    className="pixel-btn px-2.5 py-1 bg-white text-[#1B1929] font-pixel text-[10px] cursor-pointer"
                  >
                    Redeem T-Bills
                  </button>
                  <button
                    type="button"
                    disabled={activeFund.cashAvailable < 500_000}
                    onClick={() => onFundDistribute(activeFund.id, 500_000)}
                    className="pixel-btn px-2.5 py-1 bg-[#7C3AED] text-white font-pixel text-[10px] cursor-pointer"
                  >
                    Distribute $500K (+Carry)
                  </button>
                </div>
              </div>

              {/* Portfolio Holdings + Activist Board Directives */}
              {activeFund.portfolio.length > 0 && (
                <div>
                  <h3 className="font-pixel text-xs text-[#1B1929] mb-2">PORTFOLIO HOLDINGS + BOARD CONTROL</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {activeFund.portfolio.map((inv, idx) => {
                      const current = state.companies.find((c) => c.id === inv.companyId);
                      const curVal = current ? Math.round(current.valuation * (inv.equityPercent / 100)) : 0;
                      const moic = inv.costBasis > 0 ? (curVal / inv.costBasis).toFixed(2) : '0.00';
                      return (
                        <div
                          key={`${inv.companyId}_${idx}`}
                          className="p-2 bg-emerald-50 border border-[#1B1929] flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-bold">{inv.companyName}</span> · {inv.equityPercent}% stake
                            <span className="ml-2 font-mono-num text-[#3B3459]">
                              Cost {formatMoney(inv.costBasis)} → Val {formatMoney(curVal)} ({moic}x)
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {inv.equityPercent >= 15 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onFundActivist(activeFund.id, idx, 'CUT_BURN')}
                                  className="pixel-btn px-2 py-1 bg-[#FDE68A] text-[10px] font-pixel cursor-pointer"
                                >
                                  Cut Burn 15%
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onFundActivist(activeFund.id, idx, 'GROWTH_MANDATE')}
                                  className="pixel-btn px-2 py-1 bg-[#2563EB] text-white text-[10px] font-pixel cursor-pointer"
                                >
                                  Growth Mandate
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => onFundExit(activeFund.id, idx)}
                              className="pixel-btn px-2.5 py-1 bg-white text-[11px] font-pixel cursor-pointer"
                            >
                              Exit Stake
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Public Equities Deployment inside Fund */}
              <div className="p-2.5 bg-[#F6F1E4] border border-[#1B1929] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-pixel text-[11px] text-[#1B1929]">PUBLIC EQUITIES ALLOCATION ({activeFund.publicHoldings.length} positions)</span>
                  <span className="font-mono-num text-[11px] text-[#5B5670]">Deploy $250K per ticket</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {state.companies
                    .filter((c) => c.isPublic && c.status === 'ACTIVE')
                    .slice(0, 5)
                    .map((pub) => (
                      <button
                        key={pub.id}
                        type="button"
                        disabled={activeFund.cashAvailable < 250_000}
                        onClick={() => onFundBuyPublic(activeFund.id, pub.id, 250_000)}
                        className="pixel-btn px-2 py-1 bg-white text-[#1B1929] font-mono-num text-[11px] font-bold cursor-pointer"
                      >
                        Buy {pub.ticker} (${pub.pricePerShare.toFixed(2)})
                      </button>
                    ))}
                </div>
              </div>

              {/* Investable Deal Flow */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-pixel text-xs text-[#1B1929]">WORLD DEAL FLOW</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <label htmlFor="check-size" className="text-[#5B5670]">Check Size:</label>
                    <select
                      id="check-size"
                      value={checkSize}
                      onChange={(e) => setCheckSize(Number(e.target.value))}
                      className="px-2 py-1 bg-[#F6F1E4] border border-[#1B1929] font-mono-num"
                    >
                      <option value={100000}>$100K</option>
                      <option value={250000}>$250K</option>
                      <option value={500000}>$500K</option>
                      <option value={1000000}>$1.0M</option>
                      <option value={2500000}>$2.5M</option>
                    </select>
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {dealFlowCompanies.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-[#F6F1E4] border border-[#1B1929] flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1B1929]">{c.name}</span>{' '}
                        <span className="text-[#5B5670]">
                          · {SECTOR_LABELS[c.sector]} · {c.stage.replace('_', ' ')}
                        </span>
                        <div className="font-mono-num text-[11px] text-[#3B3459]">
                          Val {formatMoney(c.valuation)} · Rev {formatMoney(c.monthlyRevenue)}/mo · Growth +{(c.growthRate * 100).toFixed(1)}%
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={activeFund.cashAvailable < checkSize}
                        onClick={() => onFundInvest(activeFund.id, c.id, checkSize)}
                        className="pixel-btn px-3 py-1.5 bg-[#F59E0B] text-[#1B1929] font-pixel text-[11px] whitespace-nowrap cursor-pointer"
                      >
                        Invest {formatMoney(checkSize)}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
