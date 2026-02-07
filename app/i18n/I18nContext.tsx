'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useLocalStorage, LEGACY_CATEGORY_MAP } from '../components/hooks/useLocalStorage';
import { getTranslation, Locale, defaultLocale } from './index';
import {
  Currency,
  CURRENCY_CONFIG,
  ExchangeRateCache,
  fetchExchangeRates,
  isCacheValid,
  convertAmount,
} from './currency';
import { Transaction } from '@/types/finance';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amountInBRL: number) => string;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  exchangeRates: ExchangeRateCache | null;
  ratesLoading: boolean;
  ratesError: string | null;
  refreshRates: () => Promise<void>;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useLocalStorage<Locale>('app_locale', defaultLocale);
  const [currency, setCurrency] = useLocalStorage<Currency>('app_currency', 'BRL');
  const [cachedRates, setCachedRates] = useLocalStorage<ExchangeRateCache | null>(
    'exchange_rates',
    null
  );
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  // Avoid hydration mismatch: use defaults until client mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const activeLocale = mounted ? locale : defaultLocale;
  const activeCurrency = mounted ? currency : 'BRL' as Currency;

  const loadRates = useCallback(async () => {
    setRatesLoading(true);
    setRatesError(null);
    try {
      const rates = await fetchExchangeRates();
      setCachedRates(rates);
    } catch {
      setRatesError('Failed to load exchange rates');
    } finally {
      setRatesLoading(false);
    }
  }, [setCachedRates]);

  useEffect(() => {
    if (!isCacheValid(cachedRates)) {
      loadRates();
    }
    // Migrate legacy category names to keys
    if (typeof window !== 'undefined' && !window.localStorage.getItem('migration_v1_complete')) {
      try {
        const raw = window.localStorage.getItem('finance_transactions');
        if (raw) {
          const txs: Transaction[] = JSON.parse(raw);
          let changed = false;
          const migrated = txs.map((tx) => {
            const newKey = LEGACY_CATEGORY_MAP[tx.category];
            if (newKey) {
              changed = true;
              return { ...tx, category: newKey };
            }
            return tx;
          });
          if (changed) {
            window.localStorage.setItem('finance_transactions', JSON.stringify(migrated));
          }
        }
        window.localStorage.setItem('migration_v1_complete', 'true');
      } catch {
        // ignore migration errors
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.lang = activeLocale;
  }, [activeLocale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslation(activeLocale, key, params);
    },
    [activeLocale]
  );

  const formatCurrency = useCallback(
    (amountInBRL: number) => {
      const converted = convertAmount(amountInBRL, activeCurrency, cachedRates?.rates ?? null);
      const config = CURRENCY_CONFIG[activeCurrency];
      return `${config.symbol} ${converted.toLocaleString(activeLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [activeCurrency, cachedRates, activeLocale]
  );

  const formatDate = useCallback(
    (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString(activeLocale);
    },
    [activeLocale]
  );

  const formatTime = useCallback(
    (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleTimeString(activeLocale, { hour: '2-digit', minute: '2-digit' });
    },
    [activeLocale]
  );

  return (
    <I18nContext.Provider
      value={{
        locale: activeLocale,
        setLocale,
        t,
        currency: activeCurrency,
        setCurrency,
        formatCurrency,
        formatDate,
        formatTime,
        exchangeRates: cachedRates,
        ratesLoading,
        ratesError,
        refreshRates: loadRates,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}
