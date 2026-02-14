'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

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

  const syncNow = useCallback(async () => {
    // Só sincroniza se estiver autenticado
    if (!session?.user?.email) {
      return;
    }

    try {
      setIsSyncing(true);
      setError(null);

      // Coleta todos os dados do localStorage
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Erro ao sincronizar dados');
      }

      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Erro na sincronização:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSyncing(false);
    }
  }, [session]);

  useEffect(() => {
    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      // Cancela timer anterior se existir
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Cria novo timer com debounce de 2 segundos
      debounceTimerRef.current = setTimeout(() => {
        syncNow();
      }, 2000);
    };

    window.addEventListener('localStorageChange', handleStorageChange);

    return () => {
      window.removeEventListener('localStorageChange', handleStorageChange);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [syncNow]);

  return {
    isSyncing,
    lastSyncTime,
    syncNow,
    error,
  };
}
