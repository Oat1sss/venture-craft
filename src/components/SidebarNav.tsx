import React from 'react';
import {
  Building2,
  Users,
  Landmark,
  Coins,
  Globe2,
  Newspaper,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { WorldEvent } from '../engine/types';

export type NavTab = 'HQ' | 'TEAM' | 'FUNDING' | 'MARKETS' | 'WORLD' | 'NEWS' | 'CAREER' | 'LIFE';

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  vcOfferCount: number;
  pendingDecisionCount: number;
  events: WorldEvent[];
}

const NAV_ITEMS: { id: NavTab; label: string; color: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'HQ', label: 'HQ + Operations', color: 'bg-[#2563EB] text-white', Icon: Building2 },
  { id: 'CAREER', label: 'Jobs + Hustle', color: 'bg-[#14B8A6] text-[#1B1929]', Icon: Briefcase },
  { id: 'TEAM', label: 'Team + Ventures', color: 'bg-[#10B981] text-[#1B1929]', Icon: Users },
  { id: 'FUNDING', label: 'VC + Funds', color: 'bg-[#F59E0B] text-[#1B1929]', Icon: Landmark },
  { id: 'MARKETS', label: 'Stocks + Crypto', color: 'bg-[#7C3AED] text-white', Icon: Coins },
  { id: 'WORLD', label: 'World + Macro', color: 'bg-[#0EA5E9] text-[#1B1929]', Icon: Globe2 },
  { id: 'NEWS', label: 'News Wire', color: 'bg-[#F97316] text-[#1B1929]', Icon: Newspaper },
  { id: 'LIFE', label: 'Personal Life', color: 'bg-[#EC4899] text-white', Icon: UserCheck },
];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  vcOfferCount,
  pendingDecisionCount,
  events,
}) => {
  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
      <nav aria-label="Simulation workspaces" className="pixel-box p-3 flex lg:flex-col gap-2 overflow-x-auto">
        {NAV_ITEMS.map(({ id, label, color, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={`pixel-btn px-3 py-2.5 text-left flex items-center justify-between gap-2 text-xs font-pixel whitespace-nowrap shrink-0 cursor-pointer ${
                active ? color : 'bg-[#F6F1E4] hover:bg-white text-[#1B1929]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </span>
              {id === 'FUNDING' && vcOfferCount > 0 && (
                <span className="font-mono-num text-[11px] font-bold px-1.5 py-0.5 bg-[#1B1929] text-[#FDE68A]">
                  {vcOfferCount}
                </span>
              )}
              {id === 'NEWS' && pendingDecisionCount > 0 && (
                <span className="font-mono-num text-[11px] font-bold px-1.5 py-0.5 bg-[#E11D48] text-white">
                  {pendingDecisionCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live Chronicle / News Feed */}
      <section className="pixel-box p-3 hidden lg:flex flex-col gap-2 flex-1 min-h-[260px] max-h-[460px]">
        <div className="flex items-center justify-between pb-2 border-b-2 border-[#1B1929]/15">
          <h2 className="font-pixel text-xs text-[#1B1929]">WORLD CHRONICLE</h2>
          <span className="font-mono-num text-[11px] text-[#5B5670]">{events.length} logs</span>
        </div>
        <div className="overflow-y-auto space-y-2.5 pr-1">
          {events.slice(0, 14).map((evt) => (
            <div
              key={evt.id}
              className="p-2 bg-[#F6F1E4] border border-[#1B1929]/30 text-xs"
            >
              <div className="flex items-center justify-between gap-1 text-[11px] font-mono-num text-[#5B5670] mb-0.5">
                <span>Day {evt.day} · {evt.category}</span>
                <span
                  className={
                    evt.sentiment === 'POSITIVE'
                      ? 'text-emerald-700 font-bold'
                      : evt.sentiment === 'NEGATIVE'
                      ? 'text-rose-700 font-bold'
                      : 'text-[#5B5670]'
                  }
                >
                  {evt.sentiment === 'POSITIVE' ? '+UP' : evt.sentiment === 'NEGATIVE' ? '-ALERT' : 'INFO'}
                </span>
              </div>
              <div className="font-bold text-[#1B1929] leading-snug">{evt.title}</div>
              <p className="text-[#3B3459] text-[11px] leading-snug mt-0.5">{evt.description}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};
