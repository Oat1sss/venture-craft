import { MacroRegime } from '../engine/types';

export function formatMoney(amount: number, compact = true): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (!compact) {
    return `${sign}$${Math.round(abs).toLocaleString('en-US')}`;
  }
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${Math.round(abs).toLocaleString('en-US')}`;
}

export function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

export function formatSimDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export const MACRO_META: Record<
  MacroRegime,
  { label: string; bg: string; text: string; shortNote: string }
> = {
  EXPANSION: {
    label: 'Expansion',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    shortNote: 'Steady credit & healthy multiples',
  },
  AI_MANIA: {
    label: 'AI Mania',
    bg: 'bg-violet-100',
    text: 'text-violet-900',
    shortNote: 'Surging tech multiples & VC appetite',
  },
  BOOM: {
    label: 'Liquidity Boom',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    shortNote: 'Low rates fueling rapid risk-on',
  },
  RATE_HIKE: {
    label: 'Rate Hike Cycle',
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    shortNote: 'Tighter funding; runway discipline wins',
  },
  RECESSION: {
    label: 'Recession',
    bg: 'bg-rose-100',
    text: 'text-rose-900',
    shortNote: 'Compressed valuations & slow demand',
  },
  CRYPTO_WINTER: {
    label: 'Crypto Winter',
    bg: 'bg-sky-100',
    text: 'text-sky-900',
    shortNote: 'Token liquidity squeeze & cautious LPs',
  },
};
