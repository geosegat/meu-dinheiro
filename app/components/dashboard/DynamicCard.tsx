'use client';

import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  Target,
  Clock,
  Crown,
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import { DashboardCardType } from '@/app/types/dashboard';
import { Transaction, Investment } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';
import { calcularRendimento } from '../finance/InvestmentCard';
import { expenseCategories } from '../hooks/useLocalStorage';
import { findCategoryTemplate, getCategoryDisplayName } from '../hooks/useCategories';

interface DynamicCardProps {
  type: DashboardCardType;
  transactions: Transaction[];
  investments: Investment[];
  currentBalance: number;
  futureIncome: number;
  futureExpenses: number;
  delay?: number;
}

export default function DynamicCard({
  type,
  transactions,
  investments,
  currentBalance,
  futureIncome,
  futureExpenses,
  delay = 0,
}: DynamicCardProps) {
  const { t, formatCurrency } = useTranslation();

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const lastMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return (
      txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear()
    );
  });

  const pastTransactions = transactions.filter((tx) => new Date(tx.date) <= now);

  const totalIncome = currentMonthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const lastMonthExpenses = lastMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const rendimentoDiarioTotal = investments.reduce((sum, inv) => {
    const dados = calcularRendimento(inv);
    return sum + dados.rendimentoDiario;
  }, 0);

  const expensesByCategory = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc: Record<string, number>, tx) => {
      if (!acc[tx.category]) acc[tx.category] = 0;
      acc[tx.category] += tx.amount;
      return acc;
    }, {});

  const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const totalInvested = investments.reduce((sum, inv) => sum + inv.valor_inicial, 0);
  const totalInvestmentBalance = investments.reduce((sum, inv) => {
    const dados = calcularRendimento(inv);
    return sum + dados.saldoAtual;
  }, 0);

  const futurePendingCount = transactions.filter((tx) => new Date(tx.date) > now).length;

  switch (type) {
    case 'current-balance':
      return (
        <StatCard
          title={t('dashboard.currentBalance')}
          value={formatCurrency(currentBalance)}
          icon={Wallet}
          color={currentBalance >= 0 ? 'blue' : 'red'}
          trend={
            futureIncome - futureExpenses !== 0
              ? `${futureIncome - futureExpenses >= 0 ? '+' : ''}${formatCurrency(
                  Math.abs(futureIncome - futureExpenses)
                )} ${
                  futureIncome - futureExpenses >= 0
                    ? t('dashboard.futureIncome')
                    : t('dashboard.futureExpense')
                }`
              : undefined
          }
          trendUp={futureIncome - futureExpenses >= 0}
          delay={delay}
        />
      );

    case 'total-income':
      return (
        <StatCard
          title={t('dashboard.totalIncome')}
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          color="green"
          trend={
            futureIncome > 0
              ? `${formatCurrency(futureIncome)} ${t('dashboard.futureIncome')}`
              : undefined
          }
          trendUp={true}
          delay={delay}
        />
      );

    case 'total-expenses':
      return (
        <StatCard
          title={t('dashboard.totalExpenses')}
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          color="red"
          trend={
            futureExpenses > 0
              ? `${formatCurrency(futureExpenses)} ${t('dashboard.futureExpense')}`
              : undefined
          }
          trendUp={false}
          delay={delay}
        />
      );

    case 'monthly-expenses':
      const percentChange =
        lastMonthExpenses > 0 ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
      const lastMonthName = t(`months.${lastMonth.getMonth()}`);

      return (
        <StatCard
          title={t('cards.monthlyExpenses.title')}
          value={formatCurrency(totalExpenses)}
          icon={Calendar}
          color="red"
          trend={
            lastMonthExpenses > 0
              ? `${percentChange >= 0 ? '↑' : '↓'} ${Math.abs(percentChange).toFixed(1)}% vs ${lastMonthName}`
              : undefined
          }
          trendUp={percentChange < 0}
          delay={delay}
        />
      );

    case 'investments':
      return (
        <StatCard
          title={t('cards.investments.title')}
          value={formatCurrency(totalInvestmentBalance)}
          icon={PiggyBank}
          color="purple"
          trend={`${formatCurrency(totalInvested)} ${t('cards.investments.invested')}`}
          trendUp={totalInvestmentBalance > totalInvested}
          delay={delay}
        />
      );

    case 'top-category':
      const topCategoryTemplate =
        findCategoryTemplate(topCategory?.[0] || '', 'expense') || expenseCategories[0];
      return (
        <StatCard
          title={t('cards.topCategory.title')}
          value={topCategory ? formatCurrency(topCategory[1]) : formatCurrency(0)}
          icon={Crown}
          color="red"
          trend={
            topCategory
              ? `${topCategoryTemplate?.icon || ''} ${getCategoryDisplayName(topCategory[0], 'expense', t)}`
              : t('cards.topCategory.noData')
          }
          trendUp={false}
          delay={delay}
        />
      );

    case 'savings-rate':
      return (
        <StatCard
          title={t('cards.savingsRate.title')}
          value={`${savingsRate.toFixed(1)}%`}
          icon={Target}
          color={savingsRate >= 20 ? 'green' : savingsRate >= 10 ? 'blue' : 'red'}
          trend={
            totalIncome > 0
              ? `${formatCurrency(totalIncome - totalExpenses)} ${t('cards.savingsRate.saved')}`
              : undefined
          }
          trendUp={savingsRate >= 20}
          delay={delay}
        />
      );

    case 'pending-payments':
      return (
        <StatCard
          title={t('cards.pendingPayments.title')}
          value={formatCurrency(futureExpenses)}
          icon={Clock}
          color="red"
          trend={
            futurePendingCount > 0
              ? `${futurePendingCount} ${t('cards.pendingPayments.transactions')}`
              : t('cards.pendingPayments.noData')
          }
          trendUp={false}
          delay={delay}
        />
      );

    case 'daily-yield':
      return (
        <StatCard
          title={t('dashboard.dailyYield')}
          value={formatCurrency(rendimentoDiarioTotal)}
          icon={PiggyBank}
          color="purple"
          trend={`${formatCurrency(rendimentoDiarioTotal * 30)}${t('dashboard.perMonth')}`}
          trendUp={true}
          delay={delay}
        />
      );

    default:
      return null;
  }
}
