import {
  applyLogisticUserGrowth,
  calculateCompanyPeRatio,
  computeRealisticValuation,
  createDefaultDeptHeads,
  createInitialCryptoMarket,
  createInitialMacro,
  createWorldCompany,
  generateMonthlyNews,
  generatePendingDecision,
  generateVcOfferForCompany,
  stepCryptoCoinsDaily,
  stepMacroMonthly,
  stepPublicPricesDaily,
  stepWorldCompaniesMonthly,
} from './economy';
import {
  createRng,
  createSectorFeatures,
  generateCandidate,
  generateJobMarket,
  LIFESTYLE_COSTS,
  nextSeed,
  PERSONAL_ASSETS_CATALOG,
  PRICING_ARPU,
  SIDE_HUSTLE_GIGS,
} from './names';
import {
  CareerOrigin,
  Company,
  CryptoCoin,
  DepartmentRole,
  Employee,
  FundStrategy,
  JobPosting,
  LifestyleTier,
  MacroEconomy,
  NewsArticle,
  PersonalLife,
  PlayerFund,
  PricingTier,
  SimState,
  StrategicVision,
  VcOffer,
  VentureSector,
  WorldEvent,
} from './types';

export interface InitOptions {
  origin: CareerOrigin;
  founderName?: string;
  startupName?: string;
  sector?: VentureSector;
  seed?: number;
}

export function createInitialState(opts: InitOptions): SimState {
  const seed = opts.seed ?? 42026;
  const rng = createRng(seed);
  const macro = createInitialMacro();

  const founderName = opts.founderName?.trim() || 'Alex Mercer';
  const defaultSector: VentureSector =
    opts.sector ??
    (opts.origin === 'CRYPTO_ARCHITECT'
      ? 'CRYPTO_EXCHANGE'
      : opts.origin === 'VC_FINANCIER'
      ? 'FINTECH'
      : 'SAAS');

  const startupName =
    opts.startupName?.trim() ||
    (opts.origin === 'CRYPTO_ARCHITECT'
      ? 'PixelVault Exchange'
      : opts.origin === 'VC_FINANCIER'
      ? 'Northstar Labs'
      : 'VeloStack');

  const companies: Company[] = [];

  let activeCompanyId: string | null = null;
  const startsWithCorporation =
    opts.origin === 'TECH_FOUNDER' || opts.origin === 'CRYPTO_ARCHITECT';

  if (startsWithCorporation) {
    const startCash =
      opts.origin === 'CRYPTO_ARCHITECT'
        ? 280_000
        : defaultSector === 'MANUFACTURING'
        ? 340_000
        : defaultSector === 'HOLDING_CO'
        ? 450_000
        : 185_000;

    const starterEmployees: Employee[] = [
      {
        id: 'emp_init_1',
        name: 'Samira Chen',
        role: defaultSector === 'MANUFACTURING' ? 'Operator' : 'Engineer',
        skill: 78,
        salary: defaultSector === 'MANUFACTURING' ? 6800 : 9500,
        morale: 88,
      },
      { id: 'emp_init_2', name: 'Liam Kowalski', role: 'Designer', skill: 74, salary: 8000, morale: 85 },
    ];
    if (opts.origin === 'CRYPTO_ARCHITECT') {
      starterEmployees.push({
        id: 'emp_init_3',
        name: 'Devon Sato',
        role: 'Security',
        skill: 84,
        salary: 10800,
        morale: 90,
      });
    } else if (defaultSector === 'MANUFACTURING') {
      starterEmployees.push({
        id: 'emp_init_4',
        name: 'Marcus Bauer',
        role: 'Operator',
        skill: 76,
        salary: 6500,
        morale: 87,
      });
    }

    const features = createSectorFeatures(defaultSector);
    const ticker = tickerFromName(startupName);
    const c: Company = {
      id: 'player_co_1',
      name: startupName,
      ticker,
      sector: defaultSector,
      isPlayerOwned: true,
      isPublic: false,
      stage: 'SEED',
      status: 'ACTIVE',
      foundedDay: 1,
      cash: startCash,
      tBillsInvested: 0,
      debtBalance: 0,
      debtApr: macro.interestRate + 2.5,
      monthlyRevenue: opts.origin === 'CRYPTO_ARCHITECT' ? 18_500 : defaultSector === 'MANUFACTURING' ? 24_000 : 8_200,
      monthlyExpenses: starterEmployees.reduce((s, e) => s + e.salary, 0) + 4500,
      marketingBudget: 2500,
      pricingTier: 'STANDARD',
      valuation: 1_250_000,
      valuationHistory: [1_050_000, 1_150_000, 1_250_000],
      sharesTotal: 10_000_000,
      playerShares: 10_000_000,
      shareholders: [{ holderName: `${founderName} (Founder)`, shares: 10_000_000, isPlayer: true }],
      pricePerShare: 0.13,
      peRatio: 0,
      productQuality: 42,
      securityLevel: opts.origin === 'CRYPTO_ARCHITECT' ? 76 : 55,
      users: opts.origin === 'CRYPTO_ARCHITECT' ? 1450 : 620,
      growthRate: 0.09,
      hype: 48,
      vision: 'BALANCED',
      employees: starterEmployees,
      departmentHeads: createDefaultDeptHeads(rng, false),
      features,
      activeFeatureId: features[0].id,
      exchangeFeeBps: defaultSector === 'CRYPTO_EXCHANGE' ? 25 : undefined,
      dailyVolume: defaultSector === 'CRYPTO_EXCHANGE' ? 380_000 : undefined,
      manufacturing:
        defaultSector === 'MANUFACTURING'
          ? {
              factoryLines: 1,
              utilizationPct: 80,
              unitCost: 38,
              unitPrice: 72,
              defectRatePct: 2.5,
              monthlyUnitsProduced: 800,
              activeContracts: 1,
            }
          : undefined,
      subsidiaries: defaultSector === 'HOLDING_CO' ? [] : undefined,
    };
    c.valuation = computeRealisticValuation(c, macro);
    c.pricePerShare = Number((c.valuation / c.sharesTotal).toFixed(2));
    c.valuationHistory = [Math.round(c.valuation * 0.9), Math.round(c.valuation * 0.95), c.valuation];
    companies.push(c);
    activeCompanyId = c.id;
  }

  // Seed diverse dynamic world companies across Tech, Finance, Manufacturing, Energy & Holdings
  const worldBlueprints: { name: string; sector: VentureSector; stage: 'PUBLIC' | 'GROWTH' | 'SERIES_A' | 'SEED' }[] = [
    { name: 'HyperCloud Systems', sector: 'SAAS', stage: 'PUBLIC' },
    { name: 'Cortex Frontier AI', sector: 'AI_LAB', stage: 'PUBLIC' },
    { name: 'StrataPay Global', sector: 'FINTECH', stage: 'PUBLIC' },
    { name: 'CoinPulse Exchange', sector: 'CRYPTO_EXCHANGE', stage: 'PUBLIC' },
    { name: 'Helios BioLabs', sector: 'BIOTECH', stage: 'PUBLIC' },
    { name: 'Titan Forge Motors', sector: 'MANUFACTURING', stage: 'PUBLIC' },
    { name: 'Veridian Grid Power', sector: 'ENERGY_INFRA', stage: 'PUBLIC' },
    { name: 'PixelForge Interactive', sector: 'GAMING', stage: 'PUBLIC' },
    { name: 'Aether Silicon', sector: 'HARDWARE', stage: 'GROWTH' },
    { name: 'Quorum Ledger', sector: 'FINTECH', stage: 'SERIES_A' },
    { name: 'Nimbus Compute', sector: 'AI_LAB', stage: 'SERIES_A' },
    { name: 'Cobalt Robotics Plant', sector: 'MANUFACTURING', stage: 'SERIES_A' },
    { name: 'Beacon Health', sector: 'BIOTECH', stage: 'SEED' },
    { name: 'VeloDEX Protocol', sector: 'CRYPTO_EXCHANGE', stage: 'SEED' },
  ];

  worldBlueprints.forEach((bp, idx) => {
    companies.push(createWorldCompany(rng, `world_co_${idx}`, bp.sector, bp.stage, 1, macro, bp.name));
  });

  const cryptoCoins = createInitialCryptoMarket(rng);
  if (opts.origin === 'CRYPTO_ARCHITECT') {
    const tokenSymbol = tickerFromName(startupName);
    cryptoCoins.unshift({
      id: 'coin_player_init',
      name: `${startupName} Token`,
      symbol: tokenSymbol,
      creatorCompanyId: 'player_co_1',
      isPlayerCreated: true,
      totalSupply: 100_000_000,
      circulatingSupply: 20_000_000,
      price: 0.45,
      marketCap: 9_000_000,
      hype: 66,
      utility: 58,
      stakingYieldApr: 8.5,
      playerHoldings: 5_000_000,
      priceHistory: [0.35, 0.41, 0.45],
    });
  }

  const playerFunds: PlayerFund[] = [];
  if (opts.origin === 'VC_FINANCIER') {
    playerFunds.push({
      id: 'fund_init_1',
      name: `${founderName.split(' ')[0]} Horizon Fund I`,
      strategy: 'EARLY_VC',
      sectorFocus: 'ALL',
      foundedDay: 1,
      lpCapital: 8_500_000,
      gpCommit: 1_500_000,
      cashAvailable: 10_000_000,
      tBillsAllocated: 0,
      debtBorrowed: 0,
      managementFeePct: 2.0,
      carryPct: 20,
      hurdleRatePct: 8,
      realizedProfits: 0,
      distributedTotal: 0,
      portfolio: [],
      publicHoldings: [],
    });
  }

  const initialOffers: VcOffer[] = [];
  if (activeCompanyId) {
    const offer = generateVcOfferForCompany(companies[0], macro, rng, 1);
    if (offer) initialOffers.push(offer);
  }

  const candidatePool: Employee[] = Array.from({ length: 6 }, (_, i) => generateCandidate(rng, `init_${i}`));

  const startingLiquid =
    opts.origin === 'VC_FINANCIER'
      ? 1_850_000
      : opts.origin === 'CRYPTO_ARCHITECT'
      ? 75_000
      : opts.origin === 'EVERYDAY_WORKER'
      ? 2_200
      : opts.origin === 'BROKE_UNEMPLOYED'
      ? 180
      : 50_000;

  const startingDebt =
    opts.origin === 'BROKE_UNEMPLOYED' ? 4_200 : opts.origin === 'EVERYDAY_WORKER' ? 600 : 0;

  const startingLifestyle =
    opts.origin === 'VC_FINANCIER'
      ? 'PENTHOUSE'
      : opts.origin === 'EVERYDAY_WORKER'
      ? 'SHARED_ROOM'
      : opts.origin === 'BROKE_UNEMPLOYED'
      ? 'COUCH_SURFER'
      : 'LOFT_APARTMENT';

  const startingJob =
    opts.origin === 'EVERYDAY_WORKER'
      ? {
          id: 'job_start_worker',
          title: 'Customer Support Rep',
          employer: 'CloudDesk Support',
          monthlyPay: 3_100,
          stressPerMonth: 8,
          skillRequired: 22,
        }
      : null;

  const jobMarket = generateJobMarket(rng, macro.regime);

  const initialNews: NewsArticle[] = [
    {
      id: 'news_init_1',
      day: 1,
      headline: 'Global Markets Open Steady as Central Bank Holds Policy Rate at 4.25%',
      summary: 'Venture deal flow, public equities, and industrial manufacturing output show balanced momentum.',
      source: 'Pixel Street Journal',
      category: 'ECONOMY',
      affectedSector: 'ALL',
      sentiment: 'POSITIVE',
      marketImpactPct: 1.2,
    },
    {
      id: 'news_init_2',
      day: 1,
      headline: 'Industrial Automation & Holding Roll-Ups Gain Institutional Momentum',
      summary: 'Operators investing in factory robotics and multi-subsidiary holdings report resilient cashflows.',
      source: 'Industrial Dispatch',
      category: 'INDUSTRIAL',
      affectedSector: 'MANUFACTURING',
      sentiment: 'POSITIVE',
      marketImpactPct: 2.4,
    },
  ];

  const baseState: SimState = {
    seed: nextSeed(seed),
    origin: opts.origin,
    totalDays: 1,
    year: 2026,
    month: 1,
    dayOfMonth: 1,
    macro,
    companies,
    activeCompanyId,
    vcOffers: initialOffers,
    cryptoCoins,
    stockPositions: [],
    playerFunds,
    personal: {
      founderName,
      liquidCash: startingLiquid,
      personalDebt: startingDebt,
      tBillsBalance: 0,
      monthlySalaryDraw: startsWithCorporation ? 6500 : 0,
      lifestyleTier: startingLifestyle,
      stress: opts.origin === 'BROKE_UNEMPLOYED' ? 54 : opts.origin === 'EVERYDAY_WORKER' ? 32 : 18,
      energy: opts.origin === 'BROKE_UNEMPLOYED' ? 72 : 92,
      reputation:
        opts.origin === 'VC_FINANCIER'
          ? 68
          : opts.origin === 'EVERYDAY_WORKER'
          ? 24
          : opts.origin === 'BROKE_UNEMPLOYED'
          ? 8
          : 42,
      networkScore:
        opts.origin === 'VC_FINANCIER'
          ? 76
          : opts.origin === 'EVERYDAY_WORKER'
          ? 22
          : opts.origin === 'BROKE_UNEMPLOYED'
          ? 10
          : 45,
      skillLevel:
        opts.origin === 'BROKE_UNEMPLOYED' ? 8 : opts.origin === 'EVERYDAY_WORKER' ? 26 : 65,
      currentJob: startingJob,
      jobApplicationsSent: 0,
      jobRejections: 0,
      lastJobFeedback:
        opts.origin === 'BROKE_UNEMPLOYED'
          ? 'Down to $180 with $4.2K debt and low skills. Expect tough job rejections until you study or grind odd gigs.'
          : opts.origin === 'EVERYDAY_WORKER'
          ? 'Living paycheck to paycheck on $3,100/mo. Pick up freelance gigs or save $450 to launch your first online store.'
          : null,
      gigsCompleted: 0,
      assetsOwned: [],
      netWorthHistory: [],
    },
    events: [
      {
        id: 'evt_welcome',
        day: 1,
        title: 'Sandbox Simulation Live',
        description:
          opts.origin === 'VC_FINANCIER'
            ? 'Your $10M Venture Fund is open. Deploy capital, use leverage, take board control, or launch companies.'
            : opts.origin === 'EVERYDAY_WORKER'
            ? 'Working a 9-to-5 paycheck job. Hustle freelance gigs, study skills, or bootstrap an online store.'
            : opts.origin === 'BROKE_UNEMPLOYED'
            ? 'Started broke and unemployed with $180 cash and $4.2K debt. Scrape by on odd gigs, learn skills, and fight for work.'
            : `${startupName} opened its doors. Micromanage operations or delegate to automated Department Heads.`,
        category: 'PERSONAL',
        sentiment: opts.origin === 'BROKE_UNEMPLOYED' ? 'NEGATIVE' : 'POSITIVE',
      },
    ],
    newsFeed: initialNews,
    pendingDecisions: [],
    candidatePool,
    jobMarket,
    isGameOver: false,
  };

  baseState.personal.netWorthHistory = [computeFounderNetWorth(baseState)];
  return baseState;
}

function tickerFromName(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, '').toUpperCase();
  return (letters.slice(0, 4) || 'PXLC').padEnd(3, 'X');
}

export function computeFundNav(fund: PlayerFund, companies: Company[]): number {
  let nav = fund.cashAvailable + fund.tBillsAllocated - fund.debtBorrowed;
  for (const inv of fund.portfolio) {
    const target = companies.find((c) => c.id === inv.companyId);
    if (target && target.status === 'ACTIVE') {
      nav += target.valuation * (inv.equityPercent / 100);
    }
  }
  for (const pub of fund.publicHoldings) {
    const target = companies.find((c) => c.id === pub.companyId && c.status === 'ACTIVE');
    if (target) {
      nav += pub.shares * target.pricePerShare;
    }
  }
  return Math.max(0, Math.round(nav));
}

export function computeFounderNetWorth(state: SimState): number {
  let total = state.personal.liquidCash + state.personal.tBillsBalance - state.personal.personalDebt;

  for (const c of state.companies) {
    if (c.status === 'ACTIVE' && c.playerShares > 0) {
      total += (c.playerShares / c.sharesTotal) * c.valuation;
    }
  }

  for (const pos of state.stockPositions) {
    const comp = state.companies.find((c) => c.id === pos.companyId);
    if (!comp || comp.status !== 'ACTIVE') continue;
    if (pos.shares > 0) {
      total += pos.shares * comp.pricePerShare;
    } else if (pos.shares < 0) {
      const absShares = Math.abs(pos.shares);
      total += absShares * (pos.avgEntryPrice - comp.pricePerShare);
    }
  }

  for (const coin of state.cryptoCoins) {
    total += coin.playerHoldings * coin.price;
  }

  for (const fund of state.playerFunds) {
    const nav = computeFundNav(fund, state.companies);
    const totalCommit = fund.lpCapital + fund.gpCommit;
    const gpShare = totalCommit > 0 ? fund.gpCommit / totalCommit : 0.1;
    const profit = Math.max(0, nav - totalCommit);
    total += nav * gpShare + profit * (fund.carryPct / 100);
  }

  for (const assetId of state.personal.assetsOwned) {
    const item = PERSONAL_ASSETS_CATALOG.find((a) => a.id === assetId);
    if (item) total += item.price;
  }

  return Math.round(total);
}

function addEvent(events: WorldEvent[], evt: WorldEvent): WorldEvent[] {
  return [evt, ...events].slice(0, 60);
}

function addNews(news: NewsArticle[], article: NewsArticle): NewsArticle[] {
  return [article, ...news].slice(0, 50);
}

function runDelegatedDepartmentHeads(
  company: Company,
  macro: SimState['macro'],
  totalDays: number,
  rng: () => number,
  events: WorldEvent[]
): { company: Company; newOffer?: VcOffer; events: WorldEvent[] } {
  const c = { ...company, features: company.features.map((f) => ({ ...f })), employees: [...company.employees] };
  let newEvents = events;
  let newOffer: VcOffer | undefined;

  const netBurn = Math.max(1, c.monthlyExpenses - c.monthlyRevenue);
  const runwayMonths = c.monthlyRevenue >= c.monthlyExpenses ? 99 : c.cash / netBurn;

  if (c.departmentHeads.CTO.hired && c.departmentHeads.CTO.delegated) {
    const active = c.features.find((f) => f.id === c.activeFeatureId && !f.completed);
    if (!active) {
      const nextFeature = c.features.find((f) => !f.completed);
      if (nextFeature) c.activeFeatureId = nextFeature.id;
    }
  }

  if (c.departmentHeads.CMO.hired && c.departmentHeads.CMO.delegated) {
    const cmoSkillMult = 0.8 + (c.departmentHeads.CMO.skill / 100) * 0.35;
    if (c.vision === 'HYPERGROWTH' && runwayMonths > 5) {
      c.marketingBudget = Math.round(Math.min(c.cash * 0.15, Math.max(5000, c.monthlyRevenue * 0.35 * cmoSkillMult)));
    } else if (c.vision === 'PROFITABILITY' || runwayMonths < 6) {
      c.marketingBudget = Math.round(Math.max(1000, c.monthlyRevenue * 0.08));
    } else {
      c.marketingBudget = Math.round(Math.min(c.cash * 0.09, Math.max(3000, c.monthlyRevenue * 0.2)));
    }
  }

  if (c.departmentHeads.COO.hired && c.departmentHeads.COO.delegated) {
    if (runwayMonths > 8 && c.employees.length < 28 && c.cash > 90_000) {
      const neededRole =
        c.sector === 'MANUFACTURING'
          ? 'Operator'
          : c.sector === 'CRYPTO_EXCHANGE' && c.securityLevel < 75
          ? 'Security'
          : c.employees.filter((e) => e.role === 'Engineer').length <= c.employees.filter((e) => e.role === 'Marketer').length
          ? 'Engineer'
          : 'Marketer';
      const newHire = generateCandidate(rng, `auto_${totalDays}`);
      newHire.role = neededRole;
      c.employees.push(newHire);
      newEvents = addEvent(newEvents, {
        id: `evt_autohire_${c.id}_${totalDays}`,
        day: totalDays,
        title: `COO Hired ${newHire.name} (${newHire.role})`,
        description: `Automated hiring at ${c.name} added a skill-${newHire.skill} ${newHire.role}.`,
        category: 'STARTUP',
        sentiment: 'POSITIVE',
      });
    }
  }

  if (c.departmentHeads.CFO.hired && c.departmentHeads.CFO.delegated && !c.isPublic) {
    if (runwayMonths < 9 && rng() < 0.75) {
      const offer = generateVcOfferForCompany(c, macro, rng, totalDays);
      if (offer) {
        newOffer = { ...offer, preMoneyValuation: Math.round(offer.preMoneyValuation * 1.08) };
      }
    }
  }

  return { company: c, newOffer, events: newEvents };
}

function advanceSingleDay(state: SimState): SimState {
  const rng = createRng(state.seed);
  const totalDays = state.totalDays + 1;
  let dayOfMonth = state.dayOfMonth + 1;
  let month = state.month;
  let year = state.year;
  let isMonthBoundary = false;

  if (dayOfMonth > 30) {
    dayOfMonth = 1;
    month += 1;
    isMonthBoundary = true;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  let events = [...state.events];
  let newsFeed = [...state.newsFeed];
  let pendingDecisions = [...state.pendingDecisions];
  let vcOffers = state.vcOffers.filter((o) => o.expiryDay >= totalDays);
  let macro = state.macro;

  let companies = stepPublicPricesDaily(state.companies, macro, rng);
  const cryptoCoins = stepCryptoCoinsDaily(state.cryptoCoins, macro, rng);

  // Daily sprint & exchange fee accrual
  companies = companies.map((comp) => {
    if (!comp.isPlayerOwned || comp.status !== 'ACTIVE') return comp;

    const c = {
      ...comp,
      features: comp.features.map((f) => ({ ...f })),
      valuationHistory: [...comp.valuationHistory],
    };

    const builders = c.employees.filter(
      (e) => e.role === 'Engineer' || e.role === 'Quant' || e.role === 'Security' || e.role === 'Operator'
    );
    const ctoBoost = c.departmentHeads.CTO.hired ? c.departmentHeads.CTO.skill * 0.08 : 0;
    const visionSpeed = c.vision === 'RND_MOAT' ? 1.35 : c.vision === 'HYPERGROWTH' ? 1.05 : 1.0;
    const engOutput =
      (builders.reduce((sum, e) => sum + (e.skill / 22) * (e.morale / 100), 0) + 1.8 + ctoBoost) * visionSpeed;

    if (c.activeFeatureId) {
      const feat = c.features.find((f) => f.id === c.activeFeatureId && !f.completed);
      if (feat) {
        feat.progress += engOutput;
        if (feat.progress >= feat.maxProgress) {
          feat.progress = feat.maxProgress;
          feat.completed = true;
          c.productQuality = Math.min(100, c.productQuality + feat.qualityBoost);
          c.growthRate = Number(Math.min(0.28, c.growthRate + feat.growthBoost).toFixed(3));
          c.hype = Math.min(100, c.hype + 8);
          if (feat.category === 'SECURITY') {
            c.securityLevel = Math.min(100, c.securityLevel + 18);
          }
          if (c.manufacturing && feat.category === 'INDUSTRIAL') {
            c.manufacturing = {
              ...c.manufacturing,
              defectRatePct: Number(Math.max(0.4, c.manufacturing.defectRatePct - 0.6).toFixed(1)),
              unitCost: Math.max(18, Math.round(c.manufacturing.unitCost * 0.92)),
            };
          }
          c.activeFeatureId = null;
          events = addEvent(events, {
            id: `evt_feat_${c.id}_${feat.id}_${totalDays}`,
            day: totalDays,
            title: `${c.name} Shipped ${feat.name}`,
            description: `Quality rose to ${c.productQuality}/100 and growth improved by +${(feat.growthBoost * 100).toFixed(1)}%.`,
            category: 'STARTUP',
            sentiment: 'POSITIVE',
          });
        }
      }
    }

    if (c.sector === 'CRYPTO_EXCHANGE') {
      const feeBps = c.exchangeFeeBps ?? 25;
      const baseVol = Math.min(250_000_000, c.users * 180 * macro.cryptoSentiment * (0.7 + c.productQuality / 100));
      c.dailyVolume = Math.round(baseVol * (0.85 + rng() * 0.3));
      const dailyFees = c.dailyVolume * (feeBps / 10_000);
      c.cash += Math.round(dailyFees);
    }

    return c;
  });

  let personal = {
    ...state.personal,
    energy: Math.min(100, state.personal.energy + (state.personal.stress > 80 ? 8 : 14)),
    netWorthHistory: [...state.personal.netWorthHistory],
  };
  let playerFunds = state.playerFunds.map((f) => ({
    ...f,
    portfolio: [...f.portfolio],
    publicHoldings: [...f.publicHoldings],
  }));
  let candidatePool = state.candidatePool;
  let jobMarket = state.jobMarket;
  let isGameOver = state.isGameOver;
  let gameOverReason = state.gameOverReason;

  // Monthly settlement
  if (isMonthBoundary) {
    const macroStep = stepMacroMonthly(macro, rng, totalDays);
    macro = macroStep.macro;
    if (macroStep.event) events = addEvent(events, macroStep.event);
    if (macroStep.news) newsFeed = addNews(newsFeed, macroStep.news);

    // Generate monthly global breaking news wire + commodity impact
    const newsGen = generateMonthlyNews(macro, rng, totalDays);
    newsFeed = addNews(newsFeed, newsGen.article);
    if (newsGen.commodityDelta !== 0) {
      macro.commodityIndex = Number(
        Math.max(0.75, Math.min(1.45, macro.commodityIndex + newsGen.commodityDelta)).toFixed(2)
      );
    }

    candidatePool = Array.from({ length: 6 }, (_, i) => generateCandidate(rng, `m_${totalDays}_${i}`));
    jobMarket = generateJobMarket(rng, macro.regime);

    const updatedPlayerCompanies: Company[] = [];
    for (const comp of companies) {
      if (!comp.isPlayerOwned || comp.status !== 'ACTIVE') {
        updatedPlayerCompanies.push(comp);
        continue;
      }

      const deptResult = runDelegatedDepartmentHeads(comp, macro, totalDays, rng, events);
      const c = deptResult.company;
      events = deptResult.events;
      if (deptResult.newOffer) vcOffers.push(deptResult.newOffer);

      const marketers = c.employees.filter((e) => e.role === 'Marketer' || e.role === 'Sales');
      const mktSkill = marketers.reduce((s, e) => s + e.skill, 0);
      const cmoMult = c.departmentHeads.CMO.hired ? 1 + c.departmentHeads.CMO.skill / 220 : 1;
      const mktGrowth = (Math.sqrt(Math.max(0, c.marketingBudget)) / 520 + mktSkill / 2600) * cmoMult;
      const qualityRetention = (c.productQuality - 38) / 520;
      const rawRate = c.growthRate * 0.55 + mktGrowth + qualityRetention;

      // Logistic TAM-saturated user growth (prevents runaway quadrillions)
      c.users = applyLogisticUserGrowth(c.users, c.sector, rawRate, macro);

      let subRev = 0;
      let mfgCogs = 0;
      if (c.sector === 'MANUFACTURING' && c.manufacturing) {
        const operators = c.employees.filter((e) => e.role === 'Operator').length;
        const staffCapFactor = Math.min(1.2, 0.6 + operators * 0.12);
        const rawUnits = Math.round(
          c.manufacturing.factoryLines * 950 * (c.manufacturing.utilizationPct / 100) * staffCapFactor
        );
        const goodUnits = Math.round(rawUnits * (1 - c.manufacturing.defectRatePct / 100));
        const contractDemand = Math.round(c.users * 0.8 + c.manufacturing.activeContracts * 650);
        const unitsSold = Math.min(goodUnits, contractDemand);
        const effectiveUnitCost = Math.round(c.manufacturing.unitCost * macro.commodityIndex);
        subRev = unitsSold * c.manufacturing.unitPrice;
        mfgCogs = goodUnits * effectiveUnitCost;
        c.manufacturing = {
          ...c.manufacturing,
          monthlyUnitsProduced: goodUnits,
        };
      } else if (c.sector === 'HOLDING_CO') {
        const subDividends = (c.subsidiaries ?? []).reduce((s, sub) => s + sub.monthlyDividend, 0);
        const advisoryFees = c.users * 12;
        subRev = subDividends + advisoryFees;
      } else {
        const arpu = PRICING_ARPU[c.pricingTier];
        const conversion =
          c.pricingTier === 'FREEMIUM' ? 0.13 : c.pricingTier === 'STANDARD' ? 0.28 : 0.08;
        subRev = c.users * conversion * arpu * (0.75 + c.productQuality / 160);
      }

      const exchangeMonthlyFeeRev =
        c.sector === 'CRYPTO_EXCHANGE' ? (c.dailyVolume ?? 100_000) * ((c.exchangeFeeBps ?? 25) / 10_000) * 30 : 0;

      c.monthlyRevenue = Math.round(subRev + exchangeMonthlyFeeRev);

      const payroll = c.employees.reduce((s, e) => s + e.salary, 0);
      const deptHeadPayroll = Object.values(c.departmentHeads)
        .filter((d) => d.hired)
        .reduce((s, d) => s + d.salary, 0);
      // Realistic scale operating overhead (micro solo stores pay minimal hosting fee)
      const isMicroSolo = c.employees.length === 0 && c.valuation < 250_000;
      const scaleInfra = Math.round(c.monthlyRevenue * (c.sector === 'HOLDING_CO' ? 0.08 : 0.24));
      const officeOverhead = isMicroSolo
        ? 45 + Math.round(c.monthlyRevenue * 0.14)
        : 3500 + c.employees.length * 480 + scaleInfra;
      const debtInterest = Math.round((c.debtBalance * (c.debtApr / 100)) / 12);
      const cfoEfficiency = c.departmentHeads.CFO.hired ? 1 - (c.departmentHeads.CFO.skill / 100) * 0.12 : 1;

      const preTaxExpenses = Math.round(
        (payroll + deptHeadPayroll + officeOverhead + c.marketingBudget + mfgCogs) * cfoEfficiency + debtInterest
      );
      const netBeforeTax = c.monthlyRevenue - preTaxExpenses;
      const corpTax = netBeforeTax > 0 ? Math.round(netBeforeTax * 0.21) : 0;
      c.monthlyExpenses = preTaxExpenses + corpTax;

      // Company T-Bill monthly yield
      const tBillYield = Math.round((c.tBillsInvested * (macro.interestRate / 100)) / 12);
      c.cash += Math.round(subRev - c.monthlyExpenses + tBillYield);

      if (c.sector === 'CRYPTO_EXCHANGE' && c.securityLevel < 45 && rng() < 0.07) {
        const loss = Math.round(c.cash * 0.25);
        c.cash = Math.max(0, c.cash - loss);
        c.hype = Math.max(5, c.hype - 20);
        events = addEvent(events, {
          id: `evt_hack_${c.id}_${totalDays}`,
          day: totalDays,
          title: `Security Breach at ${c.name}!`,
          description: `Low security (${c.securityLevel}/100) led to $${loss.toLocaleString()} drained from hot wallets.`,
          category: 'CRYPTO',
          sentiment: 'NEGATIVE',
        });
      }

      if (c.cash < 0) {
        c.status = 'BANKRUPT';
        c.cash = 0;
        c.valuation = 0;
        c.pricePerShare = 0;
        events = addEvent(events, {
          id: `evt_pbankrupt_${c.id}_${totalDays}`,
          day: totalDays,
          title: `${c.name} Ran Out of Runway`,
          description: `${c.name} became insolvent and ceased operations.`,
          category: 'STARTUP',
          sentiment: 'NEGATIVE',
        });
      } else {
        c.valuation = computeRealisticValuation(c, macro);
        c.pricePerShare = Number(Math.max(0.05, c.valuation / c.sharesTotal).toFixed(2));
        c.peRatio = calculateCompanyPeRatio(c);
        c.valuationHistory.push(c.valuation);
        if (c.valuationHistory.length > 24) c.valuationHistory.shift();

        if (!c.isPublic && vcOffers.filter((o) => o.companyId === c.id).length < 2 && rng() < 0.35) {
          const offer = generateVcOfferForCompany(c, macro, rng, totalDays);
          if (offer) vcOffers.push(offer);
        }

        // Spawn occasional interactive CEO News Decision (cap queue at 3)
        if (pendingDecisions.length < 3 && rng() < 0.22) {
          pendingDecisions.push(generatePendingDecision(c, totalDays, rng));
        }
      }

      updatedPlayerCompanies.push(c);
    }

    companies = updatedPlayerCompanies;

    const worldStep = stepWorldCompaniesMonthly({ ...state, companies, macro, totalDays }, rng);
    companies = worldStep.companies;
    for (const we of worldStep.newEvents) events = addEvent(events, we);
    for (const na of worldStep.newArticles) newsFeed = addNews(newsFeed, na);

    // Update Holding Company subsidiary monthly dividends dynamically based on subsidiary performance
    companies = companies.map((c) => {
      if (!c.isPlayerOwned || !c.subsidiaries || c.subsidiaries.length === 0) return c;
      const updatedSubs = c.subsidiaries.map((sub) => {
        const subCo = companies.find((x) => x.id === sub.companyId);
        if (!subCo || subCo.status !== 'ACTIVE') return { ...sub, monthlyDividend: 0 };
        const profit = Math.max(0, subCo.monthlyRevenue - subCo.monthlyExpenses);
        return {
          ...sub,
          monthlyDividend: Math.round(profit * (sub.ownershipPct / 100) * 0.65),
        };
      });
      return { ...c, subsidiaries: updatedSubs };
    });

    // Fund fees, T-bill yield, leverage interest, & exits
    playerFunds = playerFunds.map((fund) => {
      const nextFund = {
        ...fund,
        portfolio: [...fund.portfolio],
        publicHoldings: [...fund.publicHoldings],
      };
      const totalAum = nextFund.lpCapital + nextFund.gpCommit;
      const monthlyMgmtFee = Math.round((totalAum * (nextFund.managementFeePct / 100)) / 12);
      const fundTBillInterest = Math.round((nextFund.tBillsAllocated * (macro.interestRate / 100)) / 12);
      const fundDebtInterest = Math.round((nextFund.debtBorrowed * ((macro.interestRate + 2.0) / 100)) / 12);

      personal.liquidCash += Math.round(monthlyMgmtFee * 0.6);
      nextFund.cashAvailable = Math.max(
        0,
        nextFund.cashAvailable + fundTBillInterest - fundDebtInterest - Math.round(monthlyMgmtFee * 0.4)
      );

      const remainingPortfolio = [];
      for (const inv of nextFund.portfolio) {
        const payout = worldStep.fundPayouts[inv.companyId];
        if (payout) {
          const proceeds = Math.round(payout * (inv.equityPercent / 100));
          const gain = Math.max(0, proceeds - inv.costBasis);
          const carry = Math.round(gain * (nextFund.carryPct / 100));
          nextFund.cashAvailable += proceeds - carry;
          nextFund.realizedProfits += gain;
          personal.liquidCash += carry;
          events = addEvent(events, {
            id: `evt_carry_${fund.id}_${inv.companyId}_${totalDays}`,
            day: totalDays,
            title: `${fund.name} Realized Exit Carry!`,
            description: `Exit of ${inv.companyName} returned $${proceeds.toLocaleString()} to fund and $${carry.toLocaleString()} carry to you.`,
            category: 'MARKET',
            sentiment: 'POSITIVE',
          });
        } else {
          const target = companies.find((c) => c.id === inv.companyId);
          if (!target || target.status !== 'BANKRUPT') remainingPortfolio.push(inv);
        }
      }
      nextFund.portfolio = remainingPortfolio;
      return nextFund;
    });

    // Personal Life monthly cashflow + T-Bill interest
    const lifestyle = LIFESTYLE_COSTS[personal.lifestyleTier];
    const assetUpkeep = personal.assetsOwned.reduce((sum, aid) => {
      const a = PERSONAL_ASSETS_CATALOG.find((x) => x.id === aid);
      return sum + (a ? a.monthlyUpkeep : 0);
    }, 0);

    let actualSalary = 0;
    const primaryCo = companies.find((c) => c.id === state.activeCompanyId && c.isPlayerOwned && c.status === 'ACTIVE');
    if (primaryCo && primaryCo.cash > personal.monthlySalaryDraw) {
      primaryCo.cash -= personal.monthlySalaryDraw;
      actualSalary = personal.monthlySalaryDraw;
    }

    const personalTBillInterest = Math.round((personal.tBillsBalance * (macro.interestRate / 100)) / 12);
    const jobTakeHome = personal.currentJob ? Math.round(personal.currentJob.monthlyPay * 0.86) : 0;
    const jobStress = personal.currentJob ? personal.currentJob.stressPerMonth : 2;
    if (personal.currentJob && personal.skillLevel < 75) {
      personal.skillLevel = Math.min(75, personal.skillLevel + 1);
    }

    // Personal debt monthly compounding interest (18% APR -> 1.5%/mo)
    if (personal.personalDebt > 0) {
      personal.personalDebt = Math.round(personal.personalDebt * 1.015);
    }

    personal.liquidCash += actualSalary + jobTakeHome + personalTBillInterest - lifestyle.monthlyCost - assetUpkeep;

    const activePlayerCos = companies.filter((c) => c.isPlayerOwned && c.status === 'ACTIVE');
    const delegatedCount = activePlayerCos.reduce(
      (cnt, c) => cnt + Object.values(c.departmentHeads).filter((d) => d.hired && d.delegated).length,
      0
    );
    const workStress = activePlayerCos.length * 5 - delegatedCount * 1.4;
    personal.stress = Math.max(0, Math.min(100, Math.round(personal.stress + workStress + jobStress + lifestyle.stressDelta)));
    personal.energy = Math.max(
      15,
      Math.min(100, Math.round(personal.energy - (personal.stress > 75 ? 4 : 0) + (delegatedCount > 0 ? 4 : 0)))
    );

    const nw = computeFounderNetWorth({
      ...state,
      companies,
      cryptoCoins,
      playerFunds,
      personal,
    });
    personal.netWorthHistory.push(nw);
    if (personal.netWorthHistory.length > 36) personal.netWorthHistory.shift();

    if (
      personal.liquidCash - personal.personalDebt < -65_000 &&
      activePlayerCos.length === 0 &&
      playerFunds.length === 0 &&
      !personal.currentJob
    ) {
      isGameOver = true;
      gameOverReason = 'Personal insolvency with overwhelming debt and no active income or ventures.';
    }
  }

  return {
    ...state,
    seed: nextSeed(state.seed),
    totalDays,
    year,
    month,
    dayOfMonth,
    macro,
    companies,
    vcOffers,
    cryptoCoins,
    playerFunds,
    personal,
    events,
    newsFeed,
    pendingDecisions,
    candidatePool,
    jobMarket,
    isGameOver,
    gameOverReason,
  };
}

export function advanceTime(state: SimState, days: number): SimState {
  if (state.isGameOver) return state;
  let curr = state;
  const clamped = Math.max(1, Math.min(365, Math.floor(days)));
  for (let i = 0; i < clamped; i++) {
    curr = advanceSingleDay(curr);
    if (curr.isGameOver) break;
  }
  return curr;
}

// --- Core Venture Actions ---

export function switchActiveVenture(state: SimState, companyId: string): SimState {
  const exists = state.companies.some((c) => c.id === companyId && c.isPlayerOwned && c.status === 'ACTIVE');
  if (!exists) return state;
  return { ...state, activeCompanyId: companyId };
}

export function setCompanyVision(state: SimState, companyId: string, vision: StrategicVision): SimState {
  return {
    ...state,
    companies: state.companies.map((c) => (c.id === companyId && c.isPlayerOwned ? { ...c, vision } : c)),
  };
}

export function setPricingTier(state: SimState, companyId: string, pricingTier: PricingTier): SimState {
  return {
    ...state,
    companies: state.companies.map((c) => (c.id === companyId && c.isPlayerOwned ? { ...c, pricingTier } : c)),
  };
}

export function setMarketingBudget(state: SimState, companyId: string, budget: number): SimState {
  const clean = Math.max(0, Math.round(budget));
  return {
    ...state,
    companies: state.companies.map((c) =>
      c.id === companyId && c.isPlayerOwned ? { ...c, marketingBudget: clean } : c
    ),
  };
}

export function setExchangeFeeBps(state: SimState, companyId: string, feeBps: number): SimState {
  const clean = Math.max(5, Math.min(150, Math.round(feeBps)));
  return {
    ...state,
    companies: state.companies.map((c) =>
      c.id === companyId && c.isPlayerOwned && c.sector === 'CRYPTO_EXCHANGE'
        ? { ...c, exchangeFeeBps: clean }
        : c
    ),
  };
}

// --- Manufacturing & Corporate Treasury Actions ---

export function addManufacturingLine(state: SimState, companyId: string): SimState {
  const cost = 120_000;
  return {
    ...state,
    companies: state.companies.map((c) => {
      if (c.id !== companyId || !c.isPlayerOwned || !c.manufacturing || c.cash < cost) return c;
      return {
        ...c,
        cash: c.cash - cost,
        manufacturing: {
          ...c.manufacturing,
          factoryLines: c.manufacturing.factoryLines + 1,
        },
      };
    }),
  };
}

export function setFactoryUtilization(state: SimState, companyId: string, pct: number): SimState {
  const clean = Math.max(20, Math.min(100, Math.round(pct)));
  return {
    ...state,
    companies: state.companies.map((c) =>
      c.id === companyId && c.isPlayerOwned && c.manufacturing
        ? { ...c, manufacturing: { ...c.manufacturing, utilizationPct: clean } }
        : c
    ),
  };
}

export function signSupplyContract(state: SimState, companyId: string): SimState {
  const fee = 15_000;
  return {
    ...state,
    companies: state.companies.map((c) => {
      if (c.id !== companyId || !c.isPlayerOwned || !c.manufacturing || c.cash < fee) return c;
      return {
        ...c,
        cash: c.cash - fee,
        manufacturing: {
          ...c.manufacturing,
          activeContracts: c.manufacturing.activeContracts + 1,
        },
      };
    }),
  };
}

export function takeCompanyLoan(state: SimState, companyId: string, amount: number): SimState {
  const clean = Math.max(25_000, Math.round(amount));
  const comp = state.companies.find((c) => c.id === companyId && c.isPlayerOwned && c.status === 'ACTIVE');
  if (!comp) return state;
  const maxDebt = Math.max(250_000, Math.round(comp.valuation * 0.35));
  if (comp.debtBalance + clean > maxDebt) return state;

  return {
    ...state,
    companies: state.companies.map((c) =>
      c.id === companyId
        ? {
            ...c,
            cash: c.cash + clean,
            debtBalance: c.debtBalance + clean,
            debtApr: Number((state.macro.interestRate + 2.5).toFixed(2)),
          }
        : c
    ),
    events: addEvent(state.events, {
      id: `evt_loan_${companyId}_${state.totalDays}`,
      day: state.totalDays,
      title: `${comp.name} Drew $${clean.toLocaleString()} Credit Facility`,
      description: `Corporate debt facility opened at ${(state.macro.interestRate + 2.5).toFixed(2)}% APR.`,
      category: 'STARTUP',
      sentiment: 'NEUTRAL',
    }),
  };
}

export function repayCompanyLoan(state: SimState, companyId: string, amount: number): SimState {
  const comp = state.companies.find((c) => c.id === companyId && c.isPlayerOwned && c.status === 'ACTIVE');
  if (!comp || comp.debtBalance <= 0) return state;
  const pay = Math.min(comp.debtBalance, Math.min(comp.cash, Math.round(amount)));
  if (pay <= 0) return state;

  return {
    ...state,
    companies: state.companies.map((c) =>
      c.id === companyId ? { ...c, cash: c.cash - pay, debtBalance: c.debtBalance - pay } : c
    ),
  };
}

export function allocateCompanyTBills(state: SimState, companyId: string, delta: number): SimState {
  const comp = state.companies.find((c) => c.id === companyId && c.isPlayerOwned && c.status === 'ACTIVE');
  if (!comp) return state;
  if (delta > 0 && comp.cash < delta) return state;
  if (delta < 0 && comp.tBillsInvested < Math.abs(delta)) return state;

  return {
    ...state,
    companies: state.companies.map((c) =>
      c.id === companyId ? { ...c, cash: c.cash - delta, tBillsInvested: c.tBillsInvested + delta } : c
    ),
  };
}

export function acquireCompanyIntoParent(
  state: SimState,
  parentCompanyId: string,
  targetCompanyId: string
): SimState {
  const parent = state.companies.find((c) => c.id === parentCompanyId && c.isPlayerOwned && c.status === 'ACTIVE');
  const target = state.companies.find((c) => c.id === targetCompanyId && !c.isPlayerOwned && c.status === 'ACTIVE');
  if (!parent || !target) return state;

  const buyoutPrice = Math.round(target.valuation * 1.15);
  if (parent.cash < buyoutPrice) return state;

  const estProfit = Math.max(1500, Math.round((target.monthlyRevenue - target.monthlyExpenses) * 0.65));

  return {
    ...state,
    companies: state.companies.map((c) => {
      if (c.id === parentCompanyId) {
        return {
          ...c,
          cash: c.cash - buyoutPrice,
          subsidiaries: [
            ...(c.subsidiaries ?? []),
            {
              companyId: target.id,
              name: target.name,
              sector: target.sector,
              ownershipPct: 100,
              monthlyDividend: estProfit,
              acquisitionPrice: buyoutPrice,
            },
          ],
        };
      }
      if (c.id === targetCompanyId) {
        return {
          ...c,
          status: 'ACQUIRED',
          acquiredBy: parent.name,
          parentCompanyId: parent.id,
        };
      }
      return c;
    }),
    newsFeed: addNews(state.newsFeed, {
      id: `news_acq_${target.id}_${state.totalDays}`,
      day: state.totalDays,
      headline: `${parent.name} Acquires ${target.name} in $${(buyoutPrice / 1_000_000).toFixed(2)}M Deal`,
      summary: `${target.name} joins ${parent.name} as a wholly-owned dividend-paying subsidiary.`,
      source: 'Pixel Street Journal',
      category: 'MARKETS',
      affectedSector: target.sector,
      sentiment: 'POSITIVE',
      marketImpactPct: 2.5,
    }),
  };
}

export function startFeatureSprint(state: SimState, companyId: string, featureId: string): SimState {
  return {
    ...state,
    companies: state.companies.map((c) => {
      if (c.id !== companyId || !c.isPlayerOwned) return c;
      const valid = c.features.some((f) => f.id === featureId && !f.completed);
      return valid ? { ...c, activeFeatureId: featureId } : c;
    }),
  };
}

export function hireDepartmentHead(state: SimState, companyId: string, role: DepartmentRole): SimState {
  const rng = createRng(state.seed);
  return {
    ...state,
    seed: nextSeed(state.seed),
    companies: state.companies.map((c) => {
      if (c.id !== companyId || !c.isPlayerOwned) return c;
      const head = c.departmentHeads[role];
      if (head.hired || c.cash < head.salary * 2) return c;
      const signingBonus = head.salary;
      const names = ['Elena Vance', 'Marcus Park', 'Priya Nair', 'Julian Mercer', 'Sora Sato', 'Arjun Das'];
      const chosenName = names[Math.floor(rng() * names.length)];
      return {
        ...c,
        cash: c.cash - signingBonus,
        departmentHeads: {
          ...c.departmentHeads,
          [role]: {
            ...head,
            hired: true,
            name: chosenName,
            skill: Math.round(72 + rng() * 22),
            delegated: true,
          },
        },
      };
    }),
  };
}

export function toggleDepartmentDelegation(state: SimState, companyId: string, role: DepartmentRole): SimState {
  return {
    ...state,
    companies: state.companies.map((c) => {
      if (c.id !== companyId || !c.isPlayerOwned) return c;
      const head = c.departmentHeads[role];
      if (!head.hired) return c;
      return {
        ...c,
        departmentHeads: {
          ...c.departmentHeads,
          [role]: { ...head, delegated: !head.delegated },
        },
      };
    }),
  };
}

export function hireEmployee(state: SimState, companyId: string, candidateId: string): SimState {
  const cand = state.candidatePool.find((e) => e.id === candidateId);
  if (!cand) return state;
  const target = state.companies.find((c) => c.id === companyId && c.isPlayerOwned && c.status === 'ACTIVE');
  if (!target || target.cash < cand.salary) return state;

  const rng = createRng(state.seed);
  return {
    ...state,
    seed: nextSeed(state.seed),
    companies: state.companies.map((c) =>
      c.id === companyId
        ? {
            ...c,
            cash: c.cash - Math.round(cand.salary * 0.5),
            employees: [...c.employees, cand],
            securityLevel: cand.role === 'Security' ? Math.min(100, c.securityLevel + 10) : c.securityLevel,
          }
        : c
    ),
    candidatePool: state.candidatePool.map((e) =>
      e.id === candidateId ? generateCandidate(rng, `rep_${state.totalDays}`) : e
    ),
  };
}

export function fireEmployee(state: SimState, companyId: string, employeeId: string): SimState {
  return {
    ...state,
    companies: state.companies.map((c) =>
      c.id === companyId && c.isPlayerOwned
        ? { ...c, employees: c.employees.filter((e) => e.id !== employeeId) }
        : c
    ),
  };
}

export function acceptVcOffer(state: SimState, offerId: string): SimState {
  const offer = state.vcOffers.find((o) => o.id === offerId);
  if (!offer) return state;
  const company = state.companies.find((c) => c.id === offer.companyId && c.isPlayerOwned && c.status === 'ACTIVE');
  if (!company) return state;

  const newShareFraction = offer.equityPercent / 100;
  const newSharesIssued = Math.round((company.sharesTotal * newShareFraction) / (1 - newShareFraction));
  const updatedTotalShares = company.sharesTotal + newSharesIssued;
  const postMoneyVal = offer.preMoneyValuation + offer.amount;

  const nextStage =
    company.stage === 'SEED'
      ? 'SERIES_A'
      : company.stage === 'SERIES_A'
      ? 'SERIES_B'
      : company.stage === 'SERIES_B'
      ? 'GROWTH'
      : company.stage;

  return {
    ...state,
    vcOffers: state.vcOffers.filter((o) => o.id !== offerId),
    companies: state.companies.map((c) =>
      c.id === company.id
        ? {
            ...c,
            stage: nextStage,
            cash: c.cash + offer.amount,
            valuation: postMoneyVal,
            sharesTotal: updatedTotalShares,
            pricePerShare: Number((postMoneyVal / updatedTotalShares).toFixed(2)),
            shareholders: [
              ...c.shareholders,
              { holderName: `${offer.firmName} (${offer.roundName})`, shares: newSharesIssued, isPlayer: false },
            ],
          }
        : c
    ),
    events: addEvent(state.events, {
      id: `evt_vc_${offer.id}`,
      day: state.totalDays,
      title: `${company.name} Closed ${offer.roundName}`,
      description: `Raised $${offer.amount.toLocaleString()} from ${offer.firmName} at $${(postMoneyVal / 1_000_000).toFixed(2)}M post-money.`,
      category: 'STARTUP',
      sentiment: 'POSITIVE',
    }),
  };
}

export function rejectVcOffer(state: SimState, offerId: string): SimState {
  return { ...state, vcOffers: state.vcOffers.filter((o) => o.id !== offerId) };
}

export function requestFundingRound(state: SimState, companyId: string): SimState {
  const company = state.companies.find((c) => c.id === companyId && c.isPlayerOwned && !c.isPublic && c.status === 'ACTIVE');
  if (!company) return state;
  const rng = createRng(state.seed);
  const offer = generateVcOfferForCompany(company, state.macro, rng, state.totalDays);
  if (!offer) return state;
  return {
    ...state,
    seed: nextSeed(state.seed),
    vcOffers: [offer, ...state.vcOffers],
  };
}

export function takeCompanyPublic(state: SimState, companyId: string): SimState {
  const comp = state.companies.find((c) => c.id === companyId && c.isPlayerOwned && !c.isPublic && c.status === 'ACTIVE');
  if (!comp || comp.valuation < 15_000_000) return state;

  const ipoProceeds = Math.round(comp.valuation * 0.2);
  const newFloatShares = Math.round(comp.sharesTotal * 0.25);
  const totalShares = comp.sharesTotal + newFloatShares;
  const postVal = comp.valuation + ipoProceeds;

  return {
    ...state,
    companies: state.companies.map((c) =>
      c.id === companyId
        ? {
            ...c,
            isPublic: true,
            stage: 'PUBLIC',
            cash: c.cash + ipoProceeds,
            valuation: postVal,
            sharesTotal: totalShares,
            pricePerShare: Number((postVal / totalShares).toFixed(2)),
            shareholders: [...c.shareholders, { holderName: 'Public Market Float', shares: newFloatShares, isPlayer: false }],
          }
        : c
    ),
    personal: {
      ...state.personal,
      reputation: Math.min(100, state.personal.reputation + 15),
    },
    events: addEvent(state.events, {
      id: `evt_pipo_${companyId}_${state.totalDays}`,
      day: state.totalDays,
      title: `IPO Bell! ${comp.name} (${comp.ticker}) Goes Public`,
      description: `Raised $${(ipoProceeds / 1_000_000).toFixed(2)}M in IPO proceeds at $${(postVal / 1_000_000).toFixed(1)}M valuation.`,
      category: 'MARKET',
      sentiment: 'POSITIVE',
    }),
    newsFeed: addNews(state.newsFeed, {
      id: `news_pipo_${companyId}_${state.totalDays}`,
      day: state.totalDays,
      headline: `BREAKING: ${comp.name} (${comp.ticker}) Rings Exchange Bell in $${(postVal / 1_000_000).toFixed(1)}M IPO`,
      summary: `Founder ${state.personal.founderName} takes ${comp.name} public with strong retail and institutional demand.`,
      source: 'Bloomberg 16-Bit',
      category: 'BREAKING',
      affectedSector: comp.sector,
      sentiment: 'POSITIVE',
      marketImpactPct: 6.4,
    }),
  };
}

export function foundNewStartup(state: SimState, name: string, sector: VentureSector, initialCapital: number): SimState {
  const cleanName = name.trim();
  const cap = Math.max(25_000, Math.round(initialCapital));
  if (!cleanName || state.personal.liquidCash < cap) return state;

  const rng = createRng(state.seed);
  const id = `player_co_${state.totalDays}_${Math.floor(rng() * 10000)}`;
  const ticker = tickerFromName(cleanName);
  const features = createSectorFeatures(sector);

  const comp: Company = {
    id,
    name: cleanName,
    ticker,
    sector,
    isPlayerOwned: true,
    isPublic: false,
    stage: 'SEED',
    status: 'ACTIVE',
    foundedDay: state.totalDays,
    cash: cap,
    tBillsInvested: 0,
    debtBalance: 0,
    debtApr: state.macro.interestRate + 2.5,
    monthlyRevenue: sector === 'MANUFACTURING' ? 14_000 : 0,
    monthlyExpenses: 6500,
    marketingBudget: 2000,
    pricingTier: 'STANDARD',
    valuation: cap * 2.5,
    valuationHistory: [cap * 2.5],
    sharesTotal: 10_000_000,
    playerShares: 10_000_000,
    shareholders: [{ holderName: `${state.personal.founderName} (Founder)`, shares: 10_000_000, isPlayer: true }],
    pricePerShare: Number(((cap * 2.5) / 10_000_000).toFixed(2)),
    peRatio: 0,
    productQuality: 32,
    securityLevel: sector === 'CRYPTO_EXCHANGE' ? 65 : 50,
    users: 160,
    growthRate: 0.085,
    hype: 40,
    vision: 'BALANCED',
    employees: [
      {
        id: `emp_f_${id}`,
        name: sector === 'MANUFACTURING' ? 'Lead Plant Machinist' : 'Founding Engineer',
        role: sector === 'MANUFACTURING' ? 'Operator' : 'Engineer',
        skill: 75,
        salary: sector === 'MANUFACTURING' ? 6500 : 8500,
        morale: 90,
      },
    ],
    departmentHeads: createDefaultDeptHeads(rng, false),
    features,
    activeFeatureId: features[0].id,
    exchangeFeeBps: sector === 'CRYPTO_EXCHANGE' ? 25 : undefined,
    dailyVolume: sector === 'CRYPTO_EXCHANGE' ? 150_000 : undefined,
    manufacturing:
      sector === 'MANUFACTURING'
        ? {
            factoryLines: 1,
            utilizationPct: 80,
            unitCost: 38,
            unitPrice: 72,
            defectRatePct: 2.5,
            monthlyUnitsProduced: 750,
            activeContracts: 1,
          }
        : undefined,
    subsidiaries: sector === 'HOLDING_CO' ? [] : undefined,
  };

  return {
    ...state,
    seed: nextSeed(state.seed),
    companies: [comp, ...state.companies],
    activeCompanyId: comp.id,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - cap,
    },
    events: addEvent(state.events, {
      id: `evt_found_${id}`,
      day: state.totalDays,
      title: `Founded ${cleanName}`,
      description: `Launched a new ${sector.replace('_', ' ')} venture with $${cap.toLocaleString()} personal seed capital.`,
      category: 'STARTUP',
      sentiment: 'POSITIVE',
    }),
  };
}

export function mintCryptoCoin(
  state: SimState,
  name: string,
  symbol: string,
  totalSupply: number,
  initialLiquidityUsd: number,
  stakingYieldApr: number
): SimState {
  const cleanName = name.trim();
  const cleanSym = symbol.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const liq = Math.max(10_000, Math.round(initialLiquidityUsd));
  if (!cleanName || !cleanSym || state.personal.liquidCash < liq) return state;

  const circulating = Math.round(totalSupply * 0.25);
  const startPrice = Number(Math.max(0.001, liq / (circulating * 0.2)).toFixed(4));
  const creatorCoins = Math.round(circulating * 0.35);

  const coin: CryptoCoin = {
    id: `coin_user_${state.totalDays}_${cleanSym}`,
    name: cleanName,
    symbol: cleanSym,
    creatorCompanyId: state.activeCompanyId,
    isPlayerCreated: true,
    totalSupply,
    circulatingSupply: circulating,
    price: startPrice,
    marketCap: Math.round(circulating * startPrice),
    hype: Math.min(95, 55 + Math.round(state.personal.reputation / 3)),
    utility: 45,
    stakingYieldApr: Math.max(0, Math.min(35, stakingYieldApr)),
    playerHoldings: creatorCoins,
    priceHistory: [startPrice],
  };

  return {
    ...state,
    cryptoCoins: [coin, ...state.cryptoCoins],
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - liq,
    },
    events: addEvent(state.events, {
      id: `evt_mint_${coin.id}`,
      day: state.totalDays,
      title: `Token Genesis: $${cleanSym}`,
      description: `Launched ${cleanName} ($${cleanSym}) with $${liq.toLocaleString()} liquidity at $${startPrice}/token.`,
      category: 'CRYPTO',
      sentiment: 'POSITIVE',
    }),
  };
}

export function tradeCrypto(state: SimState, coinId: string, usdAmount: number, side: 'BUY' | 'SELL'): SimState {
  const coin = state.cryptoCoins.find((c) => c.id === coinId);
  if (!coin || usdAmount <= 0) return state;

  const fee = usdAmount * 0.003;
  if (side === 'BUY') {
    if (state.personal.liquidCash < usdAmount + fee) return state;
    const qty = usdAmount / coin.price;
    return {
      ...state,
      personal: { ...state.personal, liquidCash: Math.round(state.personal.liquidCash - usdAmount - fee) },
      cryptoCoins: state.cryptoCoins.map((c) =>
        c.id === coinId ? { ...c, playerHoldings: c.playerHoldings + qty, hype: Math.min(99, c.hype + 1) } : c
      ),
    };
  } else {
    const qty = Math.min(coin.playerHoldings, usdAmount / coin.price);
    if (qty <= 0) return state;
    const proceeds = qty * coin.price - fee;
    return {
      ...state,
      personal: { ...state.personal, liquidCash: Math.round(state.personal.liquidCash + proceeds) },
      cryptoCoins: state.cryptoCoins.map((c) =>
        c.id === coinId ? { ...c, playerHoldings: Math.max(0, c.playerHoldings - qty) } : c
      ),
    };
  }
}

export function tradeStock(state: SimState, companyId: string, sharesDelta: number): SimState {
  const comp = state.companies.find((c) => c.id === companyId && c.isPublic && c.status === 'ACTIVE');
  if (!comp || sharesDelta === 0) return state;

  const existing = state.stockPositions.find((p) => p.companyId === companyId);
  const price = comp.pricePerShare;
  const cost = sharesDelta * price;

  if (sharesDelta > 0) {
    if (state.personal.liquidCash < cost) return state;
    let nextPositions = [...state.stockPositions];
    if (!existing) {
      nextPositions.push({ companyId, shares: sharesDelta, avgEntryPrice: price });
    } else {
      const nextShares = existing.shares + sharesDelta;
      if (nextShares === 0) {
        nextPositions = nextPositions.filter((p) => p.companyId !== companyId);
      } else {
        const nextAvg =
          existing.shares > 0
            ? (existing.shares * existing.avgEntryPrice + cost) / nextShares
            : existing.avgEntryPrice;
        nextPositions = nextPositions.map((p) =>
          p.companyId === companyId ? { ...p, shares: nextShares, avgEntryPrice: Number(nextAvg.toFixed(2)) } : p
        );
      }
    }
    return {
      ...state,
      personal: { ...state.personal, liquidCash: Math.round(state.personal.liquidCash - cost) },
      stockPositions: nextPositions,
    };
  } else {
    const sellQty = Math.abs(sharesDelta);
    const proceeds = sellQty * price;
    const existingShares = existing?.shares ?? 0;
    const resultingShares = existingShares - sellQty;
    if (resultingShares < 0 && state.personal.liquidCash < Math.abs(resultingShares) * price * 0.5) {
      return state;
    }

    let nextPositions = [...state.stockPositions];
    if (!existing) {
      nextPositions.push({ companyId, shares: -sellQty, avgEntryPrice: price });
    } else if (resultingShares === 0) {
      nextPositions = nextPositions.filter((p) => p.companyId !== companyId);
    } else {
      nextPositions = nextPositions.map((p) =>
        p.companyId === companyId
          ? {
              ...p,
              shares: resultingShares,
              avgEntryPrice: resultingShares < 0 && existing.shares >= 0 ? price : p.avgEntryPrice,
            }
          : p
      );
    }

    return {
      ...state,
      personal: { ...state.personal, liquidCash: Math.round(state.personal.liquidCash + proceeds) },
      stockPositions: nextPositions,
    };
  }
}

// --- Advanced Fund Controls ---

export function foundInvestmentFund(
  state: SimState,
  name: string,
  strategy: FundStrategy,
  gpCommit: number
): SimState {
  const cleanName = name.trim();
  const gp = Math.max(50_000, Math.round(gpCommit));
  if (!cleanName || state.personal.liquidCash < gp) return state;

  const leverage = 3 + ((state.personal.reputation + state.personal.networkScore) / 200) * 7;
  const lpCapital = Math.round((gp * leverage) / 10_000) * 10_000;

  const fund: PlayerFund = {
    id: `fund_${state.totalDays}_${state.playerFunds.length + 1}`,
    name: cleanName,
    strategy,
    sectorFocus: 'ALL',
    foundedDay: state.totalDays,
    lpCapital,
    gpCommit: gp,
    cashAvailable: gp + lpCapital,
    tBillsAllocated: 0,
    debtBorrowed: 0,
    managementFeePct: 2.0,
    carryPct: 20,
    hurdleRatePct: 8,
    realizedProfits: 0,
    distributedTotal: 0,
    portfolio: [],
    publicHoldings: [],
  };

  return {
    ...state,
    playerFunds: [fund, ...state.playerFunds],
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - gp,
      reputation: Math.min(100, state.personal.reputation + 8),
    },
    events: addEvent(state.events, {
      id: `evt_fund_${fund.id}`,
      day: state.totalDays,
      title: `Closed ${cleanName} ($${((gp + lpCapital) / 1_000_000).toFixed(1)}M AUM)`,
      description: `LPs committed $${(lpCapital / 1_000_000).toFixed(2)}M alongside your $${gp.toLocaleString()} GP stake.`,
      category: 'MARKET',
      sentiment: 'POSITIVE',
    }),
  };
}

export function fundRaiseLpCapital(state: SimState, fundId: string, additionalLp: number): SimState {
  const clean = Math.max(100_000, Math.round(additionalLp));
  const fund = state.playerFunds.find((f) => f.id === fundId);
  if (!fund) return state;
  const nav = computeFundNav(fund, state.companies);
  const maxNewRaise = Math.round(Math.max(1_000_000, nav * 0.8 + state.personal.reputation * 50_000));
  if (clean > maxNewRaise) return state;

  return {
    ...state,
    playerFunds: state.playerFunds.map((f) =>
      f.id === fundId ? { ...f, lpCapital: f.lpCapital + clean, cashAvailable: f.cashAvailable + clean } : f
    ),
    events: addEvent(state.events, {
      id: `evt_lp_${fundId}_${state.totalDays}`,
      day: state.totalDays,
      title: `${fund.name} Raised $${(clean / 1_000_000).toFixed(2)}M LP Tranche`,
      description: `Institutional LPs committed fresh dry powder to ${fund.name}.`,
      category: 'MARKET',
      sentiment: 'POSITIVE',
    }),
  };
}

export function fundToggleLeverage(state: SimState, fundId: string, amountDelta: number): SimState {
  const fund = state.playerFunds.find((f) => f.id === fundId);
  if (!fund) return state;
  const nav = computeFundNav(fund, state.companies);
  const maxDebt = Math.round(nav * 0.6);

  if (amountDelta > 0) {
    if (fund.debtBorrowed + amountDelta > maxDebt) return state;
    return {
      ...state,
      playerFunds: state.playerFunds.map((f) =>
        f.id === fundId
          ? { ...f, debtBorrowed: f.debtBorrowed + amountDelta, cashAvailable: f.cashAvailable + amountDelta }
          : f
      ),
    };
  } else {
    const repay = Math.min(fund.debtBorrowed, Math.min(fund.cashAvailable, Math.abs(amountDelta)));
    if (repay <= 0) return state;
    return {
      ...state,
      playerFunds: state.playerFunds.map((f) =>
        f.id === fundId ? { ...f, debtBorrowed: f.debtBorrowed - repay, cashAvailable: f.cashAvailable - repay } : f
      ),
    };
  }
}

export function fundUpdateTerms(
  state: SimState,
  fundId: string,
  updates: { managementFeePct?: number; carryPct?: number; hurdleRatePct?: number; sectorFocus?: VentureSector | 'ALL' }
): SimState {
  return {
    ...state,
    playerFunds: state.playerFunds.map((f) =>
      f.id === fundId
        ? {
            ...f,
            managementFeePct: updates.managementFeePct ?? f.managementFeePct,
            carryPct: updates.carryPct ?? f.carryPct,
            hurdleRatePct: updates.hurdleRatePct ?? f.hurdleRatePct,
            sectorFocus: updates.sectorFocus ?? f.sectorFocus,
          }
        : f
    ),
  };
}

export function fundAllocateTBills(state: SimState, fundId: string, delta: number): SimState {
  const fund = state.playerFunds.find((f) => f.id === fundId);
  if (!fund) return state;
  if (delta > 0 && fund.cashAvailable < delta) return state;
  if (delta < 0 && fund.tBillsAllocated < Math.abs(delta)) return state;
  return {
    ...state,
    playerFunds: state.playerFunds.map((f) =>
      f.id === fundId
        ? { ...f, cashAvailable: f.cashAvailable - delta, tBillsAllocated: f.tBillsAllocated + delta }
        : f
    ),
  };
}

export function fundBuyPublicStock(state: SimState, fundId: string, companyId: string, usdAmount: number): SimState {
  const fund = state.playerFunds.find((f) => f.id === fundId);
  const comp = state.companies.find((c) => c.id === companyId && c.isPublic && c.status === 'ACTIVE');
  if (!fund || !comp || usdAmount <= 0 || fund.cashAvailable < usdAmount) return state;
  const shares = Math.floor(usdAmount / comp.pricePerShare);
  if (shares <= 0) return state;
  const cost = Math.round(shares * comp.pricePerShare);

  const existing = fund.publicHoldings.find((h) => h.companyId === companyId);
  const nextPublic = existing
    ? fund.publicHoldings.map((h) =>
        h.companyId === companyId
          ? {
              ...h,
              shares: h.shares + shares,
              avgEntryPrice: Number(
                ((h.shares * h.avgEntryPrice + cost) / (h.shares + shares)).toFixed(2)
              ),
            }
          : h
      )
    : [...fund.publicHoldings, { companyId, ticker: comp.ticker, shares, avgEntryPrice: comp.pricePerShare }];

  return {
    ...state,
    playerFunds: state.playerFunds.map((f) =>
      f.id === fundId ? { ...f, cashAvailable: f.cashAvailable - cost, publicHoldings: nextPublic } : f
    ),
  };
}

export function fundDistributeProfits(state: SimState, fundId: string, amount: number): SimState {
  const fund = state.playerFunds.find((f) => f.id === fundId);
  if (!fund || amount <= 0 || fund.cashAvailable < amount) return state;
  const gpCarryShare = Math.round(amount * (fund.carryPct / 100));
  return {
    ...state,
    playerFunds: state.playerFunds.map((f) =>
      f.id === fundId
        ? {
            ...f,
            cashAvailable: f.cashAvailable - amount,
            distributedTotal: f.distributedTotal + amount,
          }
        : f
    ),
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash + gpCarryShare,
    },
    events: addEvent(state.events, {
      id: `evt_dist_${fundId}_${state.totalDays}`,
      day: state.totalDays,
      title: `${fund.name} Distributed $${amount.toLocaleString()}`,
      description: `LP distribution paid out; you collected $${gpCarryShare.toLocaleString()} GP carry.`,
      category: 'MARKET',
      sentiment: 'POSITIVE',
    }),
  };
}

export function fundInvestInCompany(
  state: SimState,
  fundId: string,
  companyId: string,
  checkSize: number
): SimState {
  const fund = state.playerFunds.find((f) => f.id === fundId);
  const comp = state.companies.find((c) => c.id === companyId && c.status === 'ACTIVE' && !c.isPlayerOwned);
  if (!fund || !comp || checkSize <= 0 || fund.cashAvailable < checkSize) return state;

  const postMoney = comp.valuation + checkSize;
  const equityPct = Number(((checkSize / postMoney) * 100).toFixed(2));

  return {
    ...state,
    playerFunds: state.playerFunds.map((f) =>
      f.id === fundId
        ? {
            ...f,
            cashAvailable: f.cashAvailable - checkSize,
            portfolio: [
              ...f.portfolio,
              {
                companyId: comp.id,
                companyName: comp.name,
                sector: comp.sector,
                equityPercent: equityPct,
                costBasis: checkSize,
                investedDay: state.totalDays,
              },
            ],
          }
        : f
    ),
    companies: state.companies.map((c) =>
      c.id === companyId
        ? { ...c, cash: c.cash + checkSize, valuation: postMoney, growthRate: Number((c.growthRate + 0.012).toFixed(3)) }
        : c
    ),
    events: addEvent(state.events, {
      id: `evt_finv_${fundId}_${companyId}_${state.totalDays}`,
      day: state.totalDays,
      title: `${fund.name} Invested in ${comp.name}`,
      description: `Deployed $${checkSize.toLocaleString()} for ${equityPct}% equity stake.`,
      category: 'MARKET',
      sentiment: 'POSITIVE',
    }),
  };
}

export function fundActivistAction(
  state: SimState,
  fundId: string,
  portfolioIndex: number,
  action: 'CUT_BURN' | 'GROWTH_MANDATE'
): SimState {
  const fund = state.playerFunds.find((f) => f.id === fundId);
  if (!fund || !fund.portfolio[portfolioIndex]) return state;
  const inv = fund.portfolio[portfolioIndex];
  if (inv.equityPercent < 15) return state;

  return {
    ...state,
    companies: state.companies.map((c) => {
      if (c.id !== inv.companyId) return c;
      if (action === 'CUT_BURN') {
        return {
          ...c,
          monthlyExpenses: Math.round(c.monthlyExpenses * 0.85),
          growthRate: Number(Math.max(0.01, c.growthRate - 0.015).toFixed(3)),
        };
      }
      return {
        ...c,
        growthRate: Number(Math.min(0.22, c.growthRate + 0.03).toFixed(3)),
        monthlyExpenses: Math.round(c.monthlyExpenses * 1.1),
      };
    }),
    events: addEvent(state.events, {
      id: `evt_act_${fundId}_${inv.companyId}_${state.totalDays}`,
      day: state.totalDays,
      title: `Board Directive at ${inv.companyName}`,
      description:
        action === 'CUT_BURN'
          ? `${fund.name} used its ${inv.equityPercent}% stake to cut operating expenses by 15%.`
          : `${fund.name} pushed ${inv.companyName} into aggressive growth mode (+3% monthly growth).`,
      category: 'MARKET',
      sentiment: 'POSITIVE',
    }),
  };
}

export function fundExitPosition(state: SimState, fundId: string, index: number): SimState {
  const fund = state.playerFunds.find((f) => f.id === fundId);
  if (!fund || !fund.portfolio[index]) return state;
  const inv = fund.portfolio[index];
  const target = state.companies.find((c) => c.id === inv.companyId && c.status === 'ACTIVE');
  if (!target) return state;

  const discount = target.isPublic ? 1.0 : 0.88;
  const proceeds = Math.round(target.valuation * (inv.equityPercent / 100) * discount);
  const profit = Math.max(0, proceeds - inv.costBasis);
  const carry = Math.round(profit * (fund.carryPct / 100));

  return {
    ...state,
    playerFunds: state.playerFunds.map((f) =>
      f.id === fundId
        ? {
            ...f,
            cashAvailable: f.cashAvailable + proceeds - carry,
            realizedProfits: f.realizedProfits + profit,
            portfolio: f.portfolio.filter((_, i) => i !== index),
          }
        : f
    ),
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash + carry,
    },
  };
}

// --- News & Interactive Decision Actions ---

export function resolvePendingDecision(state: SimState, decisionId: string, choiceId: string): SimState {
  const dec = state.pendingDecisions.find((d) => d.id === decisionId);
  if (!dec) return state;
  const choice = dec.choices.find((ch) => ch.id === choiceId);
  if (!choice) return state;

  const targetCo = dec.companyId
    ? state.companies.find((c) => c.id === dec.companyId && c.status === 'ACTIVE')
    : null;
  if (targetCo && targetCo.cash < choice.costCash) return state;

  return {
    ...state,
    pendingDecisions: state.pendingDecisions.filter((d) => d.id !== decisionId),
    companies: state.companies.map((c) =>
      c.id === dec.companyId
        ? {
            ...c,
            cash: c.cash + choice.cashDelta,
            hype: Math.max(0, Math.min(100, c.hype + choice.hypeDelta)),
            productQuality: Math.max(10, Math.min(100, c.productQuality + choice.qualityDelta)),
            growthRate: Number(Math.max(0.01, Math.min(0.28, c.growthRate + choice.growthDelta)).toFixed(3)),
          }
        : c
    ),
    personal: {
      ...state.personal,
      reputation: Math.max(0, Math.min(100, state.personal.reputation + choice.reputationDelta)),
    },
    newsFeed: addNews(state.newsFeed, {
      id: `news_dec_${dec.id}`,
      day: state.totalDays,
      headline: `${targetCo ? targetCo.name : state.personal.founderName} Responds: ${choice.label}`,
      summary: `${dec.title} resolved (${choice.effectSummary}).`,
      source: 'Silicon Wire',
      category: dec.category,
      affectedSector: targetCo?.sector ?? 'ALL',
      sentiment: 'POSITIVE',
    }),
  };
}

export function issuePressRelease(state: SimState, companyId: string | null, angle: 'GROWTH' | 'EARNINGS'): SimState {
  const cost = 8000;
  const co = companyId ? state.companies.find((c) => c.id === companyId && c.isPlayerOwned) : null;
  if (co && co.cash < cost) return state;
  if (!co && state.personal.liquidCash < cost) return state;

  return {
    ...state,
    companies: co
      ? state.companies.map((c) =>
          c.id === co.id ? { ...c, cash: c.cash - cost, hype: Math.min(100, c.hype + 10) } : c
        )
      : state.companies,
    personal: {
      ...state.personal,
      liquidCash: !co ? state.personal.liquidCash - cost : state.personal.liquidCash,
      reputation: Math.min(100, state.personal.reputation + 3),
    },
    newsFeed: addNews(state.newsFeed, {
      id: `news_pr_${state.totalDays}_${Math.floor(Math.random() * 1000)}`,
      day: state.totalDays,
      headline: co
        ? `${co.name} Touts ${angle === 'GROWTH' ? 'Surging User Adoption' : 'Disciplined Operating Margins'} in Press Briefing`
        : `${state.personal.founderName} Outlines New Capital Thesis Across Global Markets`,
      summary: `Official press release highlights momentum and lifts investor visibility.`,
      source: 'Pixel Street Journal',
      category: 'TECH',
      affectedSector: co?.sector ?? 'ALL',
      sentiment: 'POSITIVE',
      marketImpactPct: 1.8,
    }),
  };
}

// --- Personal Life Actions ---

export function allocatePersonalTBills(state: SimState, delta: number): SimState {
  if (delta > 0 && state.personal.liquidCash < delta) return state;
  if (delta < 0 && state.personal.tBillsBalance < Math.abs(delta)) return state;
  return {
    ...state,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - delta,
      tBillsBalance: state.personal.tBillsBalance + delta,
    },
  };
}

export function setLifestyleTier(state: SimState, tier: LifestyleTier): SimState {
  return {
    ...state,
    personal: { ...state.personal, lifestyleTier: tier },
  };
}

export function setSalaryDraw(state: SimState, monthlySalary: number): SimState {
  return {
    ...state,
    personal: { ...state.personal, monthlySalaryDraw: Math.max(0, Math.min(100_000, Math.round(monthlySalary))) },
  };
}

export function drawFounderSecondary(state: SimState, companyId: string, sellPercentOfPlayerShares: number): SimState {
  const comp = state.companies.find((c) => c.id === companyId && c.isPlayerOwned && c.status === 'ACTIVE');
  if (!comp || sellPercentOfPlayerShares <= 0 || sellPercentOfPlayerShares > 25) return state;

  const sharesToSell = Math.round(comp.playerShares * (sellPercentOfPlayerShares / 100));
  if (sharesToSell <= 0 || comp.playerShares - sharesToSell < comp.sharesTotal * 0.05) return state;

  const discount = comp.isPublic ? 1.0 : 0.85;
  const proceeds = Math.round((sharesToSell / comp.sharesTotal) * comp.valuation * discount);

  return {
    ...state,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash + proceeds,
    },
    companies: state.companies.map((c) =>
      c.id === companyId
        ? {
            ...c,
            playerShares: c.playerShares - sharesToSell,
            shareholders: [
              ...c.shareholders.map((sh) => (sh.isPlayer ? { ...sh, shares: sh.shares - sharesToSell } : sh)),
              { holderName: 'Secondary Investors', shares: sharesToSell, isPlayer: false },
            ],
          }
        : c
    ),
    events: addEvent(state.events, {
      id: `evt_sec_${companyId}_${state.totalDays}`,
      day: state.totalDays,
      title: `Secondary Share Sale (${comp.name})`,
      description: `Sold ${sellPercentOfPlayerShares.toFixed(0)}% of your personal stake for $${proceeds.toLocaleString()} cash.`,
      category: 'PERSONAL',
      sentiment: 'POSITIVE',
    }),
  };
}

export function buyPersonalAsset(state: SimState, assetId: string): SimState {
  const item = PERSONAL_ASSETS_CATALOG.find((a) => a.id === assetId);
  if (!item || state.personal.assetsOwned.includes(assetId) || state.personal.liquidCash < item.price) {
    return state;
  }
  return {
    ...state,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - item.price,
      reputation: Math.min(100, state.personal.reputation + item.reputationBoost),
      stress: Math.max(0, state.personal.stress - item.stressRelief),
      assetsOwned: [...state.personal.assetsOwned, assetId],
    },
  };
}

export function takeRestVacation(state: SimState): SimState {
  const cost = 4500;
  if (state.personal.liquidCash < cost) return state;
  const rested = {
    ...state,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - cost,
      stress: Math.max(0, state.personal.stress - 28),
      energy: Math.min(100, state.personal.energy + 35),
      networkScore: Math.min(100, state.personal.networkScore + 4),
    },
  };
  return advanceTime(rested, 7);
}

// --- Everyday Worker, Unemployed Job Seeker, Freelancing & Micro Online Store Actions ---

export function computeJobAcceptanceOdds(
  personal: PersonalLife,
  job: JobPosting,
  macro: MacroEconomy
): number {
  const skillDiff = personal.skillLevel - job.skillRequired;
  const repDiff = personal.reputation - job.repRequired;
  let odds = 0.58 + skillDiff * 0.018 + repDiff * 0.008;

  if (personal.skillLevel < job.skillRequired) {
    odds -= (job.skillRequired - personal.skillLevel) * 0.012;
  }
  if (macro.regime === 'RECESSION') odds -= 0.22;
  else if (macro.regime === 'RATE_HIKE' || macro.regime === 'CRYPTO_WINTER') odds -= 0.1;
  else if (macro.regime === 'BOOM' || macro.regime === 'AI_MANIA') odds += 0.12;

  return Number(Math.max(0.06, Math.min(0.95, odds)).toFixed(2));
}

export function applyForDayJob(state: SimState, jobId: string): SimState {
  if (state.isGameOver || state.personal.energy < 10) return state;
  const job = state.jobMarket.find((j) => j.id === jobId);
  if (!job) return state;

  const rng = createRng(state.seed);
  const odds = computeJobAcceptanceOdds(state.personal, job, state.macro);
  const accepted = rng() < odds;

  if (!accepted) {
    return {
      ...state,
      seed: nextSeed(state.seed),
      personal: {
        ...state.personal,
        energy: Math.max(0, state.personal.energy - 10),
        stress: Math.min(100, state.personal.stress + 3),
        jobApplicationsSent: state.personal.jobApplicationsSent + 1,
        jobRejections: state.personal.jobRejections + 1,
        lastJobFeedback: `Rejected by ${job.employer} for ${job.title} (${Math.round(odds * 100)}% match). Build skills or try lower-bar roles.`,
      },
      events: addEvent(state.events, {
        id: `evt_jobrej_${state.totalDays}_${state.personal.jobApplicationsSent}`,
        day: state.totalDays,
        title: `Application Rejected: ${job.title}`,
        description: `${job.employer} passed on your resume (${Math.round(odds * 100)}% fit).`,
        category: 'PERSONAL',
        sentiment: 'NEGATIVE',
      }),
    };
  }

  return {
    ...state,
    seed: nextSeed(state.seed),
    personal: {
      ...state.personal,
      energy: Math.max(0, state.personal.energy - 10),
      reputation: Math.min(100, state.personal.reputation + 3),
      jobApplicationsSent: state.personal.jobApplicationsSent + 1,
      currentJob: {
        id: job.id,
        title: job.title,
        employer: job.employer,
        monthlyPay: job.monthlyPay,
        stressPerMonth: job.stressPerMonth,
        skillRequired: job.skillRequired,
      },
      lastJobFeedback: `Offer accepted! Hired as ${job.title} at ${job.employer} ($${job.monthlyPay.toLocaleString()}/mo).`,
    },
    events: addEvent(state.events, {
      id: `evt_jobhire_${state.totalDays}_${state.personal.jobApplicationsSent}`,
      day: state.totalDays,
      title: `Hired at ${job.employer}!`,
      description: `Started as ${job.title} earning $${job.monthlyPay.toLocaleString()}/mo gross.`,
      category: 'PERSONAL',
      sentiment: 'POSITIVE',
    }),
  };
}

export function quitDayJob(state: SimState): SimState {
  if (!state.personal.currentJob) return state;
  const oldTitle = state.personal.currentJob.title;
  return {
    ...state,
    personal: {
      ...state.personal,
      currentJob: null,
      lastJobFeedback: `Quit ${oldTitle} to go independent.`,
    },
  };
}

export function doSideHustleGig(state: SimState, gigId: string): SimState {
  if (state.isGameOver) return state;
  const gig = SIDE_HUSTLE_GIGS.find((g) => g.id === gigId);
  if (!gig) return state;
  if (state.personal.energy < gig.energyCost || state.personal.skillLevel < gig.skillRequired) {
    return state;
  }

  return {
    ...state,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash + gig.payoutCash,
      energy: Math.max(0, state.personal.energy - gig.energyCost),
      stress: Math.min(100, state.personal.stress + gig.stressGain),
      skillLevel: Math.min(100, state.personal.skillLevel + gig.skillGain),
      reputation: Math.min(100, state.personal.reputation + gig.repGain),
      gigsCompleted: state.personal.gigsCompleted + 1,
      lastJobFeedback: `Completed "${gig.title}" for +$${gig.payoutCash.toLocaleString()} cash (+${gig.skillGain} Skill).`,
    },
  };
}

export function upskillStudy(state: SimState, mode: 'FREE_LIBRARY' | 'ONLINE_COURSE'): SimState {
  if (state.isGameOver) return state;
  const cost = mode === 'ONLINE_COURSE' ? 320 : 0;
  const energyCost = mode === 'ONLINE_COURSE' ? 20 : 16;
  const skillGain = mode === 'ONLINE_COURSE' ? 10 : 4;
  const repGain = mode === 'ONLINE_COURSE' ? 3 : 0;

  if (state.personal.liquidCash < cost || state.personal.energy < energyCost) return state;

  return {
    ...state,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - cost,
      energy: Math.max(0, state.personal.energy - energyCost),
      skillLevel: Math.min(100, state.personal.skillLevel + skillGain),
      reputation: Math.min(100, state.personal.reputation + repGain),
      networkScore: Math.min(100, state.personal.networkScore + (mode === 'ONLINE_COURSE' ? 3 : 1)),
      lastJobFeedback:
        mode === 'ONLINE_COURSE'
          ? `Finished Online Bootcamp (+${skillGain} Skill, +${repGain} Rep).`
          : `Studied at Public Library (+${skillGain} Skill for $0).`,
    },
  };
}

export function borrowPersonalLoan(state: SimState, amount: number): SimState {
  const clean = Math.max(100, Math.round(amount));
  if (state.personal.personalDebt + clean > 12_000) return state;
  return {
    ...state,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash + clean,
      personalDebt: state.personal.personalDebt + clean,
      stress: Math.min(100, state.personal.stress + 4),
      lastJobFeedback: `Borrowed $${clean.toLocaleString()} emergency credit (18% APR).`,
    },
  };
}

export function repayPersonalDebt(state: SimState, amount: number): SimState {
  const pay = Math.min(state.personal.personalDebt, Math.min(state.personal.liquidCash, Math.round(amount)));
  if (pay <= 0) return state;
  return {
    ...state,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - pay,
      personalDebt: state.personal.personalDebt - pay,
      stress: Math.max(0, state.personal.stress - 3),
    },
  };
}

export function launchMicroOnlineStore(
  state: SimState,
  storeName: string,
  tier: 'DROPSHIP' | 'BRANDED'
): SimState {
  const cleanName = storeName.trim();
  const cost = tier === 'BRANDED' ? 2_400 : 450;
  if (!cleanName || state.personal.liquidCash < cost) return state;

  const rng = createRng(state.seed);
  const id = `store_${state.totalDays}_${Math.floor(rng() * 10000)}`;
  const ticker = tickerFromName(cleanName);
  const features = createSectorFeatures('RETAIL_COMMERCE');
  const startCash = tier === 'BRANDED' ? 1_900 : 320;
  const startVal = tier === 'BRANDED' ? 18_000 : 3_800;

  const store: Company = {
    id,
    name: cleanName,
    ticker,
    sector: 'RETAIL_COMMERCE',
    isPlayerOwned: true,
    isPublic: false,
    stage: 'SEED',
    status: 'ACTIVE',
    foundedDay: state.totalDays,
    cash: startCash,
    tBillsInvested: 0,
    debtBalance: 0,
    debtApr: state.macro.interestRate + 2.5,
    monthlyRevenue: tier === 'BRANDED' ? 1_150 : 280,
    monthlyExpenses: tier === 'BRANDED' ? 420 : 125,
    marketingBudget: tier === 'BRANDED' ? 220 : 75,
    pricingTier: 'STANDARD',
    valuation: startVal,
    valuationHistory: [startVal],
    sharesTotal: 10_000_000,
    playerShares: 10_000_000,
    shareholders: [{ holderName: `${state.personal.founderName} (Owner)`, shares: 10_000_000, isPlayer: true }],
    pricePerShare: Number((startVal / 10_000_000).toFixed(3)),
    peRatio: 0,
    productQuality: tier === 'BRANDED' ? 40 : 28,
    securityLevel: 50,
    users: tier === 'BRANDED' ? 240 : 75,
    growthRate: 0.08,
    hype: tier === 'BRANDED' ? 35 : 22,
    vision: 'BALANCED',
    employees: [],
    departmentHeads: createDefaultDeptHeads(rng, false),
    features,
    activeFeatureId: features[0].id,
  };

  return {
    ...state,
    seed: nextSeed(state.seed),
    companies: [store, ...state.companies],
    activeCompanyId: store.id,
    personal: {
      ...state.personal,
      liquidCash: state.personal.liquidCash - cost,
      reputation: Math.min(100, state.personal.reputation + 4),
      lastJobFeedback: `Launched solo online store "${cleanName}" for $${cost.toLocaleString()}!`,
    },
    events: addEvent(state.events, {
      id: `evt_store_${id}`,
      day: state.totalDays,
      title: `Launched Online Store: ${cleanName}`,
      description: `Bootstrapped a ${tier === 'BRANDED' ? 'Branded DTC' : 'Dropship'} storefront with $${cost.toLocaleString()}.`,
      category: 'STARTUP',
      sentiment: 'POSITIVE',
    }),
  };
}
