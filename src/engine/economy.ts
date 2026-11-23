import {
  createSectorFeatures,
  NEWS_SOURCES,
  NEWS_TEMPLATES,
  PRICING_ARPU,
  randomCompanyName,
  randomPersonName,
  SECTOR_REVENUE_MULTIPLES,
  SECTOR_TAM_USERS,
  VC_FIRM_NAMES,
} from './names';
import {
  Company,
  CompanyStage,
  CryptoCoin,
  DepartmentHead,
  DepartmentRole,
  MacroEconomy,
  MacroRegime,
  NewsArticle,
  PendingDecision,
  SimState,
  VcOffer,
  VentureSector,
  WorldEvent,
} from './types';

export function computeRealisticValuation(company: Company, macro: MacroEconomy): number {
  const arr = company.monthlyRevenue * 12;
  const netMonthly = company.monthlyRevenue - company.monthlyExpenses;
  const sectorMult = SECTOR_REVENUE_MULTIPLES[company.sector];

  // Mature mega-companies experience multiple compression toward ~1.0x
  const scaleDamping = arr > 500_000_000 ? 0.72 : arr > 50_000_000 ? 0.88 : 1.0;
  const growthPremium = 1 + Math.max(-0.3, Math.min(0.85, company.growthRate * 3.8));
  const qualityFactor = 0.72 + (company.productQuality / 100) * 0.55;

  const arrValue = arr * sectorMult * scaleDamping * growthPremium * qualityFactor * macro.marketSentiment * 0.55;

  // Earnings valuation (realistic 12x - 28x P/E depending on interest rates)
  const targetPe = Math.max(10, Math.min(30, 22 * macro.marketSentiment - (macro.interestRate - 3.5) * 1.8));
  const earningsValue =
    netMonthly > 0
      ? netMonthly * 12 * targetPe * 0.45
      : Math.min(45_000_000, company.users * (company.sector === 'AI_LAB' ? 95 : 42)) * macro.marketSentiment;

  // Net balance sheet cash + T-bills minus debt
  const netCash = company.cash + company.tBillsInvested - company.debtBalance;

  // Subsidiary holdings value for Holding Companies / Acquirers
  const subValue = (company.subsidiaries ?? []).reduce(
    (sum, s) => sum + s.monthlyDividend * 12 * 14,
    0
  );

  // Manufacturing tangible plant value
  const plantValue = company.manufacturing
    ? company.manufacturing.factoryLines * 420_000
    : 0;

  const baseFloor = Math.max(100_000, company.cash + company.tBillsInvested + company.productQuality * 6500 + plantValue);
  const hypeBoost = 1 + (company.hype / 100) * 0.14;

  const raw = Math.max(baseFloor, (arrValue + earningsValue + netCash * 0.85 + subValue + plantValue) * hypeBoost);
  // Realistic global mega-cap ceiling ($650B max for a single dominant conglomerate)
  return Math.min(650_000_000_000, Math.round(raw));
}

export function applyLogisticUserGrowth(
  currentUsers: number,
  sector: VentureSector,
  rawGrowthRate: number,
  macro: MacroEconomy
): number {
  const tam = SECTOR_TAM_USERS[sector];
  const saturation = Math.min(0.98, currentUsers / tam);
  // Logistic S-curve: fast early growth, tapering smoothly as company captures market share
  const saturationFactor = Math.max(0.03, 1 - Math.pow(saturation, 0.85));
  const macroDrag = (macro.marketSentiment - 1) * 0.025 + (macro.gdpGrowth - 2.0) * 0.004;
  // Churn increases slightly at massive scale
  const scaleChurn = saturation * 0.035;
  const effectiveMonthlyRate = Math.max(-0.08, Math.min(0.28, rawGrowthRate * saturationFactor + macroDrag - scaleChurn));
  return Math.max(40, Math.min(tam, Math.round(currentUsers * (1 + effectiveMonthlyRate))));
}

export function calculateCompanyPeRatio(company: Company): number {
  const annualNet = (company.monthlyRevenue - company.monthlyExpenses) * 12;
  if (annualNet <= 1000) return 0;
  return Number(Math.min(180, company.valuation / annualNet).toFixed(1));
}

export function createDefaultDeptHeads(rng: () => number, preHired = false): Record<DepartmentRole, DepartmentHead> {
  const make = (role: DepartmentRole, salary: number, directive: string): DepartmentHead => ({
    role,
    name: preHired ? randomPersonName(rng) : `${role} Vacant`,
    hired: preHired,
    salary,
    skill: preHired ? Math.round(68 + rng() * 24) : 0,
    delegated: preHired,
    directive,
  });
  return {
    CTO: make('CTO', 16500, 'Ship Highest-Impact Feature'),
    CMO: make('CMO', 14500, 'Balanced User Acquisition'),
    CFO: make('CFO', 15500, 'Protect 9-Month Runway'),
    COO: make('COO', 14000, 'Hire Key Talent Within Budget'),
  };
}

export function createWorldCompany(
  rng: () => number,
  id: string,
  sector: VentureSector,
  stage: CompanyStage,
  foundedDay: number,
  macro: MacroEconomy,
  customName?: string
): Company {
  const gen = randomCompanyName(rng);
  const name = customName || gen.name;
  const ticker = customName
    ? customName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase().padEnd(3, 'X')
    : gen.ticker;

  const isPublic = stage === 'PUBLIC';
  const stageScale =
    stage === 'SEED' ? 1 : stage === 'SERIES_A' ? 4.5 : stage === 'SERIES_B' ? 14 : stage === 'GROWTH' ? 40 : 120;

  const tam = SECTOR_TAM_USERS[sector];
  const users = Math.min(Math.round(tam * 0.45), Math.round((700 + rng() * 1900) * stageScale));
  const pricingTier = rng() > 0.65 ? 'ENTERPRISE' : rng() > 0.35 ? 'STANDARD' : 'FREEMIUM';
  const arpu = PRICING_ARPU[pricingTier];
  const paidRatio = pricingTier === 'FREEMIUM' ? 0.14 : pricingTier === 'STANDARD' ? 0.3 : 0.08;
  const monthlyRevenue = Math.round(users * paidRatio * arpu * (0.85 + rng() * 0.45));
  const monthlyExpenses = Math.round(monthlyRevenue * (isPublic ? 0.74 + rng() * 0.2 : 0.88 + rng() * 0.55));
  const cash = Math.round((250_000 + rng() * 550_000) * Math.sqrt(stageScale));
  const sharesTotal = isPublic ? 50_000_000 : 10_000_000;

  const company: Company = {
    id,
    name,
    ticker,
    sector,
    isPlayerOwned: false,
    isPublic,
    stage,
    status: 'ACTIVE',
    foundedDay,
    cash,
    tBillsInvested: isPublic ? Math.round(cash * 0.35) : 0,
    debtBalance: 0,
    debtApr: macro.interestRate + 2.5,
    monthlyRevenue,
    monthlyExpenses,
    marketingBudget: Math.round(monthlyExpenses * 0.2),
    pricingTier,
    valuation: 1_000_000,
    valuationHistory: [],
    sharesTotal,
    playerShares: 0,
    shareholders: [
      { holderName: 'Founders & Team', shares: Math.round(sharesTotal * 0.48), isPlayer: false },
      { holderName: isPublic ? 'Public Float' : 'Institutional VCs', shares: Math.round(sharesTotal * 0.52), isPlayer: false },
    ],
    pricePerShare: 1,
    peRatio: 0,
    productQuality: Math.round(45 + rng() * 45),
    securityLevel: Math.round(50 + rng() * 45),
    users,
    growthRate: Number((0.02 + rng() * 0.08).toFixed(3)),
    hype: Math.round(35 + rng() * 45),
    vision: 'BALANCED',
    employees: [],
    departmentHeads: createDefaultDeptHeads(rng, false),
    features: createSectorFeatures(sector),
    activeFeatureId: null,
    exchangeFeeBps: sector === 'CRYPTO_EXCHANGE' ? 25 : undefined,
    dailyVolume: sector === 'CRYPTO_EXCHANGE' ? Math.round(users * 120) : undefined,
    manufacturing:
      sector === 'MANUFACTURING'
        ? {
            factoryLines: stage === 'PUBLIC' ? 6 : 2,
            utilizationPct: 80,
            unitCost: 42,
            unitPrice: 74,
            defectRatePct: 2.5,
            monthlyUnitsProduced: Math.round(users * 0.4),
            activeContracts: stage === 'PUBLIC' ? 8 : 2,
          }
        : undefined,
    subsidiaries: sector === 'HOLDING_CO' ? [] : undefined,
  };

  company.valuation = computeRealisticValuation(company, macro);
  company.pricePerShare = Number((company.valuation / company.sharesTotal).toFixed(2));
  company.peRatio = calculateCompanyPeRatio(company);
  company.valuationHistory = [
    Math.round(company.valuation * (0.88 + rng() * 0.1)),
    Math.round(company.valuation * (0.94 + rng() * 0.07)),
    company.valuation,
  ];
  return company;
}

export function createInitialMacro(): MacroEconomy {
  return {
    regime: 'EXPANSION',
    interestRate: 4.25,
    inflationRate: 2.7,
    gdpGrowth: 2.8,
    marketSentiment: 1.05,
    cryptoSentiment: 1.0,
    commodityIndex: 1.0,
    regimeDaysLeft: 180,
  };
}

const REGIME_TARGETS: Record<
  MacroRegime,
  { rate: number; inf: number; gdp: number; mkt: number; crypto: number; label: string }
> = {
  EXPANSION: { rate: 4.0, inf: 2.5, gdp: 2.9, mkt: 1.06, crypto: 1.04, label: 'Steady Economic Expansion' },
  AI_MANIA: { rate: 4.5, inf: 3.1, gdp: 3.8, mkt: 1.32, crypto: 1.28, label: 'AI Capital Supercycle' },
  BOOM: { rate: 2.5, inf: 3.4, gdp: 4.4, mkt: 1.26, crypto: 1.48, label: 'Zero-Rate Liquidity Boom' },
  RATE_HIKE: { rate: 6.5, inf: 5.4, gdp: 1.1, mkt: 0.78, crypto: 0.65, label: 'Central Bank Tightening' },
  RECESSION: { rate: 3.0, inf: 1.6, gdp: -1.8, mkt: 0.66, crypto: 0.54, label: 'Credit Contraction Recession' },
  CRYPTO_WINTER: { rate: 5.25, inf: 3.8, gdp: 1.7, mkt: 0.92, crypto: 0.44, label: 'Digital Asset Liquidity Freeze' },
};

export function stepMacroMonthly(
  macro: MacroEconomy,
  rng: () => number,
  totalDays: number
): { macro: MacroEconomy; event?: WorldEvent; news?: NewsArticle } {
  const next = { ...macro, regimeDaysLeft: macro.regimeDaysLeft - 30 };
  let event: WorldEvent | undefined;
  let news: NewsArticle | undefined;

  if (next.regimeDaysLeft <= 0) {
    const regimes: MacroRegime[] = ['EXPANSION', 'AI_MANIA', 'BOOM', 'RATE_HIKE', 'RECESSION', 'CRYPTO_WINTER'];
    const candidates = regimes.filter((r) => r !== next.regime);
    const chosen = candidates[Math.floor(rng() * candidates.length)];
    next.regime = chosen;
    next.regimeDaysLeft = 150 + Math.floor(rng() * 180);
    const info = REGIME_TARGETS[chosen];
    event = {
      id: `evt_macro_${totalDays}_${Math.floor(rng() * 1000)}`,
      day: totalDays,
      title: `Macro Shift: ${info.label}`,
      description: `Global markets enter ${chosen.replace('_', ' ')} — central bank rates trending toward ${info.rate.toFixed(2)}%.`,
      category: 'MACRO',
      sentiment: info.mkt >= 1.0 ? 'POSITIVE' : 'NEGATIVE',
    };
    news = {
      id: `news_macro_${totalDays}`,
      day: totalDays,
      headline: `BREAKING: Economy Pivots Into ${info.label}`,
      summary: `Central bank signals policy rate target near ${info.rate.toFixed(2)}% as GDP tracks ${info.gdp.toFixed(1)}%.`,
      source: 'Bloomberg 16-Bit',
      category: 'BREAKING',
      affectedSector: 'ALL',
      sentiment: info.mkt >= 1.0 ? 'POSITIVE' : 'NEGATIVE',
      marketImpactPct: Number(((info.mkt - 1) * 12).toFixed(1)),
    };
  }

  const target = REGIME_TARGETS[next.regime];
  next.interestRate = Number((next.interestRate + (target.rate - next.interestRate) * 0.25 + (rng() - 0.5) * 0.15).toFixed(2));
  next.inflationRate = Number(Math.max(0.5, next.inflationRate + (target.inf - next.inflationRate) * 0.25 + (rng() - 0.5) * 0.2).toFixed(2));
  next.gdpGrowth = Number((next.gdpGrowth + (target.gdp - next.gdpGrowth) * 0.3 + (rng() - 0.5) * 0.25).toFixed(2));
  next.marketSentiment = Number(
    Math.max(0.6, Math.min(1.45, next.marketSentiment + (target.mkt - next.marketSentiment) * 0.25 + (rng() - 0.5) * 0.03)).toFixed(3)
  );
  next.cryptoSentiment = Number(
    Math.max(0.4, Math.min(1.85, next.cryptoSentiment + (target.crypto - next.cryptoSentiment) * 0.28 + (rng() - 0.5) * 0.06)).toFixed(3)
  );
  next.commodityIndex = Number(
    Math.max(0.75, Math.min(1.45, next.commodityIndex + (rng() - 0.5) * 0.06)).toFixed(2)
  );

  return { macro: next, event, news };
}

export function generateMonthlyNews(
  macro: MacroEconomy,
  rng: () => number,
  totalDays: number
): { article: NewsArticle; commodityDelta: number } {
  const tpl = NEWS_TEMPLATES[Math.floor(rng() * NEWS_TEMPLATES.length)];
  const source = NEWS_SOURCES[Math.floor(rng() * NEWS_SOURCES.length)];
  return {
    article: {
      id: `news_${totalDays}_${Math.floor(rng() * 10000)}`,
      day: totalDays,
      headline: tpl.headline,
      summary: `${tpl.summary} (Macro: ${macro.regime.replace('_', ' ')})`,
      source,
      category: tpl.category,
      affectedSector: tpl.affectedSector,
      sentiment: tpl.sentiment,
      marketImpactPct: tpl.marketImpactPct,
    },
    commodityDelta: tpl.commodityDelta ?? 0,
  };
}

export function generatePendingDecision(
  company: Company,
  totalDays: number,
  rng: () => number
): PendingDecision {
  const templates: Omit<PendingDecision, 'id' | 'day' | 'companyId'>[] = [
    {
      title: `Press Rumor Targets ${company.name}`,
      description: `An industry columnist questioned ${company.name}'s unit economics ahead of next quarter.`,
      category: 'TECH',
      choices: [
        {
          id: 'pr_campaign',
          label: 'Publish Audited Metrics + PR Blitz ($12K)',
          costCash: 12000,
          effectSummary: '+12 Hype, +4 Reputation',
          cashDelta: -12000,
          hypeDelta: 12,
          qualityDelta: 0,
          reputationDelta: 4,
          growthDelta: 0.015,
        },
        {
          id: 'ignore_focus',
          label: 'Ignore Noise & Focus on Product',
          costCash: 0,
          effectSummary: '+4 Quality, -3 Hype',
          cashDelta: 0,
          hypeDelta: -3,
          qualityDelta: 4,
          reputationDelta: 1,
          growthDelta: 0.005,
        },
      ],
    },
    {
      title: `Enterprise Anchor Contract Opportunity`,
      description: `A Fortune 500 buyer wants a custom deployment from ${company.name} with strict SLA guarantees.`,
      category: 'MARKETS',
      choices: [
        {
          id: 'sign_enterprise',
          label: 'Commit Dedicated Engineering ($18K)',
          costCash: 18000,
          effectSummary: '+$45K Signing Cash, +3% Growth, +3 Quality',
          cashDelta: 27000,
          hypeDelta: 6,
          qualityDelta: 3,
          reputationDelta: 5,
          growthDelta: 0.03,
        },
        {
          id: 'decline_custom',
          label: 'Stick to Standard Self-Serve Roadmap',
          costCash: 0,
          effectSummary: '+5 Quality, +1% Growth',
          cashDelta: 0,
          hypeDelta: 0,
          qualityDelta: 5,
          reputationDelta: 0,
          growthDelta: 0.01,
        },
      ],
    },
    {
      title: `Supply & Infrastructure Efficiency Audit`,
      description: `An external operations partner offers to automate workflows and cut recurring waste.`,
      category: 'INDUSTRIAL',
      choices: [
        {
          id: 'automate_ops',
          label: 'Deploy Automation Suite ($15K)',
          costCash: 15000,
          effectSummary: '+6 Quality, +2% Growth',
          cashDelta: -15000,
          hypeDelta: 3,
          qualityDelta: 6,
          reputationDelta: 2,
          growthDelta: 0.02,
        },
        {
          id: 'defer_audit',
          label: 'Preserve Cash Reserves',
          costCash: 0,
          effectSummary: 'No cash spent',
          cashDelta: 0,
          hypeDelta: 0,
          qualityDelta: 0,
          reputationDelta: 0,
          growthDelta: 0,
        },
      ],
    },
  ];

  const picked = templates[Math.floor(rng() * templates.length)];
  return {
    ...picked,
    id: `dec_${totalDays}_${Math.floor(rng() * 10000)}`,
    day: totalDays,
    companyId: company.id,
  };
}

export function createInitialCryptoMarket(rng: () => number): CryptoCoin[] {
  const seeds = [
    { name: 'BitLedger', symbol: 'BTCL', supply: 21_000_000, price: 64200, utility: 92, hype: 78, yield: 0 },
    { name: 'EtherGrid', symbol: 'ETHG', supply: 120_000_000, price: 3180, utility: 90, hype: 74, yield: 3.8 },
    { name: 'SolanaPulse', symbol: 'SOLP', supply: 460_000_000, price: 148, utility: 82, hype: 81, yield: 6.2 },
    { name: 'PixelDoge', symbol: 'PDOG', supply: 10_000_000_000, price: 0.14, utility: 22, hype: 88, yield: 0 },
  ];
  return seeds.map((s, i) => ({
    id: `coin_seed_${i}`,
    name: s.name,
    symbol: s.symbol,
    creatorCompanyId: null,
    isPlayerCreated: false,
    totalSupply: s.supply,
    circulatingSupply: Math.round(s.supply * 0.85),
    price: s.price,
    marketCap: Math.round(s.supply * 0.85 * s.price),
    hype: s.hype,
    utility: s.utility,
    stakingYieldApr: s.yield,
    playerHoldings: 0,
    priceHistory: [
      Number((s.price * (0.88 + rng() * 0.12)).toFixed(4)),
      Number((s.price * (0.94 + rng() * 0.1)).toFixed(4)),
      s.price,
    ],
  }));
}

export function generateVcOfferForCompany(company: Company, macro: MacroEconomy, rng: () => number, totalDays: number): VcOffer | null {
  if (company.isPublic || company.status !== 'ACTIVE') return null;

  const roundMap: Record<CompanyStage, { next: string; eqMin: number; eqMax: number }> = {
    SEED: { next: 'Seed Round', eqMin: 12, eqMax: 22 },
    SERIES_A: { next: 'Series A', eqMin: 14, eqMax: 22 },
    SERIES_B: { next: 'Series B', eqMin: 11, eqMax: 18 },
    GROWTH: { next: 'Series C Growth', eqMin: 8, eqMax: 15 },
    PUBLIC: { next: 'Secondary', eqMin: 5, eqMax: 10 },
  };

  const cfg = roundMap[company.stage];
  const preMoney = Math.round(company.valuation * (0.9 + rng() * 0.24) * (0.8 + macro.marketSentiment * 0.2));
  const equityPercent = Number((cfg.eqMin + rng() * (cfg.eqMax - cfg.eqMin)).toFixed(1));
  const amount = Math.round((preMoney * (equityPercent / (100 - equityPercent))) / 1000) * 1000;
  const firmName = VC_FIRM_NAMES[Math.floor(rng() * VC_FIRM_NAMES.length)];

  return {
    id: `vco_${totalDays}_${Math.floor(rng() * 100000)}`,
    companyId: company.id,
    firmName,
    roundName: cfg.next,
    amount: Math.max(150_000, amount),
    preMoneyValuation: preMoney,
    equityPercent,
    boardSeat: equityPercent >= 15 || company.stage !== 'SEED',
    investorQuality: Math.round(62 + rng() * 36),
    expiryDay: totalDays + 45,
  };
}

export function stepWorldCompaniesMonthly(
  state: SimState,
  rng: () => number
): { companies: Company[]; newEvents: WorldEvent[]; newArticles: NewsArticle[]; fundPayouts: Record<string, number> } {
  const newEvents: WorldEvent[] = [];
  const newArticles: NewsArticle[] = [];
  const fundPayouts: Record<string, number> = {};
  const nextCompanies: Company[] = [];

  for (const comp of state.companies) {
    if (comp.isPlayerOwned || comp.status !== 'ACTIVE') {
      nextCompanies.push(comp);
      continue;
    }

    const c = { ...comp, valuationHistory: [...comp.valuationHistory] };

    // Logistic TAM-bounded user growth for realistic global economy
    c.users = applyLogisticUserGrowth(c.users, c.sector, c.growthRate * 0.75 + (rng() - 0.45) * 0.03, state.macro);
    const arpu = PRICING_ARPU[c.pricingTier];
    const paidRatio = c.pricingTier === 'FREEMIUM' ? 0.14 : c.pricingTier === 'STANDARD' ? 0.28 : 0.08;
    const targetRev = c.users * paidRatio * arpu * (0.8 + c.productQuality / 160);
    c.monthlyRevenue = Math.max(2000, Math.round(c.monthlyRevenue * 0.35 + targetRev * 0.65));

    // Scale-realistic operating margin (mega-companies settle around 15-30% operating margin, not 99%)
    const opRatio = c.isPublic ? 0.74 + rng() * 0.16 : 0.84 + rng() * 0.42;
    c.monthlyExpenses = Math.max(5000, Math.round(c.monthlyRevenue * opRatio));
    const netBeforeTax = c.monthlyRevenue - c.monthlyExpenses;
    const corpTax = netBeforeTax > 0 ? Math.round(netBeforeTax * 0.21) : 0;
    c.cash += netBeforeTax - corpTax;

    // NPC Startup fundraising or bankruptcy
    if (c.cash < 0) {
      if (state.macro.marketSentiment > 0.88 && rng() < 0.6) {
        const rescueCash = Math.round(Math.min(25_000_000, c.valuation * 0.14));
        c.cash += rescueCash;
      } else {
        c.status = 'BANKRUPT';
        c.cash = 0;
        c.valuation = 0;
        c.pricePerShare = 0;
        newEvents.push({
          id: `evt_bankrupt_${c.id}_${state.totalDays}`,
          day: state.totalDays,
          title: `${c.name} Files Bankruptcy`,
          description: `Unable to service burn during ${state.macro.regime.replace('_', ' ')}, ${c.name} shutters operations.`,
          category: 'STARTUP',
          sentiment: 'NEGATIVE',
        });
        newArticles.push({
          id: `news_bankrupt_${c.id}_${state.totalDays}`,
          day: state.totalDays,
          headline: `${c.name} Enters Chapter 7 Liquidation`,
          summary: `High rates and margin pressure force ${c.name} to cease operations.`,
          source: 'Financial Ledger',
          category: 'MARKETS',
          affectedSector: c.sector,
          sentiment: 'NEGATIVE',
          marketImpactPct: -2.4,
        });
        nextCompanies.push(c);
        continue;
      }
    }

    // Occasional IPO
    if (!c.isPublic && c.valuation > 45_000_000 && c.monthlyRevenue > 450_000 && rng() < 0.08) {
      c.isPublic = true;
      c.stage = 'PUBLIC';
      c.sharesTotal = 50_000_000;
      c.cash += Math.round(c.valuation * 0.16);
      newEvents.push({
        id: `evt_ipo_${c.id}_${state.totalDays}`,
        day: state.totalDays,
        title: `${c.name} (${c.ticker}) Rings IPO Bell`,
        description: `Debuted on the public exchange at $${(c.valuation / 1_000_000).toFixed(1)}M valuation.`,
        category: 'MARKET',
        sentiment: 'POSITIVE',
      });
      newArticles.push({
        id: `news_ipo_${c.id}_${state.totalDays}`,
        day: state.totalDays,
        headline: `${c.name} (${c.ticker}) Debuts on Pixel Stock Exchange`,
        summary: `Institutional demand lifts ${c.name} to a $${(c.valuation / 1_000_000).toFixed(1)}M IPO market cap.`,
        source: 'Pixel Street Journal',
        category: 'MARKETS',
        affectedSector: c.sector,
        sentiment: 'POSITIVE',
        marketImpactPct: 3.1,
      });
    }

    // Occasional Acquisition of private startups
    if (!c.isPublic && c.productQuality > 62 && rng() < 0.03) {
      const acqMultiple = 1.2 + rng() * 0.35;
      const acqPrice = Math.round(c.valuation * acqMultiple);
      c.status = 'ACQUIRED';
      c.valuation = acqPrice;
      c.acquiredBy = 'Global Tech Conglomerate';
      fundPayouts[c.id] = acqPrice;
      newEvents.push({
        id: `evt_acq_${c.id}_${state.totalDays}`,
        day: state.totalDays,
        title: `${c.name} Acquired for $${(acqPrice / 1_000_000).toFixed(1)}M`,
        description: `Strategic buyout delivers a ${(acqMultiple * 100 - 100).toFixed(0)}% premium to shareholders & VC backers.`,
        category: 'STARTUP',
        sentiment: 'POSITIVE',
      });
      nextCompanies.push(c);
      continue;
    }

    // Revalue realistically
    c.valuation = computeRealisticValuation(c, state.macro);
    c.pricePerShare = Number(Math.max(0.1, c.valuation / c.sharesTotal).toFixed(2));
    c.peRatio = calculateCompanyPeRatio(c);
    c.valuationHistory.push(c.valuation);
    if (c.valuationHistory.length > 24) c.valuationHistory.shift();

    nextCompanies.push(c);
  }

  // Spawn new NPC startups so the world feels alive
  const activeNpcCount = nextCompanies.filter((c) => !c.isPlayerOwned && c.status === 'ACTIVE').length;
  if (activeNpcCount < 16 && rng() < 0.55) {
    const sectors: VentureSector[] = [
      'SAAS', 'AI_LAB', 'FINTECH', 'CRYPTO_EXCHANGE', 'BIOTECH', 'GAMING',
      'HARDWARE', 'MANUFACTURING', 'RETAIL_COMMERCE', 'ENERGY_INFRA',
    ];
    const sector = sectors[Math.floor(rng() * sectors.length)];
    const spawned = createWorldCompany(
      rng,
      `npc_${state.totalDays}_${Math.floor(rng() * 10000)}`,
      sector,
      'SEED',
      state.totalDays,
      state.macro
    );
    nextCompanies.push(spawned);
    newEvents.push({
      id: `evt_spawn_${spawned.id}`,
      day: state.totalDays,
      title: `New Entrant: ${spawned.name}`,
      description: `A fresh ${spawned.sector.replace('_', ' ')} startup launched with $${(spawned.cash / 1000).toFixed(0)}k seed funding.`,
      category: 'STARTUP',
      sentiment: 'NEUTRAL',
    });
  }

  return { companies: nextCompanies, newEvents, newArticles, fundPayouts };
}

export function stepPublicPricesDaily(companies: Company[], macro: MacroEconomy, rng: () => number): Company[] {
  return companies.map((c) => {
    if (!c.isPublic || c.status !== 'ACTIVE') return c;
    const fundamentalPrice = c.valuation / c.sharesTotal;
    const reversion = (fundamentalPrice - c.pricePerShare) * 0.12;
    const vol = c.sector === 'CRYPTO_EXCHANGE' || c.sector === 'AI_LAB' ? 0.025 : 0.014;
    const shock = c.pricePerShare * ((rng() - 0.5) * vol + (macro.marketSentiment - 1) * 0.002);
    const nextPrice = Number(Math.max(0.25, c.pricePerShare + reversion + shock).toFixed(2));
    return {
      ...c,
      pricePerShare: nextPrice,
      valuation: Math.min(650_000_000_000, Math.round(nextPrice * c.sharesTotal)),
    };
  });
}

export function stepCryptoCoinsDaily(coins: CryptoCoin[], macro: MacroEconomy, rng: () => number): CryptoCoin[] {
  return coins.map((coin) => {
    const sentimentDrag = (macro.cryptoSentiment - 1.0) * 0.008;
    const hypeFactor = ((coin.hype - 50) / 100) * 0.007;
    const utilityAnchor = coin.utility / 100;
    const volatility = coin.isPlayerCreated ? 0.048 : 0.036 * (1.25 - utilityAnchor * 0.35);
    const pctMove = (rng() - 0.498) * volatility + sentimentDrag + hypeFactor;
    // Cap absurd crypto runaway while letting winners 5x-50x organically
    const rawNext = coin.price * (1 + pctMove);
    const nextPrice = Math.max(0.0005, Math.min(450_000, Number(rawNext.toFixed(coin.price < 1 ? 4 : 2))));
    const nextHistory = [...coin.priceHistory, nextPrice];
    if (nextHistory.length > 30) nextHistory.shift();
    return {
      ...coin,
      price: nextPrice,
      marketCap: Math.round(nextPrice * coin.circulatingSupply),
      hype: Math.max(8, Math.min(96, Math.round(coin.hype + (rng() - 0.51) * 3))),
      priceHistory: nextHistory,
    };
  });
}
