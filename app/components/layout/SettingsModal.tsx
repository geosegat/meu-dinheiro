'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/app/i18n/useTranslation';
import { Currency, CURRENCY_CONFIG } from '@/app/i18n/currency';
import { Locale } from '@/app/i18n/index';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LANGUAGES: { code: Locale; flag: string; label: string }[] = [
  { code: 'pt-BR', flag: '🇧🇷', label: 'Português' },
  { code: 'en-US', flag: '🇺🇸', label: 'English' },
];

const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: 'BRL', symbol: 'R$' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
];

export default function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const {
    t,
    locale,
    setLocale,
    currency,
    setCurrency,
    exchangeRates,
    ratesLoading,
    ratesError,
    refreshRates,
    formatDate,
  } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">{t('settings.language')}</p>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    locale === lang.code
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium text-gray-900">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">{t('settings.currency')}</p>
            <div className="grid grid-cols-4 gap-3">
              {CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  onClick={() => setCurrency(cur.code)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                    currency === cur.code
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-xl font-bold text-gray-900">{cur.symbol}</span>
                  <span className="text-xs font-medium text-gray-500">{cur.code}</span>
                </button>
              ))}
            </div>
          </div>

          {currency !== 'BRL' && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              {ratesLoading ? (
                <p className="text-sm text-gray-500">{t('settings.loading')}</p>
              ) : ratesError ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-rose-600">{t('settings.ratesError')}</p>
                  <Button variant="ghost" size="sm" onClick={refreshRates}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              ) : exchangeRates ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {t('settings.ratesUpdated')} {formatDate(exchangeRates.date)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      1 BRL = {exchangeRates.rates[currency]?.toFixed(4)} {currency}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={refreshRates} disabled={ratesLoading}>
                    <RefreshCw className={`w-4 h-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
