import React from 'react';
import {
  Company,
  DepartmentRole,
  PricingTier,
  SimState,
  StrategicVision,
} from '../../engine/types';
import { SECTOR_LABELS } from '../../engine/names';
import { formatMoney } from '../../utils/format';
import { PixelOfficeCanvas } from '../PixelOfficeCanvas';
import { PixelSparkline } from '../PixelCharts';
import { MoneyBurst } from '../MoneyBurst';

interface HqOpsViewProps {
  state: SimState;
  activeCompany: Company | null;
  onSetVision: (coId: string, v: StrategicVision) => void;
  onHireHead: (coId: string, role: DepartmentRole) => void;
  onToggleDelegate: (coId: string, role: DepartmentRole) => void;
  onStartSprint: (coId: string, featId: string) => void;
  onSetPricing: (coId: string, tier: PricingTier) => void;
  onSetMarketing: (coId: string, budget: number) => void;
  onSetExchangeFee: (coId: string, bps: number) => void;
  onAddFactoryLine: (coId: string) => void;
  onSetUtilization: (coId: string, pct: number) => void;
  onSignContract: (coId: string) => void;
  onTakeLoan: (coId: string, amount: number) => void;
  onRepayLoan: (coId: string, amount: number) => void;
  onAllocateCompanyTBills: (coId: string, delta: number) => void;
  onAcquireTarget: (parentCoId: string, targetCoId: string) => void;
  onGoToTab: (tab: 'TEAM' | 'FUNDING' | 'CAREER') => void;
}

const VISION_OPTIONS: { id: StrategicVision; label: string; desc: string }[] = [
  { id: 'BALANCED', label: 'Balanced Scale', desc: 'Steady product & sustainable growth' },
  { id: 'HYPERGROWTH', label: 'Hypergrowth', desc: 'Aggressive user & market share push' },
  { id: 'PROFITABILITY', label: 'Profitability', desc: 'Protect runway & trim burn rate' },
  { id: 'RND_MOAT', label: 'R&D Moat', desc: '+35% feature & quality velocity' },
];

export const HqOpsView: React.FC<HqOpsViewProps> = ({
  state,
  activeCompany,
  onSetVision,
  onHireHead,
  onToggleDelegate,
  onStartSprint,
  onSetPricing,
  onSetMarketing,
  onSetExchangeFee,
  onAddFactoryLine,
  onSetUtilization,
  onSignContract,
  onTakeLoan,
  onRepayLoan,
  onAllocateCompanyTBills,
  onAcquireTarget,
  onGoToTab,
}) => {
  if (!activeCompany) {
    return (
      <div className="pixel-box p-6 space-y-4">
        <h2 className="font-pixel text-lg text-[#1B1929]">NO ACTIVE OPERATING COMPANY</h2>
        <p className="text-sm text-[#3B3459] max-w-xl">
          You don&apos;t run a company yet. Work your day job, take freelance gigs, start a $450 micro online store in Jobs + Hustle, or launch a funded venture when ready.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onGoToTab('CAREER')}
            className="pixel-btn px-4 py-2.5 bg-[#14B8A6] text-[#1B1929] font-pixel text-xs cursor-pointer"
          >
            Go to Jobs + Hustle ($450 Store)
          </button>
          <button
            type="button"
            onClick={() => onGoToTab('TEAM')}
            className="pixel-btn px-4 py-2.5 bg-[#10B981] text-[#1B1929] font-pixel text-xs cursor-pointer"
          >
            Launch a Funded Startup
          </button>
          <button
            type="button"
            onClick={() => onGoToTab('FUNDING')}
            className="pixel-btn px-4 py-2.5 bg-[#F59E0B] text-[#1B1929] font-pixel text-xs cursor-pointer"
          >
            Manage VC Funds
          </button>
        </div>
      </div>
    );
  }

  const netMonthly = activeCompany.monthlyRevenue - activeCompany.monthlyExpenses;
  const runway =
    netMonthly >= 0 ? 'Cashflow Positive' : `${Math.max(0, Math.floor(activeCompany.cash / Math.abs(netMonthly)))} mo`;
  const hiredHeadsCount = Object.values(activeCompany.departmentHeads).filter((d) => d.hired).length;

  return (
    <div className="space-y-5">
      {/* Top KPI Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative pixel-box p-3.5 bg-[#FFFDF7]">
          <MoneyBurst value={activeCompany.cash} />
          <div className="text-xs font-semibold text-[#5B5670]">Company Treasury</div>
          <div className="font-mono-num text-xl font-bold text-[#059669] mt-1">
            {formatMoney(activeCompany.cash)}
          </div>
          <div className="text-xs font-mono-num text-[#3B3459] mt-1">
            Runway: <span className="font-bold">{runway}</span>
          </div>
        </div>

        <div className="pixel-box p-3.5 bg-[#FFFDF7]">
          <div className="text-xs font-semibold text-[#5B5670]">Monthly Rev / Burn</div>
          <div className="font-mono-num text-xl font-bold text-[#1B1929] mt-1">
            {formatMoney(activeCompany.monthlyRevenue)}
          </div>
          <div className={`text-xs font-mono-num mt-1 font-semibold ${netMonthly >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            Net: {netMonthly >= 0 ? '+' : ''}{formatMoney(netMonthly)}/mo
          </div>
        </div>

        <div className="pixel-box p-3.5 bg-[#FFFDF7]">
          <div className="text-xs font-semibold text-[#5B5670]">Users &amp; Product</div>
          <div className="font-mono-num text-xl font-bold text-[#2563EB] mt-1">
            {activeCompany.users.toLocaleString()}
          </div>
          <div className="text-xs font-mono-num text-[#3B3459] mt-1">
            Quality {activeCompany.productQuality}/100 · +{(activeCompany.growthRate * 100).toFixed(1)}%/mo
          </div>
        </div>

        <div className="pixel-box p-3.5 bg-[#FFFDF7] flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-[#5B5670]">Valuation</div>
            <div className="font-mono-num text-xl font-bold text-[#7C3AED] mt-1">
              {formatMoney(activeCompany.valuation)}
            </div>
            <div className="text-xs text-[#3B3459] mt-1">
              {SECTOR_LABELS[activeCompany.sector]} · {activeCompany.stage.replace('_', ' ')}
            </div>
          </div>
          <PixelSparkline values={activeCompany.valuationHistory} color="auto" width={82} height={42} />
        </div>
      </section>

      {/* Main Split: Pixel Office Floor + Strategic Vision & Delegation */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Live Pixel Office Canvas */}
        <section className="xl:col-span-7 pixel-box p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-pixel text-sm text-[#1B1929]">
                {activeCompany.name} HQ FLOOR
              </h2>
              <p className="text-xs text-[#5B5670]">
                {activeCompany.employees.length} staff · {hiredHeadsCount}/4 Dept Heads · Security {activeCompany.securityLevel}/100
              </p>
            </div>
            <span className="font-mono-num text-xs font-bold px-2 py-1 bg-[#F6F1E4] border-2 border-[#1B1929] whitespace-nowrap shrink-0">
              {activeCompany.ticker} · ${activeCompany.pricePerShare.toFixed(2)}/sh
            </span>
          </div>

          <div className="w-full aspect-[280/128] border-2 border-[#1B1929] overflow-hidden bg-[#1B1929]">
            <PixelOfficeCanvas
              mode="OFFICE_FLOOR"
              sector={activeCompany.sector}
              employees={activeCompany.employees}
              macroRegime={state.macro.regime}
              hasDeptHeads={hiredHeadsCount}
              factoryLines={activeCompany.manufacturing?.factoryLines}
              cashValue={activeCompany.cash}
            />
          </div>

          {/* Strategic Vision Selector */}
          <div className="pt-1">
            <div className="text-xs font-pixel text-[#1B1929] mb-2">COMPANY STRATEGIC VISION</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {VISION_OPTIONS.map((v) => {
                const active = activeCompany.vision === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSetVision(activeCompany.id, v.id)}
                    className={`p-2 text-left border-2 border-[#1B1929] cursor-pointer transition-colors ${
                      active ? 'bg-[#F59E0B] text-[#1B1929]' : 'bg-[#F6F1E4] hover:bg-white text-[#1B1929]'
                    }`}
                  >
                    <div className="font-pixel text-[11px]">{v.label}</div>
                    <div className="text-[11px] opacity-85 mt-0.5 leading-tight">{v.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Automated Department Heads (Delegate vs Micromanage) */}
        <section className="xl:col-span-5 pixel-box p-4 flex flex-col gap-3">
          <div>
            <h2 className="font-pixel text-sm text-[#1B1929]">DEPARTMENT HEADS</h2>
            <p className="text-xs text-[#5B5670]">
              Hire executives to automate sprints, marketing, hiring &amp; VC sourcing—or switch any role to Manual.
            </p>
          </div>

          <div className="space-y-2.5">
            {(Object.keys(activeCompany.departmentHeads) as DepartmentRole[]).map((role) => {
              const head = activeCompany.departmentHeads[role];
              const roleDesc =
                role === 'CTO'
                  ? 'Auto-queues features'
                  : role === 'CMO'
                  ? 'Tunes ad spend by vision'
                  : role === 'CFO'
                  ? 'Cuts burn 12% & sources VCs'
                  : 'Auto-hires key talent';

              return (
                <div
                  key={role}
                  className="p-2.5 bg-[#F6F1E4] border-2 border-[#1B1929] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs px-1.5 py-0.5 bg-[#1B1929] text-white">
                        {role}
                      </span>
                      <span className="font-bold text-xs text-[#1B1929] truncate">
                        {head.hired ? head.name : 'Vacant Seat'}
                      </span>
                      {head.hired && (
                        <span className="font-mono-num text-[11px] text-[#5B5670]">
                          Skill {head.skill}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#3B3459] mt-1">
                      {roleDesc} · {formatMoney(head.salary)}/mo
                    </div>
                  </div>

                  {!head.hired ? (
                    <button
                      type="button"
                      disabled={activeCompany.cash < head.salary * 2}
                      onClick={() => onHireHead(activeCompany.id, role)}
                      className="pixel-btn px-2.5 py-1.5 bg-[#10B981] text-[#1B1929] font-pixel text-[11px] whitespace-nowrap cursor-pointer"
                    >
                      Hire ({formatMoney(head.salary)})
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleDelegate(activeCompany.id, role)}
                      className={`pixel-btn px-2.5 py-1.5 font-pixel text-[11px] whitespace-nowrap cursor-pointer ${
                        head.delegated
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-[#FDE68A] text-[#1B1929]'
                      }`}
                    >
                      {head.delegated ? 'Auto-Delegate' : 'Manual Mode'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Split: Product Roadmap Sprints + Pricing & Growth Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Product Feature Sprints */}
        <section className="lg:col-span-7 pixel-box p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-sm text-[#1B1929]">PRODUCT DEVELOPMENT ROADMAP</h2>
            <span className="text-xs font-mono-num text-[#5B5670]">
              {activeCompany.features.filter((f) => f.completed).length}/{activeCompany.features.length} Shipped
            </span>
          </div>
          <div className="space-y-2.5">
            {activeCompany.features.map((feat) => {
              const pct = Math.min(100, Math.round((feat.progress / feat.maxProgress) * 100));
              const isActive = activeCompany.activeFeatureId === feat.id;
              return (
                <div
                  key={feat.id}
                  className={`p-3 border-2 border-[#1B1929] ${
                    feat.completed ? 'bg-emerald-50' : isActive ? 'bg-sky-50' : 'bg-[#F6F1E4]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-[#1B1929]">{feat.name}</span>
                      <span className="text-[11px] text-[#5B5670] ml-2">
                        {feat.category} · +{feat.qualityBoost} Quality · +{(feat.growthBoost * 100).toFixed(0)}% Growth
                      </span>
                    </div>
                    {feat.completed ? (
                      <span className="font-pixel text-[11px] text-emerald-800">SHIPPED</span>
                    ) : isActive ? (
                      <span className="font-pixel text-[11px] text-[#2563EB]">IN SPRINT</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartSprint(activeCompany.id, feat.id)}
                        className="pixel-btn px-2.5 py-1 bg-[#2563EB] text-white font-pixel text-[10px] cursor-pointer"
                      >
                        Build
                      </button>
                    )}
                  </div>
                  <div className="mt-2 h-3 bg-white border border-[#1B1929] overflow-hidden">
                    <div
                      className={`h-full ${feat.completed ? 'bg-[#10B981]' : 'bg-[#2563EB]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing, Marketing & Exchange Operations */}
        <section className="lg:col-span-5 pixel-box p-4 space-y-4">
          <h2 className="font-pixel text-sm text-[#1B1929]">MONETIZATION + GROWTH</h2>

          <div>
            <div className="text-xs font-semibold text-[#3B3459] mb-1.5">Pricing Strategy</div>
            <div className="grid grid-cols-3 gap-2">
              {(['FREEMIUM', 'STANDARD', 'ENTERPRISE'] as PricingTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onSetPricing(activeCompany.id, tier)}
                  className={`py-2 px-2 text-xs font-pixel border-2 border-[#1B1929] cursor-pointer ${
                    activeCompany.pricingTier === tier
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-[#F6F1E4] hover:bg-white text-[#1B1929]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="mkt-budget" className="font-semibold text-[#3B3459]">
                Monthly Marketing Spend
              </label>
              <span className="font-mono-num font-bold text-[#1B1929]">
                {formatMoney(activeCompany.marketingBudget)}/mo
              </span>
            </div>
            <input
              id="mkt-budget"
              type="range"
              min={0}
              max={Math.max(2_500, Math.round(activeCompany.cash * 0.25))}
              step={activeCompany.cash < 10_000 ? 50 : 500}
              value={activeCompany.marketingBudget}
              onChange={(e) => onSetMarketing(activeCompany.id, Number(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
          </div>

          {activeCompany.sector === 'CRYPTO_EXCHANGE' && (
            <div className="p-3 bg-amber-50 border-2 border-[#1B1929] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-xs text-[#1B1929]">EXCHANGE DESK</span>
                <span className="font-mono-num text-xs font-bold text-amber-900">
                  Vol: {formatMoney(activeCompany.dailyVolume ?? 0)}/day
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="fee-bps" className="font-semibold text-[#3B3459]">
                  Trading Fee (bps)
                </label>
                <span className="font-mono-num font-bold">
                  {activeCompany.exchangeFeeBps ?? 25} bps ({(((activeCompany.exchangeFeeBps ?? 25) / 100)).toFixed(2)}%)
                </span>
              </div>
              <input
                id="fee-bps"
                type="range"
                min={5}
                max={100}
                step={5}
                value={activeCompany.exchangeFeeBps ?? 25}
                onChange={(e) => onSetExchangeFee(activeCompany.id, Number(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
            </div>
          )}

          {/* Corporate Banking: Debt Facility & High-Yield T-Bills */}
          <div className="p-3 bg-[#F6F1E4] border-2 border-[#1B1929] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-[#1B1929]">CORPORATE TREASURY + DEBT</span>
              <span className="font-mono-num text-[11px] font-bold text-[#3B3459]">
                T-Bill {state.macro.interestRate.toFixed(2)}% · Debt {activeCompany.debtApr.toFixed(2)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
              <div className="p-2 bg-white border border-[#1B1929]">
                <div className="text-[11px] text-[#5B5670]">T-Bills Held</div>
                <div className="font-bold text-emerald-700">{formatMoney(activeCompany.tBillsInvested)}</div>
              </div>
              <div className="p-2 bg-white border border-[#1B1929]">
                <div className="text-[11px] text-[#5B5670]">Credit Debt</div>
                <div className="font-bold text-rose-700">{formatMoney(activeCompany.debtBalance)}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onTakeLoan(activeCompany.id, 100_000)}
                className="pixel-btn px-2 py-1 bg-[#F59E0B] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
              >
                +$100K Loan
              </button>
              <button
                type="button"
                disabled={activeCompany.debtBalance <= 0 || activeCompany.cash < 50_000}
                onClick={() => onRepayLoan(activeCompany.id, 50_000)}
                className="pixel-btn px-2 py-1 bg-white text-[#1B1929] font-pixel text-[10px] cursor-pointer"
              >
                Repay $50K
              </button>
              <button
                type="button"
                disabled={activeCompany.cash < 50_000}
                onClick={() => onAllocateCompanyTBills(activeCompany.id, 50_000)}
                className="pixel-btn px-2 py-1 bg-[#10B981] text-[#1B1929] font-pixel text-[10px] cursor-pointer"
              >
                +$50K T-Bills
              </button>
              <button
                type="button"
                disabled={activeCompany.tBillsInvested < 50_000}
                onClick={() => onAllocateCompanyTBills(activeCompany.id, -50_000)}
                className="pixel-btn px-2 py-1 bg-white text-[#1B1929] font-pixel text-[10px] cursor-pointer"
              >
                Redeem $50K
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Manufacturing Plant Operations Panel */}
      {activeCompany.manufacturing && (
        <section className="pixel-box p-4 space-y-3 bg-amber-50">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-pixel text-sm text-[#1B1929]">MANUFACTURING PLANT OPERATIONS</h2>
              <p className="text-xs text-[#5B5670]">
                Commodity Index {state.macro.commodityIndex.toFixed(2)}x · Margin ${activeCompany.manufacturing.unitPrice - Math.round(activeCompany.manufacturing.unitCost * state.macro.commodityIndex)}/unit
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={activeCompany.cash < 120_000}
                onClick={() => onAddFactoryLine(activeCompany.id)}
                className="pixel-btn px-3 py-1.5 bg-[#F59E0B] text-[#1B1929] font-pixel text-xs cursor-pointer"
              >
                Add Assembly Line ($120K)
              </button>
              <button
                type="button"
                disabled={activeCompany.cash < 15_000}
                onClick={() => onSignContract(activeCompany.id)}
                className="pixel-btn px-3 py-1.5 bg-[#10B981] text-[#1B1929] font-pixel text-xs cursor-pointer"
              >
                Sign Supply Contract ($15K)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono-num">
            <div className="p-2.5 bg-white border border-[#1B1929]">
              <div className="text-[#5B5670]">Active Lines</div>
              <div className="font-bold text-base">{activeCompany.manufacturing.factoryLines}</div>
            </div>
            <div className="p-2.5 bg-white border border-[#1B1929]">
              <div className="text-[#5B5670]">Monthly Output</div>
              <div className="font-bold text-base text-[#2563EB]">
                {activeCompany.manufacturing.monthlyUnitsProduced.toLocaleString()} u
              </div>
            </div>
            <div className="p-2.5 bg-white border border-[#1B1929]">
              <div className="text-[#5B5670]">Wholesale Contracts</div>
              <div className="font-bold text-base">{activeCompany.manufacturing.activeContracts}</div>
            </div>
            <div className="p-2.5 bg-white border border-[#1B1929]">
              <div className="text-[#5B5670]">Defect Rate</div>
              <div className="font-bold text-base text-rose-700">
                {activeCompany.manufacturing.defectRatePct}%
              </div>
            </div>
            <div className="p-2.5 bg-white border border-[#1B1929]">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="factory-util" className="text-[#5B5670]">Utilization</label>
                <span className="font-bold">{activeCompany.manufacturing.utilizationPct}%</span>
              </div>
              <input
                id="factory-util"
                type="range"
                min={20}
                max={100}
                step={5}
                value={activeCompany.manufacturing.utilizationPct}
                onChange={(e) => onSetUtilization(activeCompany.id, Number(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
            </div>
          </div>
        </section>
      )}

      {/* Holding Company Subsidiaries + M&A Buyouts */}
      {(activeCompany.sector === 'HOLDING_CO' || (activeCompany.subsidiaries?.length ?? 0) > 0) && (
        <section className="pixel-box p-4 space-y-3 bg-sky-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-pixel text-sm text-[#1B1929]">HOLDING CO · SUBSIDIARIES + M&amp;A ROLL-UPS</h2>
              <p className="text-xs text-[#5B5670]">
                Acquire world startups outright at 1.15x valuation to collect recurring monthly subsidiary dividends.
              </p>
            </div>
            <span className="font-mono-num text-xs font-bold text-[#2563EB]">
              {(activeCompany.subsidiaries ?? []).length} Subsidiaries Owned
            </span>
          </div>

          {(activeCompany.subsidiaries ?? []).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {(activeCompany.subsidiaries ?? []).map((sub) => (
                <div key={sub.companyId} className="p-2.5 bg-emerald-50 border-2 border-[#1B1929] text-xs">
                  <div className="font-bold text-[#1B1929]">{sub.name}</div>
                  <div className="text-[11px] text-[#5B5670]">{SECTOR_LABELS[sub.sector]} · {sub.ownershipPct}% Owned</div>
                  <div className="font-mono-num font-bold text-emerald-700 mt-1">
                    Dividend: +{formatMoney(sub.monthlyDividend)}/mo
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {state.companies
              .filter((c) => !c.isPlayerOwned && c.status === 'ACTIVE' && !c.isPublic)
              .slice(0, 6)
              .map((target) => {
                const buyout = Math.round(target.valuation * 1.15);
                return (
                  <div
                    key={target.id}
                    className="p-2.5 bg-white border border-[#1B1929] flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#1B1929]">{target.name}</span>{' '}
                      <span className="text-[#5B5670]">· {SECTOR_LABELS[target.sector]} · {target.stage.replace('_', ' ')}</span>
                      <div className="font-mono-num text-[11px] text-[#3B3459]">
                        Rev {formatMoney(target.monthlyRevenue)}/mo · Buyout Cost {formatMoney(buyout)}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={activeCompany.cash < buyout}
                      onClick={() => onAcquireTarget(activeCompany.id, target.id)}
                      className="pixel-btn px-3 py-1.5 bg-[#2563EB] text-white font-pixel text-[11px] cursor-pointer"
                    >
                      Acquire ({formatMoney(buyout)})
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
};
