'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../app/components/hooks/useLocalStorage';
import StatCard from '../app/components/layout/StatCard';
import TransactionItem from '../app/components/finance/TransactionItem';
import QuickAddForm from '../app/components/forms/QuickAddForm';
import MonthlyChart from '../app/components/charts/MonthlyChart';
import CategoryBreakdown from '../app/components/charts/CategoryBreakdown';
import { calcularRendimento } from '../app/components/finance/InvestmentCard';
import { Transaction, Investment } from '@/types/finance';
import AppLayout from '../app/components/layout/AppLayout';

export default function DashboardPage() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'finance_transactions',
    []
  );
  const [investments] = useLocalStorage<Investment[]>('finance_investments', []);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

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

    return transactions.filter((t) => {
      const date = new Date(t.date);
      const filterFn = filters[selectedPeriod] || filters.all;
      return filterFn(date);
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const rendimentoDiarioTotal = investments.reduce((sum, inv) => {
    const dados = calcularRendimento(inv);
    return sum + dados.rendimentoDiario;
  }, 0);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const periods = [
    { value: 'month', label: 'Este Mês' },
    { value: '3months', label: 'Últimos 3 Meses' },
    { value: '6months', label: 'Últimos 6 Meses' },
    { value: 'year', label: 'Este Ano' },
    { value: 'all', label: 'Tudo' },
  ];

  return (
    <AppLayout currentPageName="Dashboard">
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Visão geral das suas finanças</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowIncomeForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Nova Renda
              </Button>
              <Button
                onClick={() => setShowExpenseForm(true)}
                className="bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20"
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                Novo Gasto
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <span className="text-sm font-medium text-gray-600">Período:</span>
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
            <StatCard
              title="Saldo Atual"
              value={formatCurrency(balance)}
              icon={Wallet}
              color={balance >= 0 ? 'blue' : 'red'}
              delay={0}
            />
            <StatCard
              title="Total de Receitas"
              value={formatCurrency(totalIncome)}
              icon={TrendingUp}
              color="green"
              delay={0.1}
            />
            <StatCard
              title="Total de Gastos"
              value={formatCurrency(totalExpenses)}
              icon={TrendingDown}
              color="red"
              delay={0.2}
            />
            <StatCard
              title="Rendimento/Dia"
              value={formatCurrency(rendimentoDiarioTotal)}
              icon={PiggyBank}
              color="purple"
              trend={`${formatCurrency(rendimentoDiarioTotal * 30)}/mês`}
              trendUp={true}
              delay={0.3}
            />
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
              <h3 className="text-lg font-bold text-gray-900">Transações Recentes</h3>
            </div>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma transação ainda</p>
                <p className="text-sm mt-1">Clique nos botões acima para adicionar</p>
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
