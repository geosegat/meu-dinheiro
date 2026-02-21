'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Transaction } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';

interface DailyLimitCardProps {
  transactions: Transaction[];
  delay?: number;
}

interface DayData {
  date: Date;
  spent: number;
  isToday: boolean;
  label: string;
}

export default function DailyLimitCard({ transactions, delay = 0 }: DailyLimitCardProps) {
  const { t, formatCurrency } = useTranslation();
  const [dailyLimit, setDailyLimit] = useLocalStorage<number>('daily-limit-value', 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Today's range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayExpenses = transactions
    .filter((tx) => {
      const d = new Date(tx.date);
      return tx.type === 'expense' && d >= todayStart && d <= todayEnd;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remaining = dailyLimit - todayExpenses;
  const isOver = dailyLimit > 0 && remaining < 0;

  // Last 14 days history
  const last14Days: DayData[] = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - (13 - i));
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const spent = transactions
      .filter((tx) => {
        const d = new Date(tx.date);
        return tx.type === 'expense' && d >= dayStart && d <= dayEnd;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const label = weekdays[dayStart.getDay()];

    return { date: dayStart, spent, isToday: i === 13, label };
  });

  const startEdit = () => {
    setEditValue(dailyLimit > 0 ? String(dailyLimit) : '');
    setIsEditing(true);
  };

  const confirmEdit = () => {
    const v = parseFloat(editValue.replace(',', '.'));
    if (!isNaN(v) && v > 0) setDailyLimit(v);
    setIsEditing(false);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleDayClick = (index: number) => {
    setSelectedDay(selectedDay === index ? null : index);
  };

  const colorClass = isOver
    ? 'bg-gradient-to-br from-rose-500 to-red-600'
    : 'bg-gradient-to-br from-emerald-500 to-teal-600';

  const valueColor = isOver ? 'text-rose-600' : 'text-gray-900';

  const selectedDayData = selectedDay !== null ? last14Days[selectedDay] : null;
  const selectedOver =
    selectedDayData && dailyLimit > 0 ? selectedDayData.spent - dailyLimit : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
    >
      {/* Header — mesma estrutura dos outros StatCards */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{t('cards.dailyLimit.title')}</p>
          <p className={`text-3xl font-bold tracking-tight ${valueColor}`}>
            {dailyLimit > 0 ? formatCurrency(Math.abs(remaining)) : '—'}
          </p>
          <p className={`text-sm font-medium ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
            {dailyLimit > 0
              ? isOver
                ? `↓ ${t('cards.dailyLimit.over')}`
                : `↑ ${t('cards.dailyLimit.remaining')}`
              : t('cards.dailyLimit.setLimitHint')}
          </p>
        </div>
        <div className={`p-3 rounded-xl shadow-lg ${colorClass}`}>
          <Gauge className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Limite + gasto hoje */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-gray-400">{t('cards.dailyLimit.limit')}:</span>
        {isEditing ? (
          <>
            <input
              autoFocus
              type="number"
              min="0"
              step="0.01"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              className="w-24 text-xs border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={confirmEdit}
              className="text-emerald-600 hover:text-emerald-700"
              title="Confirmar"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-600"
              title="Cancelar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <span className="text-xs font-semibold text-gray-700">
              {dailyLimit > 0 ? formatCurrency(dailyLimit) : '—'}
            </span>
            <button
              onClick={startEdit}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title={t('cards.dailyLimit.editLimit')}
            >
              <Pencil className="w-3 h-3" />
            </button>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-gray-400">{t('cards.dailyLimit.today')}:</span>
          <span className={`text-xs font-semibold ${isOver ? 'text-rose-600' : 'text-gray-700'}`}>
            {formatCurrency(todayExpenses)}
          </span>
        </div>
      </div>

      {/* Botão histórico */}
      <button
        onClick={() => {
          setShowHistory((v) => !v);
          setSelectedDay(null);
        }}
        className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {t('cards.dailyLimit.history')}
      </button>

      {/* Histórico expandível */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Dots dos últimos 14 dias */}
            <div className="flex items-end gap-0.75 mt-3">
              {last14Days.map((d, i) => {
                const isOverLimit = dailyLimit > 0 && d.spent > dailyLimit;
                const hasSpent = d.spent > 0;
                const isSelected = selectedDay === i;

                let dotColor = 'bg-gray-200';
                if (hasSpent) dotColor = isOverLimit ? 'bg-rose-400' : 'bg-emerald-400';
                if (isSelected) dotColor = isOverLimit ? 'bg-rose-600' : 'bg-emerald-600';
                if (d.isToday && hasSpent)
                  dotColor = isOverLimit
                    ? 'bg-rose-500 ring-2 ring-rose-300'
                    : 'bg-emerald-500 ring-2 ring-emerald-300';

                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(i)}
                    className="flex-1 flex flex-col items-center gap-0.5 group"
                    title={`${d.date.getDate()}/${d.date.getMonth() + 1}: ${formatCurrency(d.spent)}`}
                  >
                    <span
                      className={`w-full h-2 rounded-full transition-all ${dotColor} ${!hasSpent ? 'opacity-40' : ''} ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                    />
                    <span
                      className={`text-[8px] ${d.isToday ? 'font-bold text-gray-700' : 'text-gray-400'}`}
                    >
                      {d.date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detalhe do dia clicado */}
            <AnimatePresence>
              {selectedDayData && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={`mt-2 rounded-xl px-3 py-2.5 text-xs ${
                    selectedOver !== null && selectedOver > 0
                      ? 'bg-rose-50 border border-rose-100'
                      : 'bg-emerald-50 border border-emerald-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">
                      {selectedDayData.date.toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                      {selectedDayData.isToday && (
                        <span className="ml-1 text-[9px] bg-blue-100 text-blue-600 rounded px-1 py-0.5 font-bold">
                          hoje
                        </span>
                      )}
                    </span>
                    <span
                      className={`font-bold ${selectedOver !== null && selectedOver > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                    >
                      {formatCurrency(selectedDayData.spent)}
                    </span>
                  </div>
                  {dailyLimit > 0 && (
                    <div className="flex items-center justify-between mt-1 text-gray-500">
                      <span>
                        {t('cards.dailyLimit.limit')}: {formatCurrency(dailyLimit)}
                      </span>
                      {selectedOver !== null && selectedOver > 0 ? (
                        <span className="text-rose-500 font-semibold">
                          +{formatCurrency(selectedOver)} {t('cards.dailyLimit.over')}
                        </span>
                      ) : selectedDayData.spent > 0 ? (
                        <span className="text-emerald-500 font-semibold">
                          -{formatCurrency(Math.abs(selectedOver ?? 0))}{' '}
                          {t('cards.dailyLimit.remaining')}
                        </span>
                      ) : (
                        <span className="text-gray-400">{t('cards.dailyLimit.noExpenses')}</span>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background decoration */}
      <div
        className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${colorClass} opacity-10`}
      />
    </motion.div>
  );
}
