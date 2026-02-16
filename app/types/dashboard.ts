export type DashboardCardType =
  | 'current-balance'
  | 'total-income'
  | 'total-expenses'
  | 'monthly-expenses'
  | 'investments'
  | 'top-category'
  | 'savings-rate'
  | 'pending-payments'
  | 'daily-yield'
  | 'daily-budget';

export interface DashboardCardConfig {
  id: string;
  type: DashboardCardType;
  order: number;
}

export const DEFAULT_CARDS: DashboardCardConfig[] = [
  { id: '1', type: 'current-balance', order: 0 },
  { id: '2', type: 'monthly-expenses', order: 1 },
  { id: '3', type: 'total-expenses', order: 2 },
  { id: '4', type: 'pending-payments', order: 3 },
];

export const AVAILABLE_CARDS: Array<{
  type: DashboardCardType;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    type: 'current-balance',
    labelKey: 'cards.currentBalance.title',
    descriptionKey: 'cards.currentBalance.description',
  },
  {
    type: 'total-income',
    labelKey: 'cards.totalIncome.title',
    descriptionKey: 'cards.totalIncome.description',
  },
  {
    type: 'total-expenses',
    labelKey: 'cards.totalExpenses.title',
    descriptionKey: 'cards.totalExpenses.description',
  },
  {
    type: 'monthly-expenses',
    labelKey: 'cards.monthlyExpenses.title',
    descriptionKey: 'cards.monthlyExpenses.description',
  },
  {
    type: 'investments',
    labelKey: 'cards.investments.title',
    descriptionKey: 'cards.investments.description',
  },
  {
    type: 'top-category',
    labelKey: 'cards.topCategory.title',
    descriptionKey: 'cards.topCategory.description',
  },
  {
    type: 'savings-rate',
    labelKey: 'cards.savingsRate.title',
    descriptionKey: 'cards.savingsRate.description',
  },
  {
    type: 'pending-payments',
    labelKey: 'cards.pendingPayments.title',
    descriptionKey: 'cards.pendingPayments.description',
  },
  {
    type: 'daily-yield',
    labelKey: 'cards.dailyYield.title',
    descriptionKey: 'cards.dailyYield.description',
  },
  {
    type: 'daily-budget',
    labelKey: 'cards.dailyBudget.title',
    descriptionKey: 'cards.dailyBudget.description',
  },
];
