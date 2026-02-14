import { useMemo } from 'react';
import { useLocalStorage, expenseCategories, incomeCategories } from './useLocalStorage';
import { useTranslation } from '@/app/i18n/useTranslation';

interface CategoryTemplate {
  key: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

/**
 * Hook that returns all available categories (default + custom, minus hidden)
 * and utility functions to resolve category key -> name/icon/color.
 */
export function useCategories(type: 'expense' | 'income') {
  const { t } = useTranslation();

  const [customExpense] = useLocalStorage<CategoryTemplate[]>('custom_expense_categories', []);
  const [customIncome] = useLocalStorage<CategoryTemplate[]>('custom_income_categories', []);
  const [hiddenExpense] = useLocalStorage<string[]>('hidden_expense_categories', []);
  const [hiddenIncome] = useLocalStorage<string[]>('hidden_income_categories', []);

  const defaults = type === 'expense' ? expenseCategories : incomeCategories;
  const custom = type === 'expense' ? customExpense : customIncome;
  const hidden = type === 'expense' ? hiddenExpense : hiddenIncome;

  const visibleDefaults = useMemo(
    () => defaults.filter((c) => !hidden.includes(c.key)),
    [defaults, hidden]
  );

  const allCategories = useMemo(
    () => [...visibleDefaults, ...custom.map((c) => ({ ...c, isCustom: true }))],
    [visibleDefaults, custom]
  );

  /** Find a category by key (searches defaults first, then custom). Returns undefined if not found. */
  const findCategory = (key: string): CategoryTemplate | undefined => {
    return defaults.find((c) => c.key === key) || custom.find((c) => c.key === key);
  };

  /** Get display name for a category key */
  const getCategoryName = (key: string, categoryType?: 'expense' | 'income'): string => {
    const effectiveType = categoryType || type;
    // Check if it's a custom category
    const customCat = (effectiveType === 'expense' ? customExpense : customIncome).find(
      (c) => c.key === key
    );
    if (customCat) {
      const translations = JSON.parse(localStorage.getItem('category_translations') || '{}');
      return translations[`${effectiveType}.${key}`] || key;
    }
    return t(`categories.${effectiveType}.${key}`);
  };

  return {
    allCategories,
    visibleDefaults,
    custom,
    findCategory,
    getCategoryName,
  };
}

/**
 * Standalone function to find a category template by key from all sources.
 * Useful when you don't want full hook overhead but need icon/color lookup.
 */
export function findCategoryTemplate(
  key: string,
  type: 'expense' | 'income'
): CategoryTemplate | undefined {
  const defaults = type === 'expense' ? expenseCategories : incomeCategories;
  const found = defaults.find((c) => c.key === key);
  if (found) return found;

  // Check custom categories from localStorage
  if (typeof window !== 'undefined') {
    try {
      const storageKey =
        type === 'expense' ? 'custom_expense_categories' : 'custom_income_categories';
      const custom: CategoryTemplate[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return custom.find((c) => c.key === key);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Get display name for any category key (default or custom).
 */
export function getCategoryDisplayName(
  key: string,
  type: 'expense' | 'income',
  t: (key: string) => string
): string {
  // Check if it's a custom category
  if (typeof window !== 'undefined') {
    try {
      const storageKey =
        type === 'expense' ? 'custom_expense_categories' : 'custom_income_categories';
      const custom: CategoryTemplate[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const customCat = custom.find((c) => c.key === key);
      if (customCat) {
        const translations = JSON.parse(localStorage.getItem('category_translations') || '{}');
        return translations[`${type}.${key}`] || key;
      }
    } catch {
      // fall through
    }
  }
  return t(`categories.${type}.${key}`);
}
