export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_CONFIG: Record<Currency, { symbol: string; code: string }> = {
  BRL: { symbol: 'R$', code: 'BRL' },
  USD: { symbol: '$', code: 'USD' },
  EUR: { symbol: '€', code: 'EUR' },
  GBP: { symbol: '£', code: 'GBP' },
};

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=BRL&symbols=USD,EUR,GBP';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface ExchangeRateCache {
  rates: Record<string, number>;
  date: string;
  fetchedAt: number;
}

export async function fetchExchangeRates(): Promise<ExchangeRateCache> {
  const response = await fetch(FRANKFURTER_URL);
  if (!response.ok) throw new Error(`Exchange rate API error: ${response.status}`);
  const data = await response.json();
  return {
    rates: { BRL: 1, ...data.rates },
    date: data.date,
    fetchedAt: Date.now(),
  };
}

export function isCacheValid(cache: ExchangeRateCache | null): boolean {
  if (!cache) return false;
  return Date.now() - cache.fetchedAt < CACHE_TTL_MS;
}

export function convertAmount(
  amountBRL: number,
  targetCurrency: Currency,
  rates: Record<string, number> | null
): number {
  if (targetCurrency === 'BRL' || !rates) return amountBRL;
  const rate = rates[targetCurrency];
  if (!rate) return amountBRL;
  return amountBRL * rate;
}
