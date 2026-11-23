import { useCallback, useEffect, useState } from 'react';
import { sfx } from './audio/sfx';
import { GameModals } from './components/GameModals';
import { NewsTickerBar } from './components/NewsTickerBar';
import { NavTab, SidebarNav } from './components/SidebarNav';
import { TitleScreen } from './components/TitleScreen';
import { TopHudBar } from './components/TopHudBar';
import { CareerHustleView } from './components/views/CareerHustleView';
import { FundingVcView } from './components/views/FundingVcView';
import { HqOpsView } from './components/views/HqOpsView';
import { MarketsCryptoView } from './components/views/MarketsCryptoView';
import { NewsWireView } from './components/views/NewsWireView';
import { PersonalLifeView } from './components/views/PersonalLifeView';
import { TeamCapTableView } from './components/views/TeamCapTableView';
import { WorldMacroView } from './components/views/WorldMacroView';
import {
  acceptVcOffer,
  acquireCompanyIntoParent,
  addManufacturingLine,
  advanceTime,
  allocateCompanyTBills,
  allocatePersonalTBills,
  applyForDayJob,
  borrowPersonalLoan,
  buyPersonalAsset,
  createInitialState,
  doSideHustleGig,
  drawFounderSecondary,
  fireEmployee,
  foundInvestmentFund,
  foundNewStartup,
  fundActivistAction,
  fundAllocateTBills,
  fundBuyPublicStock,
  fundDistributeProfits,
  fundExitPosition,
  fundInvestInCompany,
  fundRaiseLpCapital,
  fundToggleLeverage,
  fundUpdateTerms,
  hireDepartmentHead,
  hireEmployee,
  issuePressRelease,
  launchMicroOnlineStore,
  mintCryptoCoin,
  quitDayJob,
  rejectVcOffer,
  repayCompanyLoan,
  repayPersonalDebt,
  requestFundingRound,
  resolvePendingDecision,
  setCompanyVision,
  setExchangeFeeBps,
  setFactoryUtilization,
  setLifestyleTier,
  setMarketingBudget,
  setPricingTier,
  setSalaryDraw,
  signSupplyContract,
  startFeatureSprint,
  switchActiveVenture,
  takeCompanyLoan,
  takeCompanyPublic,
  takeRestVacation,
  toggleDepartmentDelegation,
  tradeCrypto,
  tradeStock,
  upskillStudy,
} from './engine/simulation';
import { CareerOrigin, SimState, VentureSector } from './engine/types';

const STORAGE_KEY = 'venture_craft_save_v1';

type ScreenState = 'title' | 'playing' | 'paused' | 'gameover';

function loadSavedState(): SimState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SimState;
    if (parsed && typeof parsed.totalDays === 'number' && Array.isArray(parsed.companies)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  const [savedExists, setSavedExists] = useState<boolean>(() => Boolean(loadSavedState()));
  const [simState, setSimState] = useState<SimState>(() => {
    const params = new URLSearchParams(window.location.search);
    const secParam = params.get('sector') as VentureSector | null;
    const origParam = (params.get('origin') as CareerOrigin | null) ?? 'TECH_FOUNDER';
    if (params.get('autostart') === '1') {
      return createInitialState({
        origin: origParam,
        sector: secParam ?? 'SAAS',
        startupName: secParam === 'MANUFACTURING' ? 'ForgeWorks Robotics' : secParam === 'HOLDING_CO' ? 'Apex Holdings' : undefined,
      });
    }
    return createInitialState({ origin: 'TECH_FOUNDER' });
  });

  const [screen, setScreen] = useState<ScreenState>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1' ? 'playing' : 'title';
  });

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const origParam = params.get('origin') as CareerOrigin | null;
    if (params.get('autostart') === '1') {
      if (origParam === 'EVERYDAY_WORKER' || origParam === 'BROKE_UNEMPLOYED') return 'CAREER';
      if (origParam === 'VC_FINANCIER') return 'FUNDING';
    }
    return 'HQ';
  });
  const [autoPlaySpeed, setAutoPlaySpeed] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync body data-state for game shell contract & browser verification
  useEffect(() => {
    const resolved: ScreenState = simState.isGameOver ? 'gameover' : screen;
    document.body.dataset.state = resolved;
  }, [screen, simState.isGameOver]);

  // Autosave to localStorage every time totalDays progresses while playing
  useEffect(() => {
    if (screen === 'playing' && !simState.isGameOver) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(simState));
        setSavedExists(true);
      } catch {
        // Ignore storage quota errors
      }
    }
  }, [simState, screen]);

  // Continuous play timer
  useEffect(() => {
    if (screen !== 'playing' || autoPlaySpeed <= 0 || simState.isGameOver) return;
    const intervalMs = autoPlaySpeed >= 3 ? 280 : 800;
    const id = window.setInterval(() => {
      setSimState((prev) => advanceTime(prev, 1));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [screen, autoPlaySpeed, simState.isGameOver]);

  // Keyboard Escape / P for Pause Menu
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (screen === 'playing' && (e.key === 'Escape' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setAutoPlaySpeed(0);
        setScreen('paused');
      } else if (screen === 'paused' && (e.key === 'Escape' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setScreen('playing');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen]);

  const handleStartNew = useCallback(
    (opts: { origin: CareerOrigin; founderName: string; startupName: string; sector: VentureSector }) => {
      sfx.fanfare();
      const fresh = createInitialState(opts);
      setSimState(fresh);
      setActiveTab(
        opts.origin === 'VC_FINANCIER'
          ? 'FUNDING'
          : opts.origin === 'EVERYDAY_WORKER' || opts.origin === 'BROKE_UNEMPLOYED'
          ? 'CAREER'
          : 'HQ'
      );
      setAutoPlaySpeed(0);
      setScreen('playing');
    },
    []
  );

  const handleContinueSaved = useCallback(() => {
    const saved = loadSavedState();
    if (!saved) return;
    sfx.blip();
    setSimState(saved);
    setAutoPlaySpeed(0);
    setScreen('playing');
  }, []);

  const handleStepDays = useCallback((days: number) => {
    sfx.blip();
    setSimState((prev) => advanceTime(prev, days));
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      sfx.muted = next;
      return next;
    });
  }, []);

  const handleSaveToLocal = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(simState));
      setSavedExists(true);
      setSaveToast('Sandbox state saved to browser storage.');
      sfx.coin();
    } catch {
      setSaveToast('Unable to save to localStorage.');
    }
  }, [simState]);

  const handleRestartToTitle = useCallback(() => {
    sfx.blip();
    setAutoPlaySpeed(0);
    setSaveToast(null);
    setScreen('title');
  }, []);

  if (screen === 'title') {
    return (
      <TitleScreen
        hasSavedGame={savedExists}
        onStartNew={handleStartNew}
        onContinueSaved={handleContinueSaved}
      />
    );
  }

  const activeCompany =
    simState.companies.find(
      (c) => c.id === simState.activeCompanyId && c.isPlayerOwned && c.status === 'ACTIVE'
    ) ?? null;

  const modalMode = simState.isGameOver ? 'GAMEOVER' : screen === 'paused' ? 'PAUSED' : null;

  return (
    <div className="min-h-screen flex flex-col pixel-grid-bg text-[#1B1929]">
      <TopHudBar
        state={simState}
        autoPlaySpeed={autoPlaySpeed}
        muted={muted}
        onStepDays={handleStepDays}
        onToggleAutoPlay={setAutoPlaySpeed}
        onSelectCompany={(id) => {
          sfx.blip();
          setSimState((prev) => switchActiveVenture(prev, id));
        }}
        onToggleMute={handleToggleMute}
        onOpenMenu={() => {
          setAutoPlaySpeed(0);
          setSaveToast(null);
          setScreen('paused');
        }}
      />

      <NewsTickerBar
        latestArticle={simState.newsFeed[0] ?? null}
        pendingDecisionCount={simState.pendingDecisions.length}
        onOpenNews={() => {
          sfx.blip();
          setActiveTab('NEWS');
        }}
      />

      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-5 flex flex-col lg:flex-row gap-5">
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            sfx.blip();
            setActiveTab(tab);
          }}
          vcOfferCount={simState.vcOffers.length}
          pendingDecisionCount={simState.pendingDecisions.length}
          events={simState.events}
        />

        <main className="flex-1 min-w-0">
          {activeTab === 'HQ' && (
            <HqOpsView
              state={simState}
              activeCompany={activeCompany}
              onSetVision={(coId, v) => {
                sfx.blip();
                setSimState((p) => setCompanyVision(p, coId, v));
              }}
              onHireHead={(coId, role) => {
                sfx.coin();
                setSimState((p) => hireDepartmentHead(p, coId, role));
              }}
              onToggleDelegate={(coId, role) => {
                sfx.blip();
                setSimState((p) => toggleDepartmentDelegation(p, coId, role));
              }}
              onStartSprint={(coId, featId) => {
                sfx.ship();
                setSimState((p) => startFeatureSprint(p, coId, featId));
              }}
              onSetPricing={(coId, tier) => {
                sfx.blip();
                setSimState((p) => setPricingTier(p, coId, tier));
              }}
              onSetMarketing={(coId, b) => setSimState((p) => setMarketingBudget(p, coId, b))}
              onSetExchangeFee={(coId, bps) => setSimState((p) => setExchangeFeeBps(p, coId, bps))}
              onAddFactoryLine={(coId) => {
                sfx.ship();
                setSimState((p) => addManufacturingLine(p, coId));
              }}
              onSetUtilization={(coId, pct) => setSimState((p) => setFactoryUtilization(p, coId, pct))}
              onSignContract={(coId) => {
                sfx.coin();
                setSimState((p) => signSupplyContract(p, coId));
              }}
              onTakeLoan={(coId, amt) => {
                sfx.coin();
                setSimState((p) => takeCompanyLoan(p, coId, amt));
              }}
              onRepayLoan={(coId, amt) => {
                sfx.blip();
                setSimState((p) => repayCompanyLoan(p, coId, amt));
              }}
              onAllocateCompanyTBills={(coId, delta) => {
                sfx.coin();
                setSimState((p) => allocateCompanyTBills(p, coId, delta));
              }}
              onAcquireTarget={(parentId, targetId) => {
                sfx.fanfare();
                setSimState((p) => acquireCompanyIntoParent(p, parentId, targetId));
              }}
              onGoToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'CAREER' && (
            <CareerHustleView
              state={simState}
              onApplyJob={(jobId) => {
                sfx.blip();
                setSimState((p) => applyForDayJob(p, jobId));
              }}
              onQuitJob={() => {
                sfx.alert();
                setSimState((p) => quitDayJob(p));
              }}
              onDoGig={(gigId) => {
                sfx.coin();
                setSimState((p) => doSideHustleGig(p, gigId));
              }}
              onStudy={(mode) => {
                sfx.ship();
                setSimState((p) => upskillStudy(p, mode));
              }}
              onBorrowPersonal={(amt) => {
                sfx.coin();
                setSimState((p) => borrowPersonalLoan(p, amt));
              }}
              onRepayPersonal={(amt) => {
                sfx.blip();
                setSimState((p) => repayPersonalDebt(p, amt));
              }}
              onLaunchStore={(name, tier) => {
                sfx.fanfare();
                setSimState((p) => launchMicroOnlineStore(p, name, tier));
                setActiveTab('HQ');
              }}
              onSetLifestyle={(tier) => {
                sfx.blip();
                setSimState((p) => setLifestyleTier(p, tier));
              }}
              onGoToHq={() => setActiveTab('HQ')}
            />
          )}

          {activeTab === 'TEAM' && (
            <TeamCapTableView
              state={simState}
              activeCompany={activeCompany}
              onHireEmployee={(coId, candId) => {
                sfx.coin();
                setSimState((p) => hireEmployee(p, coId, candId));
              }}
              onFireEmployee={(coId, empId) => {
                sfx.alert();
                setSimState((p) => fireEmployee(p, coId, empId));
              }}
              onFoundStartup={(name, sec, cap) => {
                sfx.fanfare();
                setSimState((p) => foundNewStartup(p, name, sec, cap));
                setActiveTab('HQ');
              }}
              onSelectCompany={(id) => {
                sfx.blip();
                setSimState((p) => switchActiveVenture(p, id));
                setActiveTab('HQ');
              }}
            />
          )}

          {activeTab === 'FUNDING' && (
            <FundingVcView
              state={simState}
              activeCompany={activeCompany}
              onAcceptOffer={(id) => {
                sfx.fanfare();
                setSimState((p) => acceptVcOffer(p, id));
              }}
              onRejectOffer={(id) => {
                sfx.blip();
                setSimState((p) => rejectVcOffer(p, id));
              }}
              onRequestRound={(coId) => {
                sfx.ship();
                setSimState((p) => requestFundingRound(p, coId));
              }}
              onTakePublic={(coId) => {
                sfx.fanfare();
                setSimState((p) => takeCompanyPublic(p, coId));
              }}
              onFoundFund={(name, strat, gp) => {
                sfx.fanfare();
                setSimState((p) => foundInvestmentFund(p, name, strat, gp));
              }}
              onFundInvest={(fundId, coId, check) => {
                sfx.coin();
                setSimState((p) => fundInvestInCompany(p, fundId, coId, check));
              }}
              onFundExit={(fundId, idx) => {
                sfx.coin();
                setSimState((p) => fundExitPosition(p, fundId, idx));
              }}
              onFundRaiseLp={(fundId, amt) => {
                sfx.fanfare();
                setSimState((p) => fundRaiseLpCapital(p, fundId, amt));
              }}
              onFundLeverage={(fundId, delta) => {
                sfx.coin();
                setSimState((p) => fundToggleLeverage(p, fundId, delta));
              }}
              onFundUpdateTerms={(fundId, upd) => {
                sfx.blip();
                setSimState((p) => fundUpdateTerms(p, fundId, upd));
              }}
              onFundTBills={(fundId, delta) => {
                sfx.coin();
                setSimState((p) => fundAllocateTBills(p, fundId, delta));
              }}
              onFundBuyPublic={(fundId, coId, usd) => {
                sfx.coin();
                setSimState((p) => fundBuyPublicStock(p, fundId, coId, usd));
              }}
              onFundDistribute={(fundId, amt) => {
                sfx.fanfare();
                setSimState((p) => fundDistributeProfits(p, fundId, amt));
              }}
              onFundActivist={(fundId, idx, act) => {
                sfx.ship();
                setSimState((p) => fundActivistAction(p, fundId, idx, act));
              }}
            />
          )}

          {activeTab === 'MARKETS' && (
            <MarketsCryptoView
              state={simState}
              onTradeStock={(coId, delta) => {
                sfx.coin();
                setSimState((p) => tradeStock(p, coId, delta));
              }}
              onMintCoin={(name, sym, sup, liq, apr) => {
                sfx.fanfare();
                setSimState((p) => mintCryptoCoin(p, name, sym, sup, liq, apr));
              }}
              onTradeCrypto={(coinId, usd, side) => {
                sfx.coin();
                setSimState((p) => tradeCrypto(p, coinId, usd, side));
              }}
            />
          )}

          {activeTab === 'WORLD' && <WorldMacroView state={simState} />}

          {activeTab === 'NEWS' && (
            <NewsWireView
              state={simState}
              activeCompany={activeCompany}
              onResolveDecision={(decId, chId) => {
                sfx.ship();
                setSimState((p) => resolvePendingDecision(p, decId, chId));
              }}
              onIssuePressRelease={(coId, angle) => {
                sfx.fanfare();
                setSimState((p) => issuePressRelease(p, coId, angle));
              }}
            />
          )}

          {activeTab === 'LIFE' && (
            <PersonalLifeView
              state={simState}
              activeCompany={activeCompany}
              onSetLifestyle={(tier) => {
                sfx.blip();
                setSimState((p) => setLifestyleTier(p, tier));
              }}
              onSetSalary={(sal) => setSimState((p) => setSalaryDraw(p, sal))}
              onSecondarySale={(coId, pct) => {
                sfx.coin();
                setSimState((p) => drawFounderSecondary(p, coId, pct));
              }}
              onBuyAsset={(assetId) => {
                sfx.fanfare();
                setSimState((p) => buyPersonalAsset(p, assetId));
              }}
              onTakeVacation={() => {
                sfx.ship();
                setSimState((p) => takeRestVacation(p));
              }}
              onAllocateTBills={(delta) => {
                sfx.coin();
                setSimState((p) => allocatePersonalTBills(p, delta));
              }}
            />
          )}
        </main>
      </div>

      <GameModals
        mode={modalMode}
        state={simState}
        onResume={() => setScreen('playing')}
        onSaveToLocal={handleSaveToLocal}
        onRestartToTitle={handleRestartToTitle}
        saveToast={saveToast}
      />
    </div>
  );
}
