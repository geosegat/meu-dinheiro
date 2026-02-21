'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { expenseCategories, incomeCategories, useLocalStorage } from '../hooks/useLocalStorage';
import { Transaction, Template } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';
import { getCategoryDisplayName, findCategoryTemplate } from '../hooks/useCategories';

interface QuickAddFormProps {
  type: 'expense' | 'income';
  onAdd: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  editTransaction?: Transaction | null;
  initialCategory?: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickAddForm({
  type,
  onAdd,
  onEdit,
  editTransaction,
  initialCategory,
  open,
  onOpenChange,
}: QuickAddFormProps) {
  const { t, locale } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<Template | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const amountRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with current date and time (local timezone)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const currentDate = `${year}-${month}-${day}`; // YYYY-MM-DD
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  const [date, setDate] = useState(currentDate);
  const [time, setTime] = useState(currentTime);

  const defaultTemplates = type === 'expense' ? expenseCategories : incomeCategories;
  const [customExpense] = useLocalStorage<Template[]>('custom_expense_categories', []);
  const [customIncome] = useLocalStorage<Template[]>('custom_income_categories', []);
  const [hiddenExpense] = useLocalStorage<string[]>('hidden_expense_categories', []);
  const [hiddenIncome] = useLocalStorage<string[]>('hidden_income_categories', []);
  const [allTransactions] = useLocalStorage<Transaction[]>('finance_transactions', []);
  const hidden = type === 'expense' ? hiddenExpense : hiddenIncome;
  const custom = type === 'expense' ? customExpense : customIncome;
  const baseTemplates = [...defaultTemplates.filter((c) => !hidden.includes(c.key)), ...custom];

  // Sort by how many times the user has used each category (most used first)
  const usageCount = allTransactions
    .filter((tx) => tx.type === type)
    .reduce((acc: Record<string, number>, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + 1;
      return acc;
    }, {});

  const templates = [...baseTemplates].sort(
    (a, b) => (usageCount[b.key] || 0) - (usageCount[a.key] || 0)
  );

  const isEditing = !!editTransaction;
  const title = isEditing
    ? t(type === 'expense' ? 'forms.editExpense' : 'forms.editIncome')
    : type === 'expense'
      ? t('forms.newExpense')
      : t('forms.newIncome');

  // Auto-select category and scroll to amount when opened with an initialCategory (quick-add tile click)
  useEffect(() => {
    if (open && initialCategory && !isEditing) {
      setSelectedCategory(initialCategory);
      setTimeout(() => {
        amountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [open, initialCategory]);

  // Pre-fill form when editing
  useEffect(() => {
    if (editTransaction && open) {
      const catTemplate =
        findCategoryTemplate(editTransaction.category, type) ||
        templates.find((t) => t.key === editTransaction.category) ||
        null;
      setSelectedCategory(catTemplate);
      setAmount(String(editTransaction.amount));
      setDescription(editTransaction.description || '');
      const editDate = new Date(editTransaction.date);
      const ey = editDate.getFullYear();
      const em = String(editDate.getMonth() + 1).padStart(2, '0');
      const ed = String(editDate.getDate()).padStart(2, '0');
      setDate(`${ey}-${em}-${ed}`);
      setTime(editDate.toTimeString().slice(0, 5));
    }
  }, [editTransaction, open]);

  const handleSubmit = () => {
    if (!selectedCategory || !amount) return;

    // Combine date and time into ISO string
    const dateTimeString = `${date}T${time}:00`;
    const selectedDateTime = new Date(dateTimeString);

    const transaction: Transaction = {
      id: isEditing ? editTransaction!.id : Date.now(),
      type,
      category: selectedCategory.key,
      amount: parseFloat(amount),
      description,
      date: selectedDateTime.toISOString(),
    };

    if (isEditing && onEdit) {
      onEdit(transaction);
    } else {
      onAdd(transaction);
    }

    // Reset form
    setSelectedCategory(null);
    setAmount('');
    setDescription('');

    // Reset to current date/time
    const resetNow = new Date();
    const resetYear = resetNow.getFullYear();
    const resetMonth = String(resetNow.getMonth() + 1).padStart(2, '0');
    const resetDay = String(resetNow.getDate()).padStart(2, '0');
    setDate(`${resetYear}-${resetMonth}-${resetDay}`);
    setTime(resetNow.toTimeString().slice(0, 5));

    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setAmount('');
    setDescription('');

    // Reset to current date/time
    const resetNow = new Date();
    const resetYear = resetNow.getFullYear();
    const resetMonth = String(resetNow.getMonth() + 1).padStart(2, '0');
    const resetDay = String(resetNow.getDate()).padStart(2, '0');
    setDate(`${resetYear}-${resetMonth}-${resetDay}`);
    setTime(resetNow.toTimeString().slice(0, 5));

    onOpenChange(false);
  };

  const decimalSep = locale === 'pt-BR' ? ',' : '.';
  const thousandsSep = locale === 'pt-BR' ? '.' : ',';

  const handleAmountChange = (value: string) => {
    // Accept both '.' and ',' as decimal separators (mobile keyboards may use either)
    // Normalise to internal dot representation
    let raw = value.replace(/[^\d.,]/g, '');
    // If both separators are present, the last one is the decimal
    const lastComma = raw.lastIndexOf(',');
    const lastDot = raw.lastIndexOf('.');
    if (lastComma > lastDot) {
      // comma is the decimal separator — remove dots (thousands), keep comma, convert to dot
      raw = raw.replace(/\./g, '').replace(',', '.');
    } else {
      // dot is the decimal separator — remove commas (thousands)
      raw = raw.replace(/,/g, '');
    }
    // Only one decimal point allowed
    const parts = raw.split('.');
    if (parts.length > 2) return;
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    setAmount(raw);
  };

  const formatDisplayAmount = (value: string) => {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return parts.join(decimalSep);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] sm:max-h-[95vh] sm:min-h-[70vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
          <DialogTitle className="text-lg sm:text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 sm:space-y-6 px-4 sm:px-6 py-6 sm:py-4 overflow-y-auto flex-1 overscroll-contain">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              {t('forms.category')}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {templates.map((template) => (
                <motion.button
                  key={template.key}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCategory(template);
                    setTimeout(() => {
                      amountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      inputRef.current?.focus();
                    }, 80);
                  }}
                  className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${
                    selectedCategory?.key === template.key
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{template.icon}</div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-700 truncate leading-tight">
                    {getCategoryDisplayName(template.key, type, t)}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          <div ref={amountRef}>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{t('forms.amount')}</p>
            <Input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              placeholder={locale === 'pt-BR' ? '0,00' : '0.00'}
              value={formatDisplayAmount(amount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-xl sm:text-2xl font-bold h-12 sm:h-14 text-center"
            />
          </div>

          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
              {t('forms.description')}
            </p>
            <Input
              type="text"
              placeholder={t('forms.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 sm:h-auto"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{t('forms.date')}</p>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 sm:h-12"
              />
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{t('forms.time')}</p>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 sm:h-12"
              />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100 shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={!selectedCategory || !amount}
            className={`w-full h-11 sm:h-12 text-sm sm:text-base font-semibold ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isEditing ? (
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            ) : (
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            )}
            {isEditing
              ? t('forms.save')
              : t(type === 'expense' ? 'forms.addExpense' : 'forms.addIncome')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
