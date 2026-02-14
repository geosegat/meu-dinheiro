import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispara evento customizado para notificar mudanças no localStorage
        window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key } }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}

export const expenseCategories = [
  { key: 'food', icon: '🍔', color: 'bg-orange-100 text-orange-700' },
  { key: 'transport', icon: '🚗', color: 'bg-blue-100 text-blue-700' },
  { key: 'housing', icon: '🏠', color: 'bg-purple-100 text-purple-700' },
  { key: 'health', icon: '💊', color: 'bg-red-100 text-red-700' },
  { key: 'leisure', icon: '🎮', color: 'bg-pink-100 text-pink-700' },
  { key: 'education', icon: '📚', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'shopping', icon: '🛒', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'streaming', icon: '📺', color: 'bg-teal-100 text-teal-700' },
  { key: 'internet', icon: '📶', color: 'bg-cyan-100 text-cyan-700' },
  { key: 'phone', icon: '📱', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'subscriptions', icon: '💳', color: 'bg-violet-100 text-violet-700' },
  { key: 'other', icon: '📦', color: 'bg-gray-100 text-gray-700' },
];

export const incomeCategories = [
  { key: 'salary', icon: '💰', color: 'bg-green-100 text-green-700' },
  { key: 'freelance', icon: '💻', color: 'bg-blue-100 text-blue-700' },
  { key: 'investments', icon: '📈', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'rent', icon: '🏢', color: 'bg-purple-100 text-purple-700' },
  { key: 'other', icon: '✨', color: 'bg-gray-100 text-gray-700' },
];

export const LEGACY_CATEGORY_MAP: Record<string, string> = {
  Alimentação: 'food',
  Transporte: 'transport',
  Moradia: 'housing',
  Saúde: 'health',
  Lazer: 'leisure',
  Educação: 'education',
  Compras: 'shopping',
  Streaming: 'streaming',
  Internet: 'internet',
  Celular: 'phone',
  Assinaturas: 'subscriptions',
  Outros: 'other',
  Salário: 'salary',
  Freelance: 'freelance',
  Investimentos: 'investments',
  Aluguel: 'rent',
};
