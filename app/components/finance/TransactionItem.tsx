'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { expenseCategories, incomeCategories } from '../hooks/useLocalStorage';
import { Transaction } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: number) => void;
  index: number;
}

export default function TransactionItem({ transaction, onDelete, index }: TransactionItemProps) {
  const { t, formatCurrency, formatDate, formatTime } = useTranslation();
  const isExpense = transaction.type === 'expense';
  const templates = isExpense ? expenseCategories : incomeCategories;
  const template =
    templates.find((c) => c.key === transaction.category) || templates[templates.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${template.color}`}
        >
          {template.icon}
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {transaction.description ||
              t(
                `categories.${transaction.type === 'expense' ? 'expense' : 'income'}.${transaction.category}`
              )}
          </p>
          <p className="text-sm text-gray-500">
            {t(
              `categories.${transaction.type === 'expense' ? 'expense' : 'income'}.${transaction.category}`
            )}{' '}
            • {formatDate(transaction.date)} {t('transaction.at')} {formatTime(transaction.date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className={`text-lg font-bold ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
          {isExpense ? '- ' : '+ '}
          {formatCurrency(transaction.amount)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(transaction.id)}
          className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
