import {
  Employee,
  EmployeeRole,
  JobPosting,
  LifestyleTier,
  MacroRegime,
  NewsCategory,
  PersonalAssetCatalogItem,
  PricingTier,
  ProductFeature,
  SideHustleGig,
  VentureSector,
} from './types';

export function createRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function nextSeed(seed: number): number {
  let s = (seed * 48271) % 2147483647;
  if (s <= 0) s += 2147483646;
  return s;
}

const FIRST_NAMES = [
  'Maya', 'Liam', 'Sora', 'Devon', 'Elena', 'Marcus', 'Priya', 'Noah',
  'Kira', 'Julian', 'Tessa', 'Arjun', 'Nadia', 'Caleb', 'Zoe', 'Lucas',
  'Hana', 'Tariq', 'Chloe', 'Victor', 'Aiden', 'Yuki', 'Samir', 'Clara',
];

const LAST_NAMES = [
  'Chen', 'Patel', 'Vance', 'Nakamura', 'Kowalski', 'Alvarez', 'Okafor',
  'Lindqvist', 'Mercer', 'Sato', 'Moreau', 'Kim', 'Bauer', 'Solis',
  'Reyes', 'Das', 'Volkov', 'Sterling', 'Park', 'Gallagher',
];

export const STARTUP_PREFIXES = [
  'Pixel', 'Hyper', 'Nova', 'Apex', 'Vault', 'Pulse', 'Strata', 'Lattice',
  'Helios', 'Kinetix', 'Velo', 'Forge', 'Aether', 'Cortex', 'Prism', 'Quorum',
  'Nimbus', 'Chrono', 'Veridian', 'Cobalt', 'Foundry', 'Beacon', 'Vector', 'Titan',
];

export const STARTUP_SUFFIXES = [
  'Labs', 'Cloud', 'Protocol', 'Dynamics', 'Systems', 'AI', 'Exchange',
  'Pay', 'Works', 'Flow', 'Bio', 'Network', 'Stack', 'Compute', 'Manufacturing', 'Holdings',
];

export const VC_FIRM_NAMES = [
  'Sequoia Pixel Partners',
  'Benchmark Horizon',
  'Founders Guild Capital',
  'Northstar Ventures',
  'Redwood Crest VC',
  'Paradigm Shift Capital',
  'Vertex Alpha Fund',
  'Cobalt Hill Ventures',
];

export const SECTOR_LABELS: Record<VentureSector, string> = {
  SAAS: 'B2B SaaS',
  AI_LAB: 'AI Frontier',
  FINTECH: 'FinTech',
  CRYPTO_EXCHANGE: 'Crypto Exchange',
  BIOTECH: 'BioTech',
  GAMING: 'Game Studio',
  HARDWARE: 'Deep Hardware',
  MANUFACTURING: 'Manufacturing Plant',
  HOLDING_CO: 'Holding Company',
  RETAIL_COMMERCE: 'E-Commerce Brand',
  MEDIA_STUDIO: 'Media Network',
  ENERGY_INFRA: 'Clean Energy Grid',
};

// Realistic EV / Annualized Revenue Multiples
export const SECTOR_REVENUE_MULTIPLES: Record<VentureSector, number> = {
  SAAS: 6.5,
  AI_LAB: 9.5,
  FINTECH: 5.5,
  CRYPTO_EXCHANGE: 6.0,
  BIOTECH: 7.5,
  GAMING: 4.2,
  HARDWARE: 3.4,
  MANUFACTURING: 2.2,
  HOLDING_CO: 3.8,
  RETAIL_COMMERCE: 2.0,
  MEDIA_STUDIO: 3.0,
  ENERGY_INFRA: 4.5,
};

// Realistic Total Addressable Market (active customers / units / accounts) to prevent infinite exponential blowup
export const SECTOR_TAM_USERS: Record<VentureSector, number> = {
  SAAS: 450_000,
  AI_LAB: 1_200_000,
  FINTECH: 2_800_000,
  CRYPTO_EXCHANGE: 3_500_000,
  BIOTECH: 180_000,
  GAMING: 8_000_000,
  HARDWARE: 650_000,
  MANUFACTURING: 240_000,
  HOLDING_CO: 50_000,
  RETAIL_COMMERCE: 2_400_000,
  MEDIA_STUDIO: 6_500_000,
  ENERGY_INFRA: 320_000,
};

export const PRICING_ARPU: Record<PricingTier, number> = {
  FREEMIUM: 4.5,
  STANDARD: 19,
  ENTERPRISE: 65,
};

export const LIFESTYLE_COSTS: Record<
  LifestyleTier,
  { label: string; monthlyCost: number; stressDelta: number; repBonus: number }
> = {
  COUCH_SURFER: { label: 'Couch / Shelter', monthlyCost: 380, stressDelta: 7, repBonus: -1 },
  SHARED_ROOM: { label: 'Shared Room', monthlyCost: 950, stressDelta: 4, repBonus: 0 },
  RAMEN_STUDIO: { label: 'Ramen Studio', monthlyCost: 1800, stressDelta: 2, repBonus: 0 },
  LOFT_APARTMENT: { label: 'City Loft', monthlyCost: 4500, stressDelta: -1, repBonus: 2 },
  PENTHOUSE: { label: 'Skyline Penthouse', monthlyCost: 14000, stressDelta: -4, repBonus: 6 },
  ESTATE: { label: 'Coastal Estate', monthlyCost: 38000, stressDelta: -7, repBonus: 12 },
};

export const SIDE_HUSTLE_GIGS: SideHustleGig[] = [
  {
    id: 'gig_odd_labor',
    title: 'Scrap Haul + Odd Chores',
    category: 'GIG',
    payoutCash: 34,
    energyCost: 12,
    stressGain: 3,
    skillRequired: 0,
    skillGain: 1,
    repGain: 0,
  },
  {
    id: 'gig_delivery',
    title: 'Bike Courier + Food Delivery',
    category: 'GIG',
    payoutCash: 62,
    energyCost: 18,
    stressGain: 4,
    skillRequired: 5,
    skillGain: 1,
    repGain: 0,
  },
  {
    id: 'gig_store_setup',
    title: 'Freelance Storefront + Logo Gig',
    category: 'FREELANCE',
    payoutCash: 210,
    energyCost: 24,
    stressGain: 5,
    skillRequired: 20,
    skillGain: 2,
    repGain: 1,
  },
  {
    id: 'gig_web_dev',
    title: 'Freelance Web + Automation Contract',
    category: 'FREELANCE',
    payoutCash: 540,
    energyCost: 32,
    stressGain: 6,
    skillRequired: 42,
    skillGain: 3,
    repGain: 2,
  },
  {
    id: 'gig_consulting',
    title: 'Fractional Growth Consulting Sprint',
    category: 'CONSULTING',
    payoutCash: 1450,
    energyCost: 40,
    stressGain: 7,
    skillRequired: 68,
    skillGain: 2,
    repGain: 3,
  },
];

const JOB_TEMPLATES: Omit<JobPosting, 'id' | 'employer'>[] = [
  { title: 'Warehouse Picker (Night Shift)', monthlyPay: 2150, stressPerMonth: 12, skillRequired: 8, repRequired: 5, isRemote: false },
  { title: 'Retail Cashier + Stock Clerk', monthlyPay: 2350, stressPerMonth: 10, skillRequired: 12, repRequired: 8, isRemote: false },
  { title: 'Customer Support Rep', monthlyPay: 3100, stressPerMonth: 8, skillRequired: 22, repRequired: 15, isRemote: true },
  { title: 'Junior Ecommerce Coordinator', monthlyPay: 3900, stressPerMonth: 7, skillRequired: 34, repRequired: 22, isRemote: true },
  { title: 'Full-Stack Software Engineer', monthlyPay: 7800, stressPerMonth: 6, skillRequired: 54, repRequired: 32, isRemote: true },
  { title: 'Growth Marketing Lead', monthlyPay: 8600, stressPerMonth: 8, skillRequired: 62, repRequired: 40, isRemote: true },
  { title: 'Principal Quant / Eng Director', monthlyPay: 14200, stressPerMonth: 10, skillRequired: 78, repRequired: 55, isRemote: false },
];

const EMPLOYERS = [
  'MetroLogistics Co.',
  'FreshCart Depot',
  'CloudDesk Support',
  'PixelGoods Retail',
  'Northstar Software',
  'BrightWave Digital',
  'Apex Quantitative',
];

export function generateJobMarket(rng: () => number, regime: MacroRegime): JobPosting[] {
  const payMult = regime === 'BOOM' || regime === 'AI_MANIA' ? 1.12 : regime === 'RECESSION' ? 0.88 : 1.0;
  return JOB_TEMPLATES.map((tpl, idx) => ({
    ...tpl,
    id: `job_${idx}_${Math.floor(rng() * 10000)}`,
    employer: EMPLOYERS[idx % EMPLOYERS.length],
    monthlyPay: Math.round(tpl.monthlyPay * payMult * (0.95 + rng() * 0.1)),
  }));
}

export const PERSONAL_ASSETS_CATALOG: PersonalAssetCatalogItem[] = [
  {
    id: 'asset_condo',
    name: 'SoMa Smart Loft',
    category: 'REAL_ESTATE',
    price: 420_000,
    monthlyUpkeep: 1200,
    appreciationRate: 0.055,
    reputationBoost: 5,
    stressRelief: 4,
  },
  {
    id: 'asset_ev',
    name: 'Apex GT Electric Coupe',
    category: 'VEHICLE',
    price: 95_000,
    monthlyUpkeep: 600,
    appreciationRate: -0.06,
    reputationBoost: 4,
    stressRelief: 3,
  },
  {
    id: 'asset_villa',
    name: 'Tahoe Timber Villa',
    category: 'REAL_ESTATE',
    price: 1_850_000,
    monthlyUpkeep: 4200,
    appreciationRate: 0.065,
    reputationBoost: 10,
    stressRelief: 10,
  },
  {
    id: 'asset_watch',
    name: 'Chrono-16 Tourbillon Watch',
    category: 'COLLECTIBLE',
    price: 65_000,
    monthlyUpkeep: 100,
    appreciationRate: 0.04,
    reputationBoost: 6,
    stressRelief: 2,
  },
  {
    id: 'asset_jet',
    name: 'Fractional Horizon Jet Share',
    category: 'VEHICLE',
    price: 3_200_000,
    monthlyUpkeep: 18000,
    appreciationRate: -0.04,
    reputationBoost: 15,
    stressRelief: 8,
  },
  {
    id: 'asset_island',
    name: 'Emerald Cay Private Retreat',
    category: 'REAL_ESTATE',
    price: 14_500_000,
    monthlyUpkeep: 28000,
    appreciationRate: 0.075,
    reputationBoost: 24,
    stressRelief: 20,
  },
];

export const NEWS_SOURCES = [
  'Pixel Street Journal',
  'Silicon Wire',
  'Bloomberg 16-Bit',
  'Financial Ledger',
  'Industrial Dispatch',
  'ChainPulse Daily',
];

export interface NewsTemplate {
  headline: string;
  summary: string;
  category: NewsCategory;
  affectedSector: VentureSector | 'ALL';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  marketImpactPct: number;
  commodityDelta?: number;
}

export const NEWS_TEMPLATES: NewsTemplate[] = [
  {
    headline: 'Global Chip Fabrication Bottleneck Eases as New Foundries Come Online',
    summary: 'Lead times for industrial controllers and server silicon dropped 22% this month, boosting manufacturing margins.',
    category: 'INDUSTRIAL',
    affectedSector: 'MANUFACTURING',
    sentiment: 'POSITIVE',
    marketImpactPct: 3.5,
    commodityDelta: -0.08,
  },
  {
    headline: 'Lithium & Copper Futures Surge on Grid Electrification Demand',
    summary: 'Raw industrial input prices spiked 11%, squeezing hardware and factory gross margins.',
    category: 'ECONOMY',
    affectedSector: 'MANUFACTURING',
    sentiment: 'NEGATIVE',
    marketImpactPct: -3.2,
    commodityDelta: 0.11,
  },
  {
    headline: 'Enterprise Cloud Budgets Expand 14% Across Fortune 1000',
    summary: 'CIO surveys point to accelerating SaaS and AI automation adoption across mid-market and enterprise teams.',
    category: 'TECH',
    affectedSector: 'SAAS',
    sentiment: 'POSITIVE',
    marketImpactPct: 4.1,
  },
  {
    headline: 'Regulators Propose Strict Stablecoin & Exchange Reserve Audits',
    summary: 'New proof-of-reserve mandates reward compliant exchanges while pressuring thinly capitalized trading venues.',
    category: 'POLICY',
    affectedSector: 'CRYPTO_EXCHANGE',
    sentiment: 'NEUTRAL',
    marketImpactPct: -1.8,
  },
  {
    headline: 'Sovereign Wealth Funds Allocate $40B to Clean Grid & Industrial Infrastructure',
    summary: 'Long-term power purchase agreements and automated factories attract institutional capital.',
    category: 'MARKETS',
    affectedSector: 'ENERGY_INFRA',
    sentiment: 'POSITIVE',
    marketImpactPct: 5.2,
  },
  {
    headline: 'Consumer Discretionary Spending Cools Amid Sticky Services Inflation',
    summary: 'Retail & e-commerce conversion rates dipped slightly as households prioritize essentials.',
    category: 'ECONOMY',
    affectedSector: 'RETAIL_COMMERCE',
    sentiment: 'NEGATIVE',
    marketImpactPct: -2.6,
  },
  {
    headline: 'Breakthrough Open-Weight Reasoning Models Spark Startup Wave',
    summary: 'Lower inference costs unlock vertical AI apps while intensifying pricing competition among labs.',
    category: 'TECH',
    affectedSector: 'AI_LAB',
    sentiment: 'POSITIVE',
    marketImpactPct: 4.8,
  },
  {
    headline: 'Conglomerate M&A Activity Hits 3-Year High as Cash-Rich Holdings Hunt Bargains',
    summary: 'Holding companies deploy balance-sheet cash to roll up profitable niche software and industrial plants.',
    category: 'MARKETS',
    affectedSector: 'HOLDING_CO',
    sentiment: 'POSITIVE',
    marketImpactPct: 3.8,
  },
];

export function randomPersonName(rng: () => number): string {
  const f = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

export function randomCompanyName(rng: () => number): { name: string; ticker: string } {
  const p = STARTUP_PREFIXES[Math.floor(rng() * STARTUP_PREFIXES.length)];
  const s = STARTUP_SUFFIXES[Math.floor(rng() * STARTUP_SUFFIXES.length)];
  const name = `${p} ${s}`;
  const ticker = (p.slice(0, 2) + s.slice(0, 2)).toUpperCase();
  return { name, ticker };
}

const ROLE_BASE_SALARY: Record<EmployeeRole, number> = {
  Engineer: 9500,
  Designer: 8000,
  Marketer: 7500,
  Sales: 8200,
  Quant: 12000,
  Security: 10500,
  Operator: 6400,
};

export function generateCandidate(rng: () => number, idSuffix: string): Employee {
  const roles: EmployeeRole[] = ['Engineer', 'Designer', 'Marketer', 'Sales', 'Quant', 'Security', 'Operator'];
  const role = roles[Math.floor(rng() * roles.length)];
  const skill = Math.round(45 + rng() * 52);
  const salary = Math.round(ROLE_BASE_SALARY[role] * (0.75 + (skill / 100) * 0.65));
  return {
    id: `emp_${idSuffix}_${Math.floor(rng() * 100000)}`,
    name: randomPersonName(rng),
    role,
    skill,
    salary,
    morale: Math.round(70 + rng() * 25),
  };
}

export function createSectorFeatures(sector: VentureSector): ProductFeature[] {
  const base: Omit<ProductFeature, 'id' | 'progress' | 'completed'>[] =
    sector === 'MANUFACTURING'
      ? [
          { name: 'Automated CNC Cell', category: 'INDUSTRIAL', maxProgress: 100, qualityBoost: 14, growthBoost: 0.03 },
          { name: 'Lean Six-Sigma QA Line', category: 'CORE', maxProgress: 95, qualityBoost: 16, growthBoost: 0.02 },
          { name: 'Robotic Palletizing Bay', category: 'INDUSTRIAL', maxProgress: 130, qualityBoost: 12, growthBoost: 0.04 },
          { name: 'OEM Wholesale Portal', category: 'MONETIZATION', maxProgress: 110, qualityBoost: 8, growthBoost: 0.05 },
          { name: 'ISO-9001 Safety Shield', category: 'SECURITY', maxProgress: 90, qualityBoost: 10, growthBoost: 0.02 },
        ]
      : sector === 'HOLDING_CO'
      ? [
          { name: 'Treasury Cash-Sweep Desk', category: 'CORE', maxProgress: 90, qualityBoost: 14, growthBoost: 0.03 },
          { name: 'M&A Deal Origination Unit', category: 'GROWTH', maxProgress: 110, qualityBoost: 10, growthBoost: 0.05 },
          { name: 'Shared Back-Office Synergy', category: 'MONETIZATION', maxProgress: 120, qualityBoost: 15, growthBoost: 0.03 },
          { name: 'Corporate Bond Issuance', category: 'MONETIZATION', maxProgress: 135, qualityBoost: 12, growthBoost: 0.04 },
          { name: 'Risk & Audit Committee', category: 'SECURITY', maxProgress: 95, qualityBoost: 12, growthBoost: 0.02 },
        ]
      : sector === 'CRYPTO_EXCHANGE'
      ? [
          { name: 'Order Matching Engine', category: 'CORE', maxProgress: 100, qualityBoost: 14, growthBoost: 0.04 },
          { name: 'Cold-Wallet Custody Vault', category: 'SECURITY', maxProgress: 120, qualityBoost: 12, growthBoost: 0.03 },
          { name: 'Perpetual Futures Desk', category: 'MONETIZATION', maxProgress: 140, qualityBoost: 10, growthBoost: 0.05 },
          { name: 'Zero-Fee Referral Loop', category: 'GROWTH', maxProgress: 90, qualityBoost: 6, growthBoost: 0.06 },
          { name: 'Institutional API Gateway', category: 'MONETIZATION', maxProgress: 150, qualityBoost: 15, growthBoost: 0.04 },
        ]
      : sector === 'AI_LAB'
      ? [
          { name: 'Foundation Weights v1', category: 'CORE', maxProgress: 110, qualityBoost: 16, growthBoost: 0.04 },
          { name: 'Inference Quantizer', category: 'CORE', maxProgress: 100, qualityBoost: 12, growthBoost: 0.03 },
          { name: 'Enterprise Fine-Tune Studio', category: 'MONETIZATION', maxProgress: 130, qualityBoost: 11, growthBoost: 0.05 },
          { name: 'Viral Playground SDK', category: 'GROWTH', maxProgress: 90, qualityBoost: 8, growthBoost: 0.06 },
          { name: 'Red-Team Alignment Shield', category: 'SECURITY', maxProgress: 110, qualityBoost: 10, growthBoost: 0.02 },
        ]
      : [
          { name: 'Core Platform v1.0', category: 'CORE', maxProgress: 100, qualityBoost: 15, growthBoost: 0.04 },
          { name: 'Self-Serve Onboarding', category: 'GROWTH', maxProgress: 85, qualityBoost: 8, growthBoost: 0.05 },
          { name: 'Enterprise SSO & Billing', category: 'MONETIZATION', maxProgress: 120, qualityBoost: 12, growthBoost: 0.04 },
          { name: 'SOC2 Encryption Audit', category: 'SECURITY', maxProgress: 95, qualityBoost: 10, growthBoost: 0.02 },
          { name: 'Workflow Automation Engine', category: 'CORE', maxProgress: 140, qualityBoost: 16, growthBoost: 0.05 },
        ];

  return base.map((f, idx) => ({
    ...f,
    id: `feat_${sector}_${idx}`,
    progress: idx === 0 ? 25 : 0,
    completed: false,
  }));
}
