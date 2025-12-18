'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { expenseCategories, incomeCategories } from '../hooks/useLocalStorage';
import { Transaction, Template } from '@/types/finance';

interface QuickAddFormProps {
  type: 'expense' | 'income';
  onAdd: (transaction: Transaction) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickAddForm({ type, onAdd, open, onOpenChange }: QuickAddFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<Template | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const templates = type === 'expense' ? expenseCategories : incomeCategories;
  const title = type === 'expense' ? 'Novo Gasto' : 'Nova Renda';

  const handleSubmit = () => {
    if (!selectedCategory || !amount) return;

    onAdd({
      id: Date.now(),
      type,
      category: selectedCategory.name,
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString(),
    });

    setSelectedCategory(null);
    setAmount('');
    setDescription('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setAmount('');
    setDescription('');
    onOpenChange(false);
  };

  const formatCurrencyInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers) / 100;
    return amount.toFixed(2);
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrencyInput(value);
    setAmount(formatted);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Categoria</p>
            <div className="grid grid-cols-3 gap-2">
              {templates.map((template) => (
                <motion.button
                  key={template.name}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(template)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedCategory?.name === template.name
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{template.icon}</div>
                  <p className="text-xs font-medium text-gray-700 truncate">{template.name}</p>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Valor (R$)</p>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-2xl font-bold h-14 text-center"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Descrição (opcional)</p>
            <Input
              type="text"
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedCategory || !amount}
            className={`w-full h-12 text-base font-semibold ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar {type === 'expense' ? 'Gasto' : 'Renda'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
