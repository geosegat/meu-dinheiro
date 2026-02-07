'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/types/finance';
import { expenseCategories } from '../../components/hooks/useLocalStorage';
import { useTranslation } from '@/app/i18n/useTranslation';

const COLORS = [
  '#F43F5E',
  '#8B5CF6',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
];

interface CategoryBreakdownProps {
  transactions: Transaction[];
  type?: 'income' | 'expense';
}

interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

export default function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const { t, formatCurrency } = useTranslation();

  const expenses = transactions.filter((t) => t.type === 'expense');

  const categoryData = expenses.reduce((acc: Record<string, number>, t) => {
    if (!acc[t.category]) {
      acc[t.category] = 0;
    }
    acc[t.category] += t.amount;
    return acc;
  }, {});

  const chartData: ChartDataItem[] = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('expenses.byCategory')}</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>{t('expenses.addToSeeChart')}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{t('expenses.byCategory')}</h3>
        <div className="text-sm text-gray-500">
          {t('charts.total')}{' '}
          <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3 w-full">
          {chartData.map((item, index) => {
            const template = expenseCategories.find((c) => c.key === item.name);
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">{template?.icon}</span>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {t(`categories.expense.${item.name}`)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-sm font-medium text-gray-500 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
