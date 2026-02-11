'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../app/components/hooks/useLocalStorage';
import TransactionItem from '../app/components/finance/TransactionItem';
import QuickAddForm from '../app/components/forms/QuickAddForm';
import MonthlyChart from '../app/components/charts/MonthlyChart';
import CategoryBreakdown from '../app/components/charts/CategoryBreakdown';
import { Transaction, Investment } from '@/types/finance';
import AppLayout from '../app/components/layout/AppLayout';
import { useTranslation } from '@/app/i18n/useTranslation';
import DynamicCard from '../app/components/dashboard/DynamicCard';
import CardSelector from '../app/components/dashboard/CardSelector';
import { DashboardCardConfig, DEFAULT_CARDS } from '@/app/types/dashboard';

export default function DashboardPage() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'finance_transactions',
    []
  );
  const [investments] = useLocalStorage<Investment[]>('finance_investments', []);
  const [selectedCards, setSelectedCards] = useLocalStorage<DashboardCardConfig[]>(
    'dashboard_cards',
    DEFAULT_CARDS
  );
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { t, formatCurrency } = useTranslation();

  const handleSaveCards = (cards: DashboardCardConfig[]) => {
    setSelectedCards(cards);
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filters: Record<string, (date: Date) => boolean> = {
      month: (date) => date.getMonth() === currentMonth && date.getFullYear() === currentYear,
      '3months': (date) => {
        const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 90;
      },
      '6months': (date) => {
        const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 180;
      },
      year: (date) => date.getFullYear() === currentYear,
      all: () => true,
    };

    return transactions.filter((tx) => {
      const date = new Date(tx.date);
      const filterFn = filters[selectedPeriod] || filters.all;
      return filterFn(date);
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const now = new Date();
  now.setHours(23, 59, 59, 999); 
  
  const pastTransactions = filteredTransactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate <= now;
  });

  const futureTransactions = filteredTransactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate > now;
  });

  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const futureIncome = futureTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const futureExpenses = futureTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentBalance = pastTransactions.reduce((sum, tx) => {
    return tx.type === 'income' ? sum + tx.amount : sum - tx.amount;
  }, 0);


  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  const periods = [
    { value: 'month', label: t('periods.month') },
    { value: '3months', label: t('periods.3months') },
    { value: '6months', label: t('periods.6months') },
    { value: 'year', label: t('periods.year') },
    { value: 'all', label: t('periods.all') },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
              <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <CardSelector selectedCards={selectedCards} onSave={handleSaveCards} />
              <Button
                onClick={() => setShowIncomeForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                {t('dashboard.newIncome')}
              </Button>
              <Button
                onClick={() => setShowExpenseForm(true)}
                className="bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20"
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                {t('dashboard.newExpense')}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm font-medium text-gray-600">{t('dashboard.period')}</span>
            <div className="flex gap-2 flex-wrap">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === period.value
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {selectedCards
              .sort((a, b) => a.order - b.order)
              .map((card, index) => (
                <DynamicCard
                  key={card.id}
                  type={card.type}
                  transactions={filteredTransactions}
                  investments={investments}
                  currentBalance={currentBalance}
                  futureIncome={futureIncome}
                  futureExpenses={futureExpenses}
                  delay={index * 0.1}
                />
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CategoryBreakdown transactions={filteredTransactions} type="expense" />
            </div>
            <div className="lg:col-span-1">
              <MonthlyChart transactions={filteredTransactions} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {t('dashboard.recentTransactions')}
              </h3>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('dashboard.noTransactions')}</p>
                <p className="text-sm mt-1">{t('dashboard.clickToAdd')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onDelete={handleDeleteTransaction}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <QuickAddForm
          type="expense"
          onAdd={handleAddTransaction}
          open={showExpenseForm}
          onOpenChange={setShowExpenseForm}
        />
        <QuickAddForm
          type="income"
          onAdd={handleAddTransaction}
          open={showIncomeForm}
          onOpenChange={setShowIncomeForm}
        />
      </div>
    </AppLayout>
  );
}
