import test from 'node:test';
import assert from 'node:assert/strict';
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
  computeFounderNetWorth,
  computeJobAcceptanceOdds,
  createInitialState,
  doSideHustleGig,
  drawFounderSecondary,
  foundInvestmentFund,
  foundNewStartup,
  fundActivistAction,
  fundAllocateTBills,
  fundBuyPublicStock,
  fundDistributeProfits,
  fundInvestInCompany,
  fundRaiseLpCapital,
  fundToggleLeverage,
  fundUpdateTerms,
  hireDepartmentHead,
  hireEmployee,
  issuePressRelease,
  launchMicroOnlineStore,
  mintCryptoCoin,
  repayCompanyLoan,
  repayPersonalDebt,
  setCompanyVision,
  setFactoryUtilization,
  signSupplyContract,
  takeCompanyLoan,
  takeCompanyPublic,
  tradeCrypto,
  tradeStock,
  upskillStudy,
} from './simulation';

test('initializes all three career origins cleanly with deterministic net worth', () => {
  const tech = createInitialState({ origin: 'TECH_FOUNDER', startupName: 'BytePulse' });
  assert.equal(tech.companies.filter((c) => c.isPlayerOwned).length, 1);
  assert.ok(computeFounderNetWorth(tech) > 500_000);
  assert.ok(tech.newsFeed.length >= 2);

  const crypto = createInitialState({ origin: 'CRYPTO_ARCHITECT', startupName: 'NovaDEX' });
  assert.equal(crypto.companies[0].sector, 'CRYPTO_EXCHANGE');
  assert.ok(crypto.cryptoCoins.some((c) => c.isPlayerCreated));

  const vc = createInitialState({ origin: 'VC_FINANCIER' });
  assert.equal(vc.playerFunds.length, 1);
  assert.equal(vc.playerFunds[0].cashAvailable, 10_000_000);
});

test('realistic economy prevents runaway quadrillions even over 12 simulated years', () => {
  let state = createInitialState({ origin: 'TECH_FOUNDER', startupName: 'ScaleCorp' });
  const coId = state.activeCompanyId!;
  state = {
    ...state,
    companies: state.companies.map((c) => (c.id === coId ? { ...c, cash: 5_000_000 } : c)),
  };
  state = hireDepartmentHead(state, coId, 'CTO');
  state = hireDepartmentHead(state, coId, 'CMO');
  state = setCompanyVision(state, coId, 'HYPERGROWTH');

  // Simulate 12 years (12 x 365 days)
  for (let y = 0; y < 12; y++) {
    state = advanceTime(state, 365);
  }

  const nw = computeFounderNetWorth(state);
  const maxVal = Math.max(...state.companies.map((c) => c.valuation));
  assert.ok(maxVal <= 650_000_000_000, `Max company valuation (${maxVal}) must stay within realistic mega-cap bounds`);
  assert.ok(nw < 1_000_000_000_000, `Founder net worth (${nw}) must never reach quadrillions/trillions runaway`);
  assert.ok(state.newsFeed.length > 5, 'Monthly world news should populate over time');
});

test('manufacturing business lines, utilization, contracts, loans, and T-bills work', () => {
  let state = createInitialState({ origin: 'TECH_FOUNDER', startupName: 'ForgeWorks', sector: 'MANUFACTURING' });
  const coId = state.activeCompanyId!;
  const beforeLines = state.companies[0].manufacturing!.factoryLines;

  state = addManufacturingLine(state, coId);
  state = setFactoryUtilization(state, coId, 95);
  state = signSupplyContract(state, coId);

  const co = state.companies.find((c) => c.id === coId)!;
  assert.equal(co.manufacturing!.factoryLines, beforeLines + 1);
  assert.equal(co.manufacturing!.utilizationPct, 95);
  assert.equal(co.manufacturing!.activeContracts, 2);

  state = takeCompanyLoan(state, coId, 100_000);
  assert.equal(state.companies.find((c) => c.id === coId)!.debtBalance, 100_000);
  state = repayCompanyLoan(state, coId, 40_000);
  assert.equal(state.companies.find((c) => c.id === coId)!.debtBalance, 60_000);
  state = allocateCompanyTBills(state, coId, 50_000);
  assert.equal(state.companies.find((c) => c.id === coId)!.tBillsInvested, 50_000);
});

test('holding company can acquire NPC companies as dividend-paying subsidiaries', () => {
  let state = createInitialState({ origin: 'VC_FINANCIER' });
  state = {
    ...state,
    personal: { ...state.personal, liquidCash: 25_000_000 },
  };
  state = foundNewStartup(state, 'Apex Holdings', 'HOLDING_CO', 15_000_000);
  const holdCoId = state.activeCompanyId!;
  const targetNpc = state.companies.find((c) => !c.isPlayerOwned && c.stage === 'SEED' && c.status === 'ACTIVE')!;

  state = acquireCompanyIntoParent(state, holdCoId, targetNpc.id);
  const holdCo = state.companies.find((c) => c.id === holdCoId)!;
  assert.equal(holdCo.subsidiaries!.length, 1);
  assert.equal(state.companies.find((c) => c.id === targetNpc.id)!.status, 'ACQUIRED');
});

test('deep VC fund controls: LP raise, leverage, terms, T-bills, public stocks, activist action, distribution', () => {
  let state = createInitialState({ origin: 'VC_FINANCIER' });
  const fundId = state.playerFunds[0].id;

  state = fundRaiseLpCapital(state, fundId, 2_000_000);
  assert.equal(state.playerFunds[0].lpCapital, 10_500_000);

  state = fundToggleLeverage(state, fundId, 1_000_000);
  assert.equal(state.playerFunds[0].debtBorrowed, 1_000_000);

  state = fundUpdateTerms(state, fundId, { carryPct: 25, sectorFocus: 'MANUFACTURING' });
  assert.equal(state.playerFunds[0].carryPct, 25);
  assert.equal(state.playerFunds[0].sectorFocus, 'MANUFACTURING');

  state = fundAllocateTBills(state, fundId, 1_000_000);
  assert.equal(state.playerFunds[0].tBillsAllocated, 1_000_000);

  const pub = state.companies.find((c) => c.isPublic && c.status === 'ACTIVE')!;
  state = fundBuyPublicStock(state, fundId, pub.id, 500_000);
  assert.equal(state.playerFunds[0].publicHoldings.length, 1);

  const target = state.companies.find((c) => !c.isPlayerOwned && !c.isPublic && c.status === 'ACTIVE')!;
  state = fundInvestInCompany(state, fundId, target.id, 1_500_000);
  state = fundActivistAction(state, fundId, 0, 'CUT_BURN');

  const cashBeforeDist = state.personal.liquidCash;
  state = fundDistributeProfits(state, fundId, 500_000);
  assert.ok(state.personal.liquidCash > cashBeforeDist);
});

test('press release, personal T-bills, VC offer, crypto, stock, and IPO all work', () => {
  let state = createInitialState({ origin: 'TECH_FOUNDER' });
  const coId = state.activeCompanyId!;
  const offer = state.vcOffers[0];
  state = acceptVcOffer(state, offer.id);
  assert.ok(state.companies.find((c) => c.id === coId)!.playerShares < state.companies.find((c) => c.id === coId)!.sharesTotal);

  state = issuePressRelease(state, coId, 'GROWTH');
  assert.ok(state.newsFeed[0].headline.includes('VeloStack'));

  state = allocatePersonalTBills(state, 10_000);
  assert.equal(state.personal.tBillsBalance, 10_000);

  const cand = state.candidatePool[0];
  state = hireEmployee(state, coId, cand.id);
  assert.ok(state.companies.find((c) => c.id === coId)!.employees.some((e) => e.id === cand.id));

  state = mintCryptoCoin(state, 'PixelCoin', 'PXLC', 10_000_000, 20_000, 10);
  const pxlc = state.cryptoCoins.find((c) => c.symbol === 'PXLC')!;
  state = tradeCrypto(state, pxlc.id, 5_000, 'BUY');

  const pub = state.companies.find((c) => c.isPublic && c.status === 'ACTIVE')!;
  state = tradeStock(state, pub.id, 25);
  assert.equal(state.stockPositions[0].shares, 25);

  state = {
    ...state,
    companies: state.companies.map((c) => (c.id === coId ? { ...c, valuation: 25_000_000 } : c)),
  };
  state = takeCompanyPublic(state, coId);
  state = drawFounderSecondary(state, coId, 10);
  state = buyPersonalAsset(state, 'asset_watch');
  assert.ok(state.personal.assetsOwned.includes('asset_watch'));
});

test('everyday worker and broke unemployed origins, job rejections, freelance gigs, and $450 online store work', () => {
  let worker = createInitialState({ origin: 'EVERYDAY_WORKER', founderName: 'Sam Rivera' });
  assert.equal(worker.activeCompanyId, null);
  assert.ok(worker.personal.currentJob !== null);
  assert.equal(worker.personal.liquidCash, 2_200);

  // Advance 1 month: paycheck arrives net of tax minus shared room rent
  worker = advanceTime(worker, 31);
  assert.ok(worker.personal.liquidCash > 3_500);

  // Bootstrap solo dropship online store for $450 and ensure it survives 60 days cleanly
  worker = launchMicroOnlineStore(worker, 'CozyPixel Shop', 'DROPSHIP');
  assert.ok(worker.activeCompanyId !== null);
  worker = advanceTime(worker, 60);
  const store = worker.companies.find((c) => c.id === worker.activeCompanyId)!;
  assert.equal(store.status, 'ACTIVE');

  // Broke & unemployed starts poor with debt and tough job odds
  let broke = createInitialState({ origin: 'BROKE_UNEMPLOYED', founderName: 'Chris Vance' });
  assert.equal(broke.personal.liquidCash, 180);
  assert.equal(broke.personal.personalDebt, 4_200);
  assert.equal(broke.personal.currentJob, null);

  const hardJob = broke.jobMarket[broke.jobMarket.length - 1];
  const lowOdds = computeJobAcceptanceOdds(broke.personal, hardJob, broke.macro);
  assert.ok(lowOdds <= 0.15, `High-skill job odds for broke player should be very low (${lowOdds})`);

  // Applying to a director role while broke & unskilled should fail & log rejection
  broke = applyForDayJob(broke, hardJob.id);
  assert.equal(broke.personal.currentJob, null);
  assert.equal(broke.personal.jobRejections, 1);

  // Grind odd gigs + study free at library + borrow/repay debt
  broke = doSideHustleGig(broke, 'gig_odd_labor');
  assert.equal(broke.personal.liquidCash, 214);
  broke = upskillStudy(broke, 'FREE_LIBRARY');
  assert.equal(broke.personal.skillLevel, 13);

  broke = borrowPersonalLoan(broke, 500);
  assert.equal(broke.personal.personalDebt, 4_700);
  broke = repayPersonalDebt(broke, 300);
  assert.equal(broke.personal.personalDebt, 4_400);
});
