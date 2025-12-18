import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

export const expenseCategories = [
  { name: 'Alimentação', icon: '🍔', color: 'bg-orange-100 text-orange-700' },
  { name: 'Transporte', icon: '🚗', color: 'bg-blue-100 text-blue-700' },
  { name: 'Moradia', icon: '🏠', color: 'bg-purple-100 text-purple-700' },
  { name: 'Saúde', icon: '💊', color: 'bg-red-100 text-red-700' },
  { name: 'Lazer', icon: '🎮', color: 'bg-pink-100 text-pink-700' },
  { name: 'Educação', icon: '📚', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Compras', icon: '🛒', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Streaming', icon: '📺', color: 'bg-teal-100 text-teal-700' },
  { name: 'Internet', icon: '📶', color: 'bg-cyan-100 text-cyan-700' },
  { name: 'Celular', icon: '📱', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Assinaturas', icon: '💳', color: 'bg-violet-100 text-violet-700' },
  { name: 'Outros', icon: '📦', color: 'bg-gray-100 text-gray-700' },
];

export const incomeCategories = [
  { name: 'Salário', icon: '💰', color: 'bg-green-100 text-green-700' },
  { name: 'Freelance', icon: '💻', color: 'bg-blue-100 text-blue-700' },
  { name: 'Investimentos', icon: '📈', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Aluguel', icon: '🏢', color: 'bg-purple-100 text-purple-700' },
  { name: 'Outros', icon: '✨', color: 'bg-gray-100 text-gray-700' },
];
