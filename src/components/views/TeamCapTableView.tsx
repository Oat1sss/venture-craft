import React, { useState } from 'react';
import { Company, SimState, VentureSector } from '../../engine/types';
import { SECTOR_LABELS } from '../../engine/names';
import { formatMoney } from '../../utils/format';

interface TeamCapTableViewProps {
  state: SimState;
  activeCompany: Company | null;
  onHireEmployee: (coId: string, candId: string) => void;
  onFireEmployee: (coId: string, empId: string) => void;
  onFoundStartup: (name: string, sector: VentureSector, initialCapital: number) => void;
  onSelectCompany: (coId: string) => void;
}

export const TeamCapTableView: React.FC<TeamCapTableViewProps> = ({
  state,
  activeCompany,
  onHireEmployee,
  onFireEmployee,
  onFoundStartup,
  onSelectCompany,
}) => {
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState<VentureSector>('AI_LAB');
  const [seedCap, setSeedCap] = useState(75000);

  const playerCompanies = state.companies.filter((c) => c.isPlayerOwned);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || state.personal.liquidCash < seedCap) return;
    onFoundStartup(newName, newSector, seedCap);
    setNewName('');
  };

  return (
    <div className="space-y-5">
      {/* Portfolio of Player-Founded Startups + New Startup Launcher */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <section className="xl:col-span-7 pixel-box p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-sm text-[#1B1929]">YOUR STARTUP EMPIRE</h2>
            <span className="font-mono-num text-xs text-[#5B5670]">{playerCompanies.length} Founded</span>
          </div>
          {playerCompanies.length === 0 ? (
            <p className="text-sm text-[#5B5670] py-4">
              You haven&apos;t founded a startup yet. Use the Venture Studio launcher on the right to start one anytime.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playerCompanies.map((c) => {
                const isSelected = c.id === activeCompany?.id;
                const equityPct = ((c.playerShares / c.sharesTotal) * 100).toFixed(1);
                return (
                  <div
                    key={c.id}
                    className={`p-3 border-2 border-[#1B1929] flex flex-col justify-between gap-2 ${
                      isSelected ? 'bg-amber-50' : 'bg-[#F6F1E4]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-pixel text-xs text-[#1B1929] truncate">{c.name}</span>
                        <span className="font-mono-num text-[11px] font-bold px-1.5 py-0.5 bg-[#1B1929] text-white">
                          {c.status === 'BANKRUPT' ? 'CLOSED' : c.stage.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-[#5B5670] mt-1">
                        {SECTOR_LABELS[c.sector]} · Valuation {formatMoney(c.valuation)} · Your Stake {equityPct}%
                      </div>
                    </div>
                    {c.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => onSelectCompany(c.id)}
                        className={`pixel-btn py-1.5 px-3 text-[11px] font-pixel cursor-pointer ${
                          isSelected ? 'bg-[#10B981] text-[#1B1929]' : 'bg-white text-[#1B1929]'
                        }`}
                      >
                        {isSelected ? 'Active HQ' : 'Switch to HQ'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Found Another Startup */}
        <section className="xl:col-span-5 pixel-box p-4">
          <h2 className="font-pixel text-sm text-[#1B1929] mb-2">FOUND NEW VENTURE</h2>
          <form onSubmit={handleLaunch} className="space-y-3">
            <div>
              <label htmlFor="new-venture-name" className="block text-xs font-semibold text-[#3B3459] mb-1">
                Company Name
              </label>
              <input
                id="new-venture-name"
                type="text"
                placeholder="e.g. QuantumDEX or OrbitAI"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F6F1E4] border-2 border-[#1B1929]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="new-venture-sector" className="block text-xs font-semibold text-[#3B3459] mb-1">
                  Sector
                </label>
                <select
                  id="new-venture-sector"
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value as VentureSector)}
                  className="w-full px-2.5 py-2 text-xs bg-[#F6F1E4] border-2 border-[#1B1929]"
                >
                  {(Object.keys(SECTOR_LABELS) as VentureSector[]).map((sec) => (
                    <option key={sec} value={sec}>
                      {SECTOR_LABELS[sec]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="new-venture-cap" className="block text-xs font-semibold text-[#3B3459] mb-1">
                  Seed Capital ($)
                </label>
                <input
                  id="new-venture-cap"
                  type="number"
                  min={25000}
                  step={10000}
                  value={seedCap}
                  onChange={(e) => setSeedCap(Number(e.target.value))}
                  className="w-full px-2.5 py-2 text-xs font-mono-num bg-[#F6F1E4] border-2 border-[#1B1929]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!newName.trim() || state.personal.liquidCash < seedCap}
              className="pixel-btn w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-pixel text-xs cursor-pointer"
            >
              Launch Startup ({formatMoney(seedCap)})
            </button>
          </form>
        </section>
      </div>

      {activeCompany && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Hiring Market */}
          <section className="xl:col-span-6 pixel-box p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-pixel text-sm text-[#1B1929]">TALENT MARKET</h2>
              <span className="text-xs text-[#5B5670]">Refreshes monthly</span>
            </div>
            <div className="space-y-2">
              {state.candidatePool.map((cand) => (
                <div
                  key={cand.id}
                  className="p-2.5 bg-[#F6F1E4] border-2 border-[#1B1929] flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1B1929]">
                      {cand.name} · <span className="text-[#2563EB]">{cand.role}</span>
                    </div>
                    <div className="text-[11px] font-mono-num text-[#5B5670]">
                      Skill {cand.skill}/100 · Salary {formatMoney(cand.salary)}/mo
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={activeCompany.cash < cand.salary}
                    onClick={() => onHireEmployee(activeCompany.id, cand.id)}
                    className="pixel-btn px-3 py-1.5 bg-[#10B981] text-[#1B1929] font-pixel text-[11px] cursor-pointer"
                  >
                    Hire
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Active Team Roster & Cap Table */}
          <section className="xl:col-span-6 pixel-box p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-pixel text-sm text-[#1B1929]">
                  TEAM ROSTER ({activeCompany.employees.length})
                </h2>
                <span className="font-mono-num text-xs text-[#5B5670]">
                  Payroll {formatMoney(activeCompany.employees.reduce((s, e) => s + e.salary, 0))}/mo
                </span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {activeCompany.employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-2 bg-[#F6F1E4] border border-[#1B1929]/50 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-bold">{emp.name}</span> ({emp.role})
                      <span className="ml-2 font-mono-num text-[#5B5670]">
                        Skill {emp.skill} · {formatMoney(emp.salary)}/mo
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onFireEmployee(activeCompany.id, emp.id)}
                      className="px-2 py-1 text-[11px] font-pixel bg-rose-100 hover:bg-rose-200 text-rose-900 border border-[#1B1929] cursor-pointer"
                    >
                      Release
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t-2 border-[#1B1929]/15">
              <h3 className="font-pixel text-xs text-[#1B1929] mb-2">CAP TABLE OWNERSHIP</h3>
              <div className="space-y-1.5">
                {activeCompany.shareholders.map((sh, i) => {
                  const pct = ((sh.shares / activeCompany.sharesTotal) * 100).toFixed(1);
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className={sh.isPlayer ? 'font-bold text-[#2563EB]' : 'text-[#3B3459]'}>
                        {sh.holderName}
                      </span>
                      <span className="font-mono-num font-bold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
