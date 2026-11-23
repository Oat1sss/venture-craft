import React, { useEffect, useState } from 'react';
import { CareerOrigin, VentureSector } from '../engine/types';
import { SECTOR_LABELS } from '../engine/names';
import { PixelOfficeCanvas } from './PixelOfficeCanvas';

interface TitleScreenProps {
  hasSavedGame: boolean;
  onStartNew: (opts: {
    origin: CareerOrigin;
    founderName: string;
    startupName: string;
    sector: VentureSector;
  }) => void;
  onContinueSaved: () => void;
}

const ORIGIN_CARDS: {
  id: CareerOrigin;
  title: string;
  accent: string;
  summary: string;
  highlights: string[];
  startingCapital: string;
}[] = [
  {
    id: 'TECH_FOUNDER',
    title: 'Tech Founder',
    accent: 'bg-[#2563EB] text-white',
    summary: 'Launch a software or AI startup, delegate to department heads, and scale to IPO.',
    highlights: [
      'Sprint core product features',
      'Hire CTO, CMO, CFO + COO',
      'Negotiate VC term sheets',
    ],
    startingCapital: '$185K Seed · $50K Personal',
  },
  {
    id: 'CRYPTO_ARCHITECT',
    title: 'Crypto Architect',
    accent: 'bg-[#F59E0B] text-[#1B1929]',
    summary: 'Operate a live crypto exchange, mint your own token, and ride liquidity cycles.',
    highlights: [
      'Earn daily exchange fee bps',
      'Guard custody from hacks',
      'Launch custom tokenomics',
    ],
    startingCapital: '$280K Treasury · Native Token',
  },
  {
    id: 'VC_FINANCIER',
    title: 'VC Fund Manager',
    accent: 'bg-[#10B981] text-[#1B1929]',
    summary: 'Command a $10M Venture Fund, back dynamic startups, or launch spinout companies.',
    highlights: [
      'Deploy $10M LP dry powder',
      'Collect 2% fees + 20% carry',
      'Trade public stocks + crypto',
    ],
    startingCapital: '$10M Fund AUM · $1.85M Liquid',
  },
  {
    id: 'EVERYDAY_WORKER',
    title: 'Paycheck Worker',
    accent: 'bg-[#0EA5E9] text-[#1B1929]',
    summary: 'Start as an everyday 9-to-5 worker living paycheck to paycheck with a side hustle.',
    highlights: [
      'Earn $3.1K/mo salary + gigs',
      'Freelance & build skills',
      'Bootstrap a $450 online store',
    ],
    startingCapital: '$2,200 Cash · $600 Debt',
  },
  {
    id: 'BROKE_UNEMPLOYED',
    title: 'Broke + Jobless',
    accent: 'bg-[#E11D48] text-white',
    summary: 'Start poor as hell with $180, $4.2K debt, couch-surfing, and tough job rejections.',
    highlights: [
      'Grind odd gigs for survival',
      'Study free to pass interviews',
      'Claw out of debt from zero',
    ],
    startingCapital: '$180 Cash · $4.2K Debt',
  },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSavedGame,
  onStartNew,
  onContinueSaved,
}) => {
  const [origin, setOrigin] = useState<CareerOrigin>('TECH_FOUNDER');
  const [founderName, setFounderName] = useState('Alex Mercer');
  const [startupName, setStartupName] = useState('VeloStack');
  const [sector, setSector] = useState<VentureSector>('SAAS');

  useEffect(() => {
    if (origin === 'CRYPTO_ARCHITECT') {
      setSector('CRYPTO_EXCHANGE');
      setStartupName('PixelVault Exchange');
    } else if (origin === 'TECH_FOUNDER') {
      setSector('SAAS');
      setStartupName('VeloStack');
    } else {
      setSector('FINTECH');
      setStartupName('Northstar Labs');
    }
  }, [origin]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartNew({ origin, founderName, startupName, sector });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [origin, founderName, startupName, sector, onStartNew]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1B1929] flex flex-col justify-between">
      {/* Live Animated Pixel City Backdrop */}
      <div className="absolute inset-0 z-0">
        <PixelOfficeCanvas mode="TITLE_CITY" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(27,25,41,0.58) 0%, rgba(27,25,41,0.38) 45%, rgba(27,25,41,0.88) 100%)',
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col justify-center gap-6">
        {/* Custom Pixel SVG Emblem Lockup */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex items-center gap-4">
            <svg
              width="56"
              height="56"
              viewBox="0 0 16 16"
              className="pixel-box-sm bg-[#F59E0B] p-1 shrink-0"
              aria-hidden="true"
            >
              <rect x="2" y="9" width="3" height="5" fill="#1B1929" />
              <rect x="6" y="6" width="3" height="8" fill="#2563EB" />
              <rect x="10" y="3" width="4" height="11" fill="#10B981" />
              <rect x="11" y="5" width="2" height="2" fill="#FFFDF7" />
              <rect x="11" y="8" width="2" height="2" fill="#FFFDF7" />
              <rect x="7" y="8" width="1" height="2" fill="#FFFDF7" />
            </svg>
            <div>
              <h1 className="font-pixel text-3xl sm:text-5xl text-[#FFFDF7] tracking-tight drop-shadow-[3px_3px_0_#1B1929]">
                VENTURE CRAFT
              </h1>
              <p className="text-sm sm:text-base text-[#FDE68A] font-medium mt-1">
                Free-Run Startup, Venture Capital, Crypto &amp; Market Sandbox
              </p>
            </div>
          </div>
        </div>

        {/* Career Origin Selector + Setup Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 5 Career Origin Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {ORIGIN_CARDS.map((card) => {
              const selected = origin === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setOrigin(card.id)}
                  className={`text-left p-4 flex flex-col justify-between transition-transform cursor-pointer border-2 border-[#1B1929] ${
                    selected
                      ? 'bg-[#FFFDF7] -translate-y-1 shadow-[6px_6px_0_#F59E0B]'
                      : 'bg-[#F6F1E4]/95 hover:bg-[#FFFDF7] shadow-[4px_4px_0_#1B1929]'
                  }`}
                >
                  <div>
                    <div className={`inline-block px-2 py-1 text-xs font-pixel border-2 border-[#1B1929] mb-3 ${card.accent}`}>
                      {card.title}
                    </div>
                    <p className="text-xs sm:text-sm text-[#2B2640] leading-relaxed">
                      {card.summary}
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs text-[#3B3459] font-medium">
                      {card.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-1.5">
                          <span className="font-pixel text-[10px] text-[#059669] mt-0.5">&gt;</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t-2 border-[#1B1929]/15 text-xs font-mono-num font-bold text-[#1B1929]">
                    {card.startingCapital}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sandbox Customization & Launch Box */}
          <div className="lg:col-span-4 pixel-box p-5 flex flex-col justify-between bg-[#FFFDF7]">
            <div className="space-y-3">
              <h2 className="font-pixel text-sm text-[#1B1929] uppercase">
                Sandbox Identity
              </h2>
              <div>
                <label htmlFor="founder-name" className="block text-xs font-semibold text-[#3B3459] mb-1">
                  Founder / GP Name
                </label>
                <input
                  id="founder-name"
                  type="text"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#F6F1E4] border-2 border-[#1B1929] font-medium focus:outline-none focus:bg-white"
                  maxLength={28}
                />
              </div>

              {(origin === 'TECH_FOUNDER' || origin === 'CRYPTO_ARCHITECT') ? (
                <>
                  <div>
                    <label htmlFor="startup-name" className="block text-xs font-semibold text-[#3B3459] mb-1">
                      First Startup Name
                    </label>
                    <input
                      id="startup-name"
                      type="text"
                      value={startupName}
                      onChange={(e) => setStartupName(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#F6F1E4] border-2 border-[#1B1929] font-medium focus:outline-none focus:bg-white"
                      maxLength={28}
                    />
                  </div>
                  <div>
                    <label htmlFor="sector-select" className="block text-xs font-semibold text-[#3B3459] mb-1">
                      Initial Sector
                    </label>
                    <select
                      id="sector-select"
                      value={sector}
                      onChange={(e) => setSector(e.target.value as VentureSector)}
                      className="w-full px-3 py-2 text-sm bg-[#F6F1E4] border-2 border-[#1B1929] font-medium focus:outline-none focus:bg-white"
                    >
                      {(Object.keys(SECTOR_LABELS) as VentureSector[]).map((sec) => (
                        <option key={sec} value={sec}>
                          {SECTOR_LABELS[sec]}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-[#F6F1E4] border-2 border-[#1B1929] text-xs text-[#3B3459] leading-relaxed">
                  {origin === 'VC_FINANCIER'
                    ? 'You begin with $10M LP/GP AUM in your Venture Fund and $1.85M liquid cash.'
                    : origin === 'EVERYDAY_WORKER'
                    ? 'You start at a $3,100/mo day job living paycheck to paycheck in a shared room. Build side income or save $450 for an online store.'
                    : 'Hardcore survival mode: $180 cash, $4,200 debt, no job, and low starting skills. Work odd gigs and study to get hired.'}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                data-start="true"
                onClick={() => onStartNew({ origin, founderName, startupName, sector })}
                className="pixel-btn w-full py-3 px-4 bg-[#10B981] hover:bg-[#059669] text-[#1B1929] hover:text-white font-pixel text-sm uppercase cursor-pointer"
              >
                Start Simulation
              </button>
              {hasSavedGame && (
                <button
                  type="button"
                  onClick={onContinueSaved}
                  className="pixel-btn w-full py-2.5 px-4 bg-[#FDE68A] hover:bg-[#F59E0B] text-[#1B1929] font-pixel text-xs uppercase cursor-pointer"
                >
                  Resume Saved Sandbox
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Clean Control Hint */}
      <footer className="relative z-10 px-6 py-3 text-center text-xs text-[#E2E8F0] font-mono-num">
        Enter / Space Start · Step by Day, Week, Month, or Year · Delegate to Dept Heads or Micromanage
      </footer>
    </div>
  );
};
