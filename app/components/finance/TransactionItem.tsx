'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { expenseCategories, incomeCategories } from '../hooks/useLocalStorage';
import { Transaction } from '@/types/finance';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: number) => void;
  index: number;
}

export default function TransactionItem({ transaction, onDelete, index }: TransactionItemProps) {
  const isExpense = transaction.type === 'expense';
  const templates = isExpense ? expenseCategories : incomeCategories;
  const template =
    templates.find((t) => t.name === transaction.category) || templates[templates.length - 1];

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
            {transaction.description || transaction.category}
          </p>
          <p className="text-sm text-gray-500">
            {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')} às{' '}
            {new Date(transaction.date).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className={`text-lg font-bold ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
          {isExpense ? '-' : '+'} R${' '}
          {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(transaction.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-rose-500 hover:bg-rose-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
