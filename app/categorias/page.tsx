'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '../components/layout/AppLayout';
import EmojiPicker from '../components/forms/EmojiPicker';
import { useTranslation } from '@/app/i18n/useTranslation';
import {
  useLocalStorage,
  expenseCategories,
  incomeCategories,
} from '../components/hooks/useLocalStorage';

type CategoryType = 'expense' | 'income';

interface Template {
  key: string;
  icon: string;
  color: string;
}

interface CustomCategory extends Template {
  isCustom?: boolean;
}

export default function CategoriasPage() {
  const { t } = useTranslation();
  const [customExpenseCategories, setCustomExpenseCategories] = useLocalStorage<CustomCategory[]>(
    'custom_expense_categories',
    []
  );
  const [customIncomeCategories, setCustomIncomeCategories] = useLocalStorage<CustomCategory[]>(
    'custom_income_categories',
    []
  );

  const [selectedType, setSelectedType] = useState<CategoryType>('expense');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryEmoji, setCategoryEmoji] = useState('💰');
  const [categoryColor, setCategoryColor] = useState('bg-blue-100');

  const colors = [
    'bg-red-100',
    'bg-orange-100',
    'bg-amber-100',
    'bg-yellow-100',
    'bg-lime-100',
    'bg-green-100',
    'bg-emerald-100',
    'bg-teal-100',
    'bg-cyan-100',
    'bg-sky-100',
    'bg-blue-100',
    'bg-indigo-100',
    'bg-violet-100',
    'bg-purple-100',
    'bg-fuchsia-100',
    'bg-pink-100',
    'bg-rose-100',
  ];

  const defaultCategories = selectedType === 'expense' ? expenseCategories : incomeCategories;
  const customCategories =
    selectedType === 'expense' ? customExpenseCategories : customIncomeCategories;
  const setCustomCategories =
    selectedType === 'expense' ? setCustomExpenseCategories : setCustomIncomeCategories;

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryEmoji('💰');
    setCategoryColor('bg-blue-100');
    setShowAddModal(true);
  };

  const handleEditCategory = (category: CustomCategory) => {
    if (!category.isCustom) return; // Can't edit default categories

    setEditingCategory(category);
    setCategoryName(t(`categories.${selectedType}.${category.key}`));
    setCategoryEmoji(category.icon);
    setCategoryColor(category.color);
    setShowAddModal(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;

    const newCategory: CustomCategory = {
      key: editingCategory?.key || `custom_${Date.now()}`,
      icon: categoryEmoji,
      color: categoryColor,
      isCustom: true,
    };

    if (editingCategory) {
      // Update existing
      const updated = customCategories.map((cat) =>
        cat.key === editingCategory.key ? newCategory : cat
      );
      setCustomCategories(updated);

      // Update the translation in localStorage
      const translations = JSON.parse(localStorage.getItem('category_translations') || '{}');
      translations[`${selectedType}.${newCategory.key}`] = categoryName;
      localStorage.setItem('category_translations', JSON.stringify(translations));
    } else {
      // Add new
      setCustomCategories([...customCategories, newCategory]);

      // Save translation
      const translations = JSON.parse(localStorage.getItem('category_translations') || '{}');
      translations[`${selectedType}.${newCategory.key}`] = categoryName;
      localStorage.setItem('category_translations', JSON.stringify(translations));
    }

    setShowAddModal(false);
    setCategoryName('');
    setCategoryEmoji('💰');
    setCategoryColor('bg-blue-100');
  };

  const handleDeleteCategory = (category: CustomCategory) => {
    if (!category.isCustom) return;

    const updated = customCategories.filter((cat) => cat.key !== category.key);
    setCustomCategories(updated);

    // Remove translation
    const translations = JSON.parse(localStorage.getItem('category_translations') || '{}');
    delete translations[`${selectedType}.${category.key}`];
    localStorage.setItem('category_translations', JSON.stringify(translations));
  };

  const handleReorderCategories = (newOrder: CustomCategory[]) => {
    // Only reorder custom categories
    const reordered = newOrder.filter((cat) => cat.isCustom);
    setCustomCategories(reordered);
  };

  const getCategoryName = (category: CustomCategory) => {
    if (category.isCustom) {
      const translations = JSON.parse(localStorage.getItem('category_translations') || '{}');
      return translations[`${selectedType}.${category.key}`] || 'Sem nome';
    }
    return t(`categories.${selectedType}.${category.key}`);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t('categories.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">{t('categories.subtitle')}</p>
          </motion.div>

          {/* Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2"
          >
            <Button
              onClick={() => setSelectedType('expense')}
              variant={selectedType === 'expense' ? 'default' : 'outline'}
              className={selectedType === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : ''}
            >
              {t('categories.expenses')}
            </Button>
            <Button
              onClick={() => setSelectedType('income')}
              variant={selectedType === 'income' ? 'default' : 'outline'}
              className={selectedType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {t('categories.incomes')}
            </Button>
            <Button onClick={handleOpenAddModal} className="ml-auto bg-gray-900 hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              {t('categories.addNew')}
            </Button>
          </motion.div>

          {/* Categories List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {t('categories.defaultCategories')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {defaultCategories.map((category) => (
                <div
                  key={category.key}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${category.color}`}
                  >
                    {category.icon}
                  </div>
                  <p className="text-xs font-medium text-gray-700 text-center truncate w-full">
                    {t(`categories.${selectedType}.${category.key}`)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t('categories.customCategories')}
              </h3>
              <Reorder.Group
                axis="y"
                values={customCategories}
                onReorder={handleReorderCategories}
                className="space-y-2"
              >
                {customCategories.map((category) => (
                  <Reorder.Item key={category.key} value={category}>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing shrink-0" />
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${category.color} shrink-0`}
                      >
                        {category.icon}
                      </div>
                      <p className="flex-1 font-medium text-gray-900 truncate">
                        {getCategoryName(category)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(category)}
                        className="text-gray-400 hover:text-blue-600 shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category)}
                        className="text-gray-400 hover:text-rose-600 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0 shrink-0">
            <DialogTitle className="text-lg sm:text-xl font-bold">
              {editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-4 sm:px-6 py-4 overflow-y-auto flex-1">
            {/* Emoji Selector */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                {t('categories.icon')}
              </label>
              <button
                onClick={() => setShowEmojiPicker(true)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center text-3xl sm:text-4xl transition-colors border-2 border-gray-200 hover:border-gray-300"
              >
                {categoryEmoji}
              </button>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                {t('categories.name')}
              </label>
              <Input
                type="text"
                placeholder={t('categories.namePlaceholder')}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="h-10 sm:h-auto"
              />
            </div>

            {/* Color Selector */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                {t('categories.color')}
              </label>
              <div className="grid grid-cols-9 gap-1.5 sm:gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCategoryColor(color)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${color} transition-transform active:scale-95 ${
                      categoryColor === color ? 'ring-2 ring-gray-900 scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-gray-100 shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1 h-10 sm:h-auto"
            >
              {t('forms.cancel')}
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={!categoryName.trim()}
              className="flex-1 bg-gray-900 hover:bg-gray-800 h-10 sm:h-auto"
            >
              {editingCategory ? t('forms.update') : t('forms.add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emoji Picker */}
      <EmojiPicker
        open={showEmojiPicker}
        onOpenChange={setShowEmojiPicker}
        onSelect={setCategoryEmoji}
        selectedEmoji={categoryEmoji}
      />
    </AppLayout>
  );
}
