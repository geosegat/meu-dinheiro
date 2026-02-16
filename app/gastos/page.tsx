'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingDown, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage, expenseCategories } from '../components/hooks/useLocalStorage';
import { findCategoryTemplate, getCategoryDisplayName } from '../components/hooks/useCategories';
import TransactionItem from '../components/finance/TransactionItem';
import QuickAddForm from '../components/forms/QuickAddForm';
import AppLayout from '../components/layout/AppLayout';
import { Transaction } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';

export default function GastosPage() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    'finance_transactions',
    []
  );
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth()));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hiddenExpense] = useLocalStorage<string[]>('hidden_expense_categories', []);
  const [customExpense] = useLocalStorage<{ key: string; icon: string; color: string }[]>(
    'custom_expense_categories',
    []
  );
  const visibleExpenseCategories = [
    ...expenseCategories.filter((c) => !hiddenExpense.includes(c.key)),
    ...customExpense,
  ];
  const { t, formatCurrency } = useTranslation();

  const expenseTransactions = transactions
    .filter((tx) => tx.type === 'expense')
    .filter((tx) => {
      if (selectedMonth === 'all') return true;
      const date = new Date(tx.date);
      return date.getMonth() === parseInt(selectedMonth);
    })
    .filter((tx) => {
      if (selectedCategory === 'all') return true;
      return tx.category === selectedCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, transaction]);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactions(transactions.map((tx) => (tx.id === transaction.id ? transaction : tx)));
  };

  const handleStartEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const months = [
    { value: 'all', label: t('months.all') },
    { value: '0', label: t('months.0') },
    { value: '1', label: t('months.1') },
    { value: '2', label: t('months.2') },
    { value: '3', label: t('months.3') },
    { value: '4', label: t('months.4') },
    { value: '5', label: t('months.5') },
    { value: '6', label: t('months.6') },
    { value: '7', label: t('months.7') },
    { value: '8', label: t('months.8') },
    { value: '9', label: t('months.9') },
    { value: '10', label: t('months.10') },
    { value: '11', label: t('months.11') },
  ];

  const byCategory = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc: Record<string, number>, tx) => {
      if (!acc[tx.category]) acc[tx.category] = 0;
      acc[tx.category] += tx.amount;
      return acc;
    }, {});

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
              <h1 className="text-3xl font-bold text-gray-900">{t('expenses.title')}</h1>
              <p className="text-gray-500 mt-1">{t('expenses.subtitle')}</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('expenses.newExpense')}
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
              <span className="font-medium opacity-90">{t('expenses.totalExpenses')}</span>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-sm opacity-75 mt-2">
              {expenseTransactions.length} {t('expenses.transactions')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t('expenses.quickAdd')}</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {visibleExpenseCategories.slice(0, 6).map((template) => (
                <motion.button
                  key={template.key}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <p className="text-xs font-medium text-gray-600 truncate">
                    {getCategoryDisplayName(template.key, 'expense', t)}
                  </p>
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
                  const template =
                    findCategoryTemplate(category, 'expense') ||
                    expenseCategories[expenseCategories.length - 1];
                  return (
                    <div key={category} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{template?.icon || '📦'}</span>
                        <span className="text-sm font-medium text-gray-600">
                          {getCategoryDisplayName(category, 'expense', t)}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(amount as number)}
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
                <option value="all">{t('expenses.allCategories')}</option>
                {visibleExpenseCategories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.icon} {getCategoryDisplayName(cat.key, 'expense', t)}
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
            <h3 className="text-lg font-bold text-gray-900 mb-6">{t('expenses.history')}</h3>
            {expenseTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('expenses.noExpenses')}</p>
                <p className="text-sm mt-1">{t('expenses.clickToAdd')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {expenseTransactions.map((transaction, index) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onDelete={handleDeleteTransaction}
                      onEdit={handleStartEdit}
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
          onEdit={handleEditTransaction}
          editTransaction={editingTransaction}
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingTransaction(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
