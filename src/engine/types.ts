export type CareerOrigin =
  | 'TECH_FOUNDER'
  | 'CRYPTO_ARCHITECT'
  | 'VC_FINANCIER'
  | 'EVERYDAY_WORKER'
  | 'BROKE_UNEMPLOYED';

export type VentureSector =
  | 'SAAS'
  | 'AI_LAB'
  | 'FINTECH'
  | 'CRYPTO_EXCHANGE'
  | 'BIOTECH'
  | 'GAMING'
  | 'HARDWARE'
  | 'MANUFACTURING'
  | 'HOLDING_CO'
  | 'RETAIL_COMMERCE'
  | 'MEDIA_STUDIO'
  | 'ENERGY_INFRA';

export type MacroRegime =
  | 'EXPANSION'
  | 'AI_MANIA'
  | 'BOOM'
  | 'RATE_HIKE'
  | 'RECESSION'
  | 'CRYPTO_WINTER';

export type StrategicVision = 'BALANCED' | 'HYPERGROWTH' | 'PROFITABILITY' | 'RND_MOAT';

export type CompanyStage = 'SEED' | 'SERIES_A' | 'SERIES_B' | 'GROWTH' | 'PUBLIC';

export type CompanyStatus = 'ACTIVE' | 'ACQUIRED' | 'BANKRUPT';

export type DepartmentRole = 'CTO' | 'CMO' | 'CFO' | 'COO';

export type EmployeeRole =
  | 'Engineer'
  | 'Designer'
  | 'Marketer'
  | 'Sales'
  | 'Quant'
  | 'Security'
  | 'Operator';

export type PricingTier = 'FREEMIUM' | 'STANDARD' | 'ENTERPRISE';

export type FundStrategy =
  | 'EARLY_VC'
  | 'GROWTH_EQUITY'
  | 'HEDGE_QUANT'
  | 'CRYPTO_FUND'
  | 'INDUSTRIAL_PE';

export type LifestyleTier =
  | 'COUCH_SURFER'
  | 'SHARED_ROOM'
  | 'RAMEN_STUDIO'
  | 'LOFT_APARTMENT'
  | 'PENTHOUSE'
  | 'ESTATE';

export interface MacroEconomy {
  regime: MacroRegime;
  interestRate: number; // % e.g., 4.25
  inflationRate: number; // % e.g., 2.8
  gdpGrowth: number; // % e.g., 2.4
  marketSentiment: number; // 0.60 .. 1.45 multiplier
  cryptoSentiment: number; // 0.40 .. 1.85 multiplier
  commodityIndex: number; // 0.75 .. 1.45 impacts manufacturing COGS
  regimeDaysLeft: number;
}

export interface DepartmentHead {
  role: DepartmentRole;
  name: string;
  hired: boolean;
  salary: number; // monthly
  skill: number; // 1..100
  delegated: boolean;
  directive: string;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  skill: number; // 30..100
  salary: number; // monthly USD
  morale: number; // 0..100
}

export interface ProductFeature {
  id: string;
  name: string;
  category: 'CORE' | 'GROWTH' | 'MONETIZATION' | 'SECURITY' | 'INDUSTRIAL';
  progress: number;
  maxProgress: number;
  qualityBoost: number;
  growthBoost: number;
  completed: boolean;
}

export interface ShareholderEntry {
  holderName: string;
  shares: number;
  isPlayer: boolean;
  isFund?: boolean;
}

export interface SubsidiaryHolding {
  companyId: string;
  name: string;
  sector: VentureSector;
  ownershipPct: number;
  monthlyDividend: number;
  acquisitionPrice: number;
}

export interface ManufacturingOps {
  factoryLines: number; // each line produces units/mo
  utilizationPct: number; // 20..100
  unitCost: number; // raw material + labor cost per unit
  unitPrice: number; // wholesale sale price
  defectRatePct: number; // 0.5..12
  monthlyUnitsProduced: number;
  activeContracts: number; // recurring wholesale contracts
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  sector: VentureSector;
  isPlayerOwned: boolean;
  isPublic: boolean;
  stage: CompanyStage;
  status: CompanyStatus;
  foundedDay: number;
  cash: number;
  tBillsInvested: number; // earns interestRate
  debtBalance: number; // corporate loan
  debtApr: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  marketingBudget: number;
  pricingTier: PricingTier;
  valuation: number;
  valuationHistory: number[];
  sharesTotal: number;
  playerShares: number;
  shareholders: ShareholderEntry[];
  pricePerShare: number;
  peRatio: number;
  productQuality: number; // 0..100
  securityLevel: number; // 0..100
  users: number;
  growthRate: number; // monthly %
  hype: number; // 0..100
  vision: StrategicVision;
  employees: Employee[];
  departmentHeads: Record<DepartmentRole, DepartmentHead>;
  features: ProductFeature[];
  activeFeatureId: string | null;
  exchangeFeeBps?: number;
  dailyVolume?: number;
  manufacturing?: ManufacturingOps;
  subsidiaries?: SubsidiaryHolding[];
  parentCompanyId?: string;
  acquiredBy?: string;
}

export interface VcOffer {
  id: string;
  companyId: string;
  firmName: string;
  roundName: string;
  amount: number;
  preMoneyValuation: number;
  equityPercent: number;
  boardSeat: boolean;
  investorQuality: number; // 1..100
  expiryDay: number;
}

export interface CryptoCoin {
  id: string;
  name: string;
  symbol: string;
  creatorCompanyId: string | null;
  isPlayerCreated: boolean;
  totalSupply: number;
  circulatingSupply: number;
  price: number;
  marketCap: number;
  hype: number; // 0..100
  utility: number; // 0..100
  stakingYieldApr: number; // %
  playerHoldings: number;
  priceHistory: number[];
}

export interface StockPosition {
  companyId: string;
  shares: number; // positive = long, negative = short
  avgEntryPrice: number;
}

export interface FundInvestment {
  companyId: string;
  companyName: string;
  sector: VentureSector;
  equityPercent: number;
  costBasis: number;
  investedDay: number;
}

export interface FundPublicHolding {
  companyId: string;
  ticker: string;
  shares: number;
  avgEntryPrice: number;
}

export interface PlayerFund {
  id: string;
  name: string;
  strategy: FundStrategy;
  sectorFocus: VentureSector | 'ALL';
  foundedDay: number;
  lpCapital: number;
  gpCommit: number;
  cashAvailable: number;
  tBillsAllocated: number;
  debtBorrowed: number;
  managementFeePct: number; // 1..3
  carryPct: number; // 10..30
  hurdleRatePct: number; // 5..12
  realizedProfits: number;
  distributedTotal: number;
  portfolio: FundInvestment[];
  publicHoldings: FundPublicHolding[];
}

export interface PersonalAssetCatalogItem {
  id: string;
  name: string;
  category: 'REAL_ESTATE' | 'VEHICLE' | 'COLLECTIBLE' | 'EXPERIENCE';
  price: number;
  monthlyUpkeep: number;
  appreciationRate: number;
  reputationBoost: number;
  stressRelief: number;
}

export interface DayJob {
  id: string;
  title: string;
  employer: string;
  monthlyPay: number;
  stressPerMonth: number;
  skillRequired: number;
}

export interface JobPosting {
  id: string;
  title: string;
  employer: string;
  monthlyPay: number;
  stressPerMonth: number;
  skillRequired: number;
  repRequired: number;
  isRemote: boolean;
}

export interface SideHustleGig {
  id: string;
  title: string;
  category: 'GIG' | 'FREELANCE' | 'CONSULTING';
  payoutCash: number;
  energyCost: number;
  stressGain: number;
  skillRequired: number;
  skillGain: number;
  repGain: number;
}

export interface PersonalLife {
  founderName: string;
  liquidCash: number;
  personalDebt: number;
  tBillsBalance: number;
  monthlySalaryDraw: number;
  lifestyleTier: LifestyleTier;
  stress: number; // 0..100
  energy: number; // 0..100
  reputation: number; // 0..100
  networkScore: number; // 0..100
  skillLevel: number; // 1..100
  currentJob: DayJob | null;
  jobApplicationsSent: number;
  jobRejections: number;
  lastJobFeedback: string | null;
  gigsCompleted: number;
  assetsOwned: string[];
  netWorthHistory: number[];
}

export type NewsCategory =
  | 'BREAKING'
  | 'ECONOMY'
  | 'MARKETS'
  | 'TECH'
  | 'INDUSTRIAL'
  | 'CRYPTO'
  | 'POLICY';

export interface NewsArticle {
  id: string;
  day: number;
  headline: string;
  summary: string;
  source: string;
  category: NewsCategory;
  affectedSector?: VentureSector | 'ALL';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  marketImpactPct?: number; // e.g. +4.5 or -6.0
}

export interface DecisionChoice {
  id: string;
  label: string;
  costCash: number;
  effectSummary: string;
  cashDelta: number;
  hypeDelta: number;
  qualityDelta: number;
  reputationDelta: number;
  growthDelta: number;
}

export interface PendingDecision {
  id: string;
  day: number;
  companyId: string | null;
  title: string;
  description: string;
  category: NewsCategory;
  choices: DecisionChoice[];
}

export interface WorldEvent {
  id: string;
  day: number;
  title: string;
  description: string;
  category: 'MACRO' | 'MARKET' | 'STARTUP' | 'CRYPTO' | 'PERSONAL';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface SimState {
  seed: number;
  origin: CareerOrigin;
  totalDays: number;
  year: number;
  month: number; // 1..12
  dayOfMonth: number; // 1..30
  macro: MacroEconomy;
  companies: Company[];
  activeCompanyId: string | null;
  vcOffers: VcOffer[];
  cryptoCoins: CryptoCoin[];
  stockPositions: StockPosition[];
  playerFunds: PlayerFund[];
  personal: PersonalLife;
  events: WorldEvent[];
  newsFeed: NewsArticle[];
  pendingDecisions: PendingDecision[];
  candidatePool: Employee[];
  jobMarket: JobPosting[];
  isGameOver: boolean;
  gameOverReason?: string;
}
