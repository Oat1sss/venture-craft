import React, { useState } from 'react';
import { SimState } from '../../engine/types';
import { SECTOR_LABELS } from '../../engine/names';
import { formatMoney, formatPrice } from '../../utils/format';
import { PixelSparkline } from '../PixelCharts';

interface MarketsCryptoViewProps {
  state: SimState;
  onTradeStock: (companyId: string, sharesDelta: number) => void;
  onMintCoin: (
    name: string,
    symbol: string,
    totalSupply: number,
    initialLiquidityUsd: number,
    stakingYieldApr: number
  ) => void;
  onTradeCrypto: (coinId: string, usdAmount: number, side: 'BUY' | 'SELL') => void;
}

export const MarketsCryptoView: React.FC<MarketsCryptoViewProps> = ({
  state,
  onTradeStock,
  onMintCoin,
  onTradeCrypto,
}) => {
  const [subTab, setSubTab] = useState<'STOCKS' | 'CRYPTO'>('STOCKS');
  const [coinName, setCoinName] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('');
  const [coinSupply, setCoinSupply] = useState(100_000_000);
  const [coinLiquidity, setCoinLiquidity] = useState(25_000);
  const [coinYield, setCoinYield] = useState(8);
  const [cryptoOrderUsd, setCryptoOrderUsd] = useState(5000);

  const publicStocks = state.companies.filter((c) => c.isPublic && c.status === 'ACTIVE');

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || !coinSymbol.trim() || state.personal.liquidCash < coinLiquidity) return;
    onMintCoin(coinName, coinSymbol, coinSupply, coinLiquidity, coinYield);
    setCoinName('');
    setCoinSymbol('');
  };

  return (
    <div className="space-y-5">
      {/* Sub-tab Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('STOCKS')}
            className={`pixel-btn px-4 py-2 font-pixel text-xs cursor-pointer ${
              subTab === 'STOCKS' ? 'bg-[#2563EB] text-white' : 'bg-[#FFFDF7] text-[#1B1929]'
            }`}
          >
            Public Stock Exchange ({publicStocks.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('CRYPTO')}
            className={`pixel-btn px-4 py-2 font-pixel text-xs cursor-pointer ${
              subTab === 'CRYPTO' ? 'bg-[#F59E0B] text-[#1B1929]' : 'bg-[#FFFDF7] text-[#1B1929]'
            }`}
          >
            Crypto Forge + Markets ({state.cryptoCoins.length})
          </button>
        </div>

        <div className="text-xs font-mono-num text-[#3B3459]">
          Market Sentiment: <span className="font-bold">{state.macro.marketSentiment.toFixed(2)}x</span> · Crypto Sentiment:{' '}
          <span className="font-bold">{state.macro.cryptoSentiment.toFixed(2)}x</span>
        </div>
      </div>

      {subTab === 'STOCKS' ? (
        <section className="pixel-box p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-sm text-[#1B1929]">PIXEL GLOBAL STOCK EXCHANGE</h2>
            <span className="text-xs text-[#5B5670]">Go Long or Short with Margin</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#1B1929] text-[#5B5670]">
                  <th className="py-2 pr-3">Ticker / Company</th>
                  <th className="py-2 px-2">Sector</th>
                  <th className="py-2 px-2 text-right">Price</th>
                  <th className="py-2 px-2 text-right">Market Cap</th>
                  <th className="py-2 px-2 text-right">P/E</th>
                  <th className="py-2 px-2 text-right">Your Position</th>
                  <th className="py-2 pl-3 text-right">Order Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B1929]/15">
                {publicStocks.map((co) => {
                  const pos = state.stockPositions.find((p) => p.companyId === co.id);
                  const shares = pos?.shares ?? 0;
                  const pnl = pos
                    ? shares > 0
                      ? (co.pricePerShare - pos.avgEntryPrice) * shares
                      : (pos.avgEntryPrice - co.pricePerShare) * Math.abs(shares)
                    : 0;

                  return (
                    <tr key={co.id} className="hover:bg-[#F6F1E4]">
                      <td className="py-2.5 pr-3">
                        <div className="font-pixel text-xs text-[#1B1929]">
                          {co.ticker} {co.isPlayerOwned && <span className="text-[#2563EB]">(Yours)</span>}
                        </div>
                        <div className="text-[11px] text-[#5B5670]">{co.name}</div>
                      </td>
                      <td className="py-2.5 px-2 text-[#3B3459]">{SECTOR_LABELS[co.sector]}</td>
                      <td className="py-2.5 px-2 text-right font-mono-num font-bold">
                        ${co.pricePerShare.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-num">
                        {formatMoney(co.valuation)}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-num">
                        {co.peRatio > 0 ? `${co.peRatio}x` : 'N/A'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono-num">
                        {shares !== 0 ? (
                          <div>
                            <span className="font-bold">
                              {shares > 0 ? `${shares} Long` : `${Math.abs(shares)} Short`}
                            </span>
                            <div className={`text-[11px] ${pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {pnl >= 0 ? '+' : ''}{formatMoney(pnl)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#5B5670]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            disabled={state.personal.liquidCash < co.pricePerShare * 100}
                            onClick={() => onTradeStock(co.id, 100)}
                            className="px-2 py-1 bg-[#10B981] text-[#1B1929] font-mono-num font-bold border border-[#1B1929] cursor-pointer disabled:opacity-40"
                          >
                            +100
                          </button>
                          <button
                            type="button"
                            disabled={state.personal.liquidCash < co.pricePerShare * 10}
                            onClick={() => onTradeStock(co.id, 10)}
                            className="px-2 py-1 bg-emerald-200 text-[#1B1929] font-mono-num font-bold border border-[#1B1929] cursor-pointer disabled:opacity-40"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => onTradeStock(co.id, -10)}
                            className="px-2 py-1 bg-rose-200 text-[#1B1929] font-mono-num font-bold border border-[#1B1929] cursor-pointer"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => onTradeStock(co.id, -100)}
                            className="px-2 py-1 bg-[#E11D48] text-white font-mono-num font-bold border border-[#1B1929] cursor-pointer"
                          >
                            -100
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* Mint Your Own Crypto Coin */}
          <section className="xl:col-span-4 pixel-box p-4 space-y-3">
            <h2 className="font-pixel text-sm text-[#1B1929]">MINT CUSTOM CRYPTO COIN</h2>
            <p className="text-xs text-[#5B5670]">
              Design tokenomics, seed an initial liquidity pool, and receive 35% of circulating genesis supply.
            </p>
            <form onSubmit={handleMint} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="coin-name" className="block text-xs font-semibold text-[#3B3459] mb-1">
                    Token Name
                  </label>
                  <input
                    id="coin-name"
                    type="text"
                    placeholder="PixelChain"
                    value={coinName}
                    onChange={(e) => setCoinName(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#F6F1E4] border-2 border-[#1B1929]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="coin-sym" className="block text-xs font-semibold text-[#3B3459] mb-1">
                    Symbol
                  </label>
                  <input
                    id="coin-sym"
                    type="text"
                    placeholder="PXLC"
                    maxLength={6}
                    value={coinSymbol}
                    onChange={(e) => setCoinSymbol(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-2 text-xs font-mono-num uppercase bg-[#F6F1E4] border-2 border-[#1B1929]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="coin-supply" className="block text-xs font-semibold text-[#3B3459] mb-1">
                    Max Supply
                  </label>
                  <input
                    id="coin-supply"
                    type="number"
                    min={1000000}
                    step={1000000}
                    value={coinSupply}
                    onChange={(e) => setCoinSupply(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs font-mono-num bg-[#F6F1E4] border-2 border-[#1B1929]"
                  />
                </div>
                <div>
                  <label htmlFor="coin-liq" className="block text-xs font-semibold text-[#3B3459] mb-1">
                    Liquidity Pool ($)
                  </label>
                  <input
                    id="coin-liq"
                    type="number"
                    min={10000}
                    step={5000}
                    value={coinLiquidity}
                    onChange={(e) => setCoinLiquidity(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs font-mono-num bg-[#F6F1E4] border-2 border-[#1B1929]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="coin-yield" className="block text-xs font-semibold text-[#3B3459] mb-1">
                  Staking Yield APR: {coinYield}%
                </label>
                <input
                  id="coin-yield"
                  type="range"
                  min={0}
                  max={25}
                  value={coinYield}
                  onChange={(e) => setCoinYield(Number(e.target.value))}
                  className="w-full accent-[#F59E0B]"
                />
              </div>

              <button
                type="submit"
                disabled={!coinName.trim() || !coinSymbol.trim() || state.personal.liquidCash < coinLiquidity}
                className="pixel-btn w-full py-2.5 bg-[#F59E0B] text-[#1B1929] font-pixel text-xs cursor-pointer"
              >
                Launch Token ({formatMoney(coinLiquidity)})
              </button>
            </form>
          </section>

          {/* Live Crypto Spot Markets */}
          <section className="xl:col-span-8 pixel-box p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-pixel text-sm text-[#1B1929]">CRYPTOCURRENCY MARKETS</h2>
              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="crypto-order-usd" className="text-[#5B5670]">Order Ticket:</label>
                <select
                  id="crypto-order-usd"
                  value={cryptoOrderUsd}
                  onChange={(e) => setCryptoOrderUsd(Number(e.target.value))}
                  className="px-2 py-1 bg-[#F6F1E4] border border-[#1B1929] font-mono-num font-bold"
                >
                  <option value={1000}>$1,000</option>
                  <option value={5000}>$5,000</option>
                  <option value={25000}>$25,000</option>
                  <option value={100000}>$100,000</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              {state.cryptoCoins.map((coin) => {
                const holdingVal = coin.playerHoldings * coin.price;
                return (
                  <div
                    key={coin.id}
                    className={`p-3 border-2 border-[#1B1929] flex flex-wrap items-center justify-between gap-3 ${
                      coin.isPlayerCreated ? 'bg-amber-50' : 'bg-[#F6F1E4]'
                    }`}
                  >
                    <div className="min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-[#1B1929]">${coin.symbol}</span>
                        <span className="text-xs text-[#5B5670]">{coin.name}</span>
                        {coin.isPlayerCreated && (
                          <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-[#F59E0B] border border-[#1B1929]">
                            YOUR COIN
                          </span>
                        )}
                      </div>
                      <div className="font-mono-num text-xs text-[#3B3459] mt-1">
                        MCap {formatMoney(coin.marketCap)} · Hype {coin.hype}/100 · APR {coin.stakingYieldApr}%
                      </div>
                    </div>

                    <PixelSparkline values={coin.priceHistory} color="auto" width={110} height={36} />

                    <div className="text-right font-mono-num">
                      <div className="text-sm font-bold text-[#1B1929]">{formatPrice(coin.price)}</div>
                      <div className="text-[11px] text-[#5B5670]">
                        Held: {formatMoney(holdingVal)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={state.personal.liquidCash < cryptoOrderUsd * 1.003}
                        onClick={() => onTradeCrypto(coin.id, cryptoOrderUsd, 'BUY')}
                        className="pixel-btn px-3 py-1.5 bg-[#10B981] text-[#1B1929] font-pixel text-[11px] cursor-pointer"
                      >
                        Buy
                      </button>
                      <button
                        type="button"
                        disabled={holdingVal <= 1}
                        onClick={() => onTradeCrypto(coin.id, cryptoOrderUsd, 'SELL')}
                        className="pixel-btn px-3 py-1.5 bg-[#E11D48] text-white font-pixel text-[11px] cursor-pointer"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
