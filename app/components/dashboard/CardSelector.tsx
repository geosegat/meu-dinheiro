'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Settings, Check, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { DashboardCardType, AVAILABLE_CARDS, DashboardCardConfig } from '@/app/types/dashboard';
import { useTranslation } from '@/app/i18n/useTranslation';
import { Button } from '@/components/ui/button';

interface CardSelectorProps {
  selectedCards: DashboardCardConfig[];
  onSave: (cards: DashboardCardConfig[]) => void;
}

export default function CardSelector({ selectedCards, onSave }: CardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<DashboardCardType[]>(
    selectedCards.map((c) => c.type)
  );
  const { t } = useTranslation();

  const toggleCard = (cardType: DashboardCardType) => {
    if (tempSelected.includes(cardType)) {
      setTempSelected(tempSelected.filter((t) => t !== cardType));
    } else {
      if (tempSelected.length < 4) {
        setTempSelected([...tempSelected, cardType]);
      }
    }
  };

  const moveCardUp = (index: number) => {
    if (index === 0) return;
    const newSelected = [...tempSelected];
    [newSelected[index - 1], newSelected[index]] = [newSelected[index], newSelected[index - 1]];
    setTempSelected(newSelected);
  };

  const moveCardDown = (index: number) => {
    if (index === tempSelected.length - 1) return;
    const newSelected = [...tempSelected];
    [newSelected[index], newSelected[index + 1]] = [newSelected[index + 1], newSelected[index]];
    setTempSelected(newSelected);
  };

  const handleSave = () => {
    const newCards: DashboardCardConfig[] = tempSelected.map((type, index) => ({
      id: `${index + 1}`,
      type,
      order: index,
    }));
    onSave(newCards);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSelected(selectedCards.map((c) => c.type));
    setIsOpen(false);
  };

  const handleOpen = () => {
    setTempSelected(selectedCards.map((c) => c.type));
    setIsOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className="gap-2 col-span-2 sm:col-span-1 sm:w-auto justify-center"
        size="default"
      >
        <Settings className="w-4 h-4\" />
        <span>{t('cards.customize')}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancel}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 sm:inset-4 z-50 flex items-end sm:items-center justify-center"
            >
              <div
                className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {t('cards.customizeTitle')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {t('cards.customizeSubtitle')} ({tempSelected.length}/4)
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0 ml-2"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Cards Selecionados - Ordenáveis */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        {t('cards.selectedCards')} ({tempSelected.length}/4)
                      </h3>
                      <div className="space-y-2">
                        <Reorder.Group
                          axis="y"
                          values={tempSelected}
                          onReorder={setTempSelected}
                          className="space-y-2"
                        >
                          {tempSelected.map((cardType, index) => {
                            const cardInfo = AVAILABLE_CARDS.find((c) => c.type === cardType);
                            if (!cardInfo) return null;

                            return (
                              <Reorder.Item key={cardType} value={cardType} className="relative">
                                <div className="flex items-center gap-2 p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                  <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 cursor-grab active:cursor-grabbing shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 sm:py-1 rounded shrink-0">
                                        {index + 1}
                                      </span>
                                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                        {t(cardInfo.labelKey)}
                                      </h4>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                      {t(cardInfo.descriptionKey)}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-1 shrink-0">
                                    <button
                                      onClick={() => moveCardUp(index)}
                                      disabled={index === 0}
                                      className={`p-1 rounded ${
                                        index === 0
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : 'text-blue-600 hover:bg-blue-100'
                                      }`}
                                    >
                                      <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                    <button
                                      onClick={() => moveCardDown(index)}
                                      disabled={index === tempSelected.length - 1}
                                      className={`p-1 rounded ${
                                        index === tempSelected.length - 1
                                          ? 'text-gray-300 cursor-not-allowed'
                                          : 'text-blue-600 hover:bg-blue-100'
                                      }`}
                                    >
                                      <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => toggleCard(cardType)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </Reorder.Item>
                            );
                          })}
                        </Reorder.Group>

                        {tempSelected.length === 0 && (
                          <div className="text-center py-6 sm:py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            <p className="text-xs sm:text-sm">{t('cards.noCardsSelected')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cards Disponíveis */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        {t('cards.availableCards')}
                      </h3>
                      <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        {AVAILABLE_CARDS.map((card) => {
                          const isSelected = tempSelected.includes(card.type);
                          const canSelect = tempSelected.length < 4 || isSelected;

                          return (
                            <motion.button
                              key={card.type}
                              onClick={() => canSelect && toggleCard(card.type)}
                              disabled={!canSelect || isSelected}
                              whileHover={canSelect && !isSelected ? { scale: 1.02 } : {}}
                              whileTap={canSelect && !isSelected ? { scale: 0.98 } : {}}
                              className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-blue-200 bg-blue-50/50 opacity-50 cursor-not-allowed'
                                  : canSelect
                                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 bg-white'
                                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                              )}
                              <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 pr-6">
                                {t(card.labelKey)}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {t(card.descriptionKey)}
                              </p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 shrink-0">
                  <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                    {tempSelected.length === 4
                      ? t('cards.dragToReorder')
                      : t('cards.selectMore', { count: 4 - tempSelected.length })}
                  </p>
                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      {t('forms.cancel')}
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={tempSelected.length !== 4}
                      className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none disabled:opacity-50"
                    >
                      {t('forms.save')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
