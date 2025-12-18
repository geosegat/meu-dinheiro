'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingDown, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage, expenseCategories } from '../components/hooks/useLocalStorage';
import TransactionItem from '../components/finance/TransactionItem';
import QuickAddForm from '../components/forms/QuickAddForm';
import AppLayout from '../components/layout/AppLayout';
import { Transaction } from '@/types/finance';

export default function GastosPage() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'finance_transactions',
    []
  );
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const expenseTransactions = transactions
    .filter((t) => t.type === 'expense')
    .filter((t) => {
      if (selectedMonth === 'all') return true;
      const date = new Date(t.date);
      return date.getMonth() === parseInt(selectedMonth);
    })
    .filter((t) => {
      if (selectedCategory === 'all') return true;
      return t.category === selectedCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const months = [
    { value: 'all', label: 'Todos os meses' },
    { value: '0', label: 'Janeiro' },
    { value: '1', label: 'Fevereiro' },
    { value: '2', label: 'Março' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Maio' },
    { value: '5', label: 'Junho' },
    { value: '6', label: 'Julho' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Setembro' },
    { value: '9', label: 'Outubro' },
    { value: '10', label: 'Novembro' },
    { value: '11', label: 'Dezembro' },
  ];

  const byCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      if (!acc[t.category]) acc[t.category] = 0;
      acc[t.category] += t.amount;
      return acc;
    }, {});

  return (
    <AppLayout currentPageName="Gastos">
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gastos</h1>
              <p className="text-gray-500 mt-1">Controle suas despesas</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Gasto
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-linear-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white shadow-xl shadow-rose-600/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingDown className="w-5 h-5" />
              </div>
              <span className="font-medium opacity-90">Total de Gastos</span>
            </div>
            <p className="text-4xl font-bold">
              R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm opacity-75 mt-2">{expenseTransactions.length} transações</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Rápido</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {expenseCategories.slice(0, 6).map((template) => (
                <motion.button
                  key={template.name}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <p className="text-xs font-medium text-gray-600 truncate">{template.name}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {Object.keys(byCategory).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {Object.entries(byCategory)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 4)
                .map(([category, amount]) => {
                  const template = expenseCategories.find((t) => t.name === category);
                  return (
                    <div key={category} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{template?.icon || '📦'}</span>
                        <span className="text-sm font-medium text-gray-600">{category}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        R${' '}
                        {(amount as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                })}
            </motion.div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="all">Todas categorias</option>
                {expenseCategories.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Histórico de Gastos</h3>
            {expenseTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum gasto cadastrado</p>
                <p className="text-sm mt-1">Clique em &quot;Novo Gasto&quot; para adicionar</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {expenseTransactions.map((transaction, index) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onDelete={handleDeleteTransaction}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        <QuickAddForm
          type="expense"
          onAdd={handleAddTransaction}
          open={showForm}
          onOpenChange={setShowForm}
        />
      </div>
    </AppLayout>
  );
}
