'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

const POLL_INTERVAL = 10000; // 10 segundos

function applyCloudData(data: Record<string, unknown>) {
  if (data.transactions)
    localStorage.setItem('finance_transactions', JSON.stringify(data.transactions));
  if (data.investments)
    localStorage.setItem('finance_investments', JSON.stringify(data.investments));
  if (data.dashboard_cards)
    localStorage.setItem('dashboard_cards', JSON.stringify(data.dashboard_cards));
  if (data.locale) localStorage.setItem('app_locale', data.locale as string);
  if (data.currency) localStorage.setItem('app_currency', data.currency as string);
  if (data.exchange_rates)
    localStorage.setItem('exchange_rates', JSON.stringify(data.exchange_rates));
  if (data.custom_expense_categories)
    localStorage.setItem(
      'custom_expense_categories',
      JSON.stringify(data.custom_expense_categories)
    );
  if (data.custom_income_categories)
    localStorage.setItem('custom_income_categories', JSON.stringify(data.custom_income_categories));
  if (data.category_translations)
    localStorage.setItem('category_translations', JSON.stringify(data.category_translations));
  if (data.hidden_expense_categories)
    localStorage.setItem(
      'hidden_expense_categories',
      JSON.stringify(data.hidden_expense_categories)
    );
  if (data.hidden_income_categories)
    localStorage.setItem('hidden_income_categories', JSON.stringify(data.hidden_income_categories));
}

function getLocalData() {
  return {
    transactions: JSON.parse(localStorage.getItem('finance_transactions') || '[]'),
    investments: JSON.parse(localStorage.getItem('finance_investments') || '[]'),
    dashboard_cards: JSON.parse(localStorage.getItem('dashboard_cards') || '[]'),
    locale: localStorage.getItem('app_locale') || 'pt-BR',
    currency: localStorage.getItem('app_currency') || 'BRL',
    exchange_rates: JSON.parse(localStorage.getItem('exchange_rates') || '{}'),
    custom_expense_categories: JSON.parse(
      localStorage.getItem('custom_expense_categories') || '[]'
    ),
    custom_income_categories: JSON.parse(localStorage.getItem('custom_income_categories') || '[]'),
    category_translations: JSON.parse(localStorage.getItem('category_translations') || '{}'),
    hidden_expense_categories: JSON.parse(
      localStorage.getItem('hidden_expense_categories') || '[]'
    ),
    hidden_income_categories: JSON.parse(localStorage.getItem('hidden_income_categories') || '[]'),
  };
}

interface UseAutoSyncReturn {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  upload: () => Promise<void>;
  download: () => Promise<void>;
  error: string | null;
}

export function useAutoSync(): UseAutoSyncReturn {
  const { data: session } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastKnownCloudSync = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  // Envia dados locais para a nuvem
  const upload = useCallback(async () => {
    if (!session?.user?.email || isSyncingRef.current) return;

    try {
      isSyncingRef.current = true;
      setIsSyncing(true);
      setError(null);

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: getLocalData() }),
      });

      if (!response.ok) throw new Error('Erro ao enviar dados');

      const result = await response.json();
      if (result.lastSync) lastKnownCloudSync.current = result.lastSync;
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Erro no upload:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [session]);

  // Puxa dados da nuvem e aplica localmente
  const download = useCallback(async () => {
    if (!session?.user?.email || isSyncingRef.current) return;

    try {
      isSyncingRef.current = true;
      setIsSyncing(true);
      setError(null);

      const response = await fetch('/api/sync');
      if (!response.ok) throw new Error('Erro ao baixar dados');

      const { data, lastSync } = await response.json();

      if (data) {
        applyCloudData(data);
        if (lastSync) lastKnownCloudSync.current = lastSync;
        setLastSyncTime(new Date());
        window.dispatchEvent(
          new CustomEvent('localStorageChange', { detail: { key: 'poll_update' } })
        );
      }
    } catch (err) {
      console.error('Erro no download:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [session]);

  // Auto-upload quando localStorage muda (debounce 2s)
  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.key === 'poll_update') return;

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => upload(), 2000);
    };

    window.addEventListener('localStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [upload]);

  // Polling: a cada 10s checa se a nuvem tem dados mais novos
  useEffect(() => {
    if (!session?.user?.email) return;

    const pollForUpdates = async () => {
      if (isSyncingRef.current) return;

      try {
        const response = await fetch('/api/sync');
        if (!response.ok) return;

        const { data, lastSync } = await response.json();
        if (!lastSync || !data) return;

        if (lastKnownCloudSync.current && lastSync === lastKnownCloudSync.current) return;

        const localTransactions = localStorage.getItem('finance_transactions') || '[]';
        const localInvestments = localStorage.getItem('finance_investments') || '[]';
        const cloudTransactions = JSON.stringify(data.transactions || []);
        const cloudInvestments = JSON.stringify(data.investments || []);

        if (localTransactions !== cloudTransactions || localInvestments !== cloudInvestments) {
          applyCloudData(data);
          lastKnownCloudSync.current = lastSync;
          setLastSyncTime(new Date());
          window.dispatchEvent(
            new CustomEvent('localStorageChange', { detail: { key: 'poll_update' } })
          );
        } else {
          lastKnownCloudSync.current = lastSync;
        }
      } catch {
        // Silencioso
      }
    };

    const interval = setInterval(pollForUpdates, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [session]);

  return { isSyncing, lastSyncTime, upload, download, error };
}
