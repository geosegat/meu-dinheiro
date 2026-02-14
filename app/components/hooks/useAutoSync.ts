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
}

interface UseAutoSyncReturn {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncNow: () => Promise<void>;
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

  const lastLocalChange = useRef<number>(0);

  const syncNow = useCallback(async () => {
    if (!session?.user?.email || isSyncingRef.current) return;

    try {
      isSyncingRef.current = true;
      setIsSyncing(true);
      setError(null);

      // 1. Primeiro puxa da nuvem para ver se tem dados mais novos
      const getResponse = await fetch('/api/sync');
      if (getResponse.ok) {
        const { data: cloudData, lastSync } = await getResponse.json();

        if (cloudData && lastSync) {
          const localTransactions = localStorage.getItem('finance_transactions') || '[]';
          const localInvestments = localStorage.getItem('finance_investments') || '[]';
          const cloudTransactions = JSON.stringify(cloudData.transactions || []);
          const cloudInvestments = JSON.stringify(cloudData.investments || []);

          const cloudIsNewer = lastKnownCloudSync.current !== lastSync;
          const localIsDifferent =
            localTransactions !== cloudTransactions || localInvestments !== cloudInvestments;

          if (cloudIsNewer && localIsDifferent && lastLocalChange.current === 0) {
            // Nuvem tem dados diferentes e não houve mudança local recente -> puxar
            applyCloudData(cloudData);
            lastKnownCloudSync.current = lastSync;
            setLastSyncTime(new Date());
            window.dispatchEvent(
              new CustomEvent('localStorageChange', { detail: { key: 'poll_update' } })
            );
            return;
          }
        }
      }

      // 2. Upload dos dados locais (houve mudança local ou nuvem está desatualizada)
      const data = {
        transactions: JSON.parse(localStorage.getItem('finance_transactions') || '[]'),
        investments: JSON.parse(localStorage.getItem('finance_investments') || '[]'),
        dashboard_cards: JSON.parse(localStorage.getItem('dashboard_cards') || '[]'),
        locale: localStorage.getItem('app_locale') || 'pt-BR',
        currency: localStorage.getItem('app_currency') || 'BRL',
        exchange_rates: JSON.parse(localStorage.getItem('exchange_rates') || '{}'),
      };

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) throw new Error('Erro ao sincronizar dados');

      const result = await response.json();
      if (result.lastSync) {
        lastKnownCloudSync.current = result.lastSync;
      }
      lastLocalChange.current = 0;
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Erro na sincronização:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [session]);

  // Listener para mudanças locais -> upload com debounce de 2s
  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // Ignora eventos do próprio polling para não criar loop
      if (detail?.key === 'poll_update') return;

      // Marca que houve mudança local
      lastLocalChange.current = Date.now();

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => syncNow(), 2000);
    };

    window.addEventListener('localStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [syncNow]);

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

        // Se o timestamp da nuvem é mais novo que o que conhecemos, aplicar
        if (lastKnownCloudSync.current && lastSync === lastKnownCloudSync.current) {
          return; // Nada mudou
        }

        // Checa se os dados são realmente diferentes
        const localTransactions = localStorage.getItem('finance_transactions') || '[]';
        const localInvestments = localStorage.getItem('finance_investments') || '[]';
        const cloudTransactions = JSON.stringify(data.transactions || []);
        const cloudInvestments = JSON.stringify(data.investments || []);

        if (localTransactions !== cloudTransactions || localInvestments !== cloudInvestments) {
          applyCloudData(data);
          lastKnownCloudSync.current = lastSync;
          setLastSyncTime(new Date());
          // Dispara evento para que componentes React re-leiam do localStorage
          window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key: 'poll_update' } }));
        } else {
          lastKnownCloudSync.current = lastSync;
        }
      } catch {
        // Silencioso - polling não deve mostrar erro
      }
    };

    const interval = setInterval(pollForUpdates, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [session]);

  return { isSyncing, lastSyncTime, syncNow, error };
}
