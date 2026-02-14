'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { expenseCategories, incomeCategories } from '../hooks/useLocalStorage';
import { Transaction, Template } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';

interface QuickAddFormProps {
  type: 'expense' | 'income';
  onAdd: (transaction: Transaction) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickAddForm({ type, onAdd, open, onOpenChange }: QuickAddFormProps) {
  const { t, locale } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<Template | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Initialize with current date and time (local timezone)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const currentDate = `${year}-${month}-${day}`; // YYYY-MM-DD
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  const [date, setDate] = useState(currentDate);
  const [time, setTime] = useState(currentTime);

  const templates = type === 'expense' ? expenseCategories : incomeCategories;
  const title = type === 'expense' ? t('forms.newExpense') : t('forms.newIncome');

  const handleSubmit = () => {
    if (!selectedCategory || !amount) return;

    // Combine date and time into ISO string
    const dateTimeString = `${date}T${time}:00`;
    const selectedDateTime = new Date(dateTimeString);

    onAdd({
      id: Date.now(),
      type,
      category: selectedCategory.key,
      amount: parseFloat(amount),
      description,
      date: selectedDateTime.toISOString(),
    });

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
    // Remove thousands separators, keep only digits and decimal separator
    let raw = value
      .replace(new RegExp(`\\${thousandsSep}`, 'g'), '')
      .replace(new RegExp(`[^\\d${decimalSep === ',' ? ',' : '.'}]`, 'g'), '');
    // Only allow one decimal separator
    const sepIndex = raw.indexOf(decimalSep);
    if (sepIndex !== -1) {
      raw =
        raw.slice(0, sepIndex + 1) +
        raw.slice(sepIndex + 1).replace(new RegExp(`\\${decimalSep}`, 'g'), '');
    }
    // Limit decimal to 2 places
    const parts = raw.split(decimalSep);
    if (parts[1] && parts[1].length > 2) return;
    // Store with dot for parseFloat compatibility
    setAmount(raw.replace(decimalSep, '.'));
  };

  const formatDisplayAmount = (value: string) => {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return parts.join(decimalSep);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
          <DialogTitle className="text-lg sm:text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 overflow-y-auto flex-1">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              {t('forms.category')}
            </p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {templates.map((template) => (
                <motion.button
                  key={template.key}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(template)}
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${
                    selectedCategory?.key === template.key
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{template.icon}</div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-700 truncate leading-tight">
                    {t(`categories.${type}.${template.key}`)}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{t('forms.amount')}</p>
            <Input
              type="text"
              inputMode="numeric"
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
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {t(type === 'expense' ? 'forms.addExpense' : 'forms.addIncome')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
