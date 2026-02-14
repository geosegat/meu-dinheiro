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
      className="group flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0 ${template.color}`}
      >
        {template.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
              {transaction.description ||
                t(
                  `categories.${transaction.type === 'expense' ? 'expense' : 'income'}.${transaction.category}`
                )}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
              {t(
                `categories.${transaction.type === 'expense' ? 'expense' : 'income'}.${transaction.category}`
              )}{' '}
              • {formatDate(transaction.date)} {t('transaction.at')} {formatTime(transaction.date)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(transaction.id)}
            className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
        <p
          className={`text-base sm:text-lg font-bold mt-1 ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}
        >
          {isExpense ? '- ' : '+ '}
          {formatCurrency(transaction.amount)}
        </p>
      </div>
    </motion.div>
  );
}
