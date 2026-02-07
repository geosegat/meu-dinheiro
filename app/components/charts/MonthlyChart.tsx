'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';

interface MonthlyChartProps {
  transactions: Transaction[];
}

export default function MonthlyChart({ transactions }: MonthlyChartProps) {
  const { t, formatCurrency } = useTranslation();

  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += t.amount;
      return acc;
    }, {});

  const incomesByCategory = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc: Record<string, number>, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += t.amount;
      return acc;
    }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);
  const totalIncome = Object.values(incomesByCategory).reduce((sum, val) => sum + val, 0);

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('charts.summary')}</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>{t('charts.addTransactions')}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-6">{t('charts.summary')}</h3>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-emerald-700">{t('charts.income')}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-emerald-600 mt-1">
              {Object.keys(incomesByCategory).length} {t('charts.categories')}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-linear-to-br from-rose-50 to-red-50 border border-rose-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-rose-700">{t('charts.expenses')}</span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-rose-900">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-rose-600 mt-1">
              {Object.keys(expensesByCategory).length} {t('charts.categories')}
            </p>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border-2 ${
            totalIncome - totalExpenses >= 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{t('charts.balance')}</span>
            <Wallet className="w-4 h-4 text-gray-600" />
          </div>
          <p
            className={`text-2xl font-bold ${
              totalIncome - totalExpenses >= 0 ? 'text-blue-900' : 'text-orange-900'
            }`}
          >
            {formatCurrency(totalIncome - totalExpenses)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
