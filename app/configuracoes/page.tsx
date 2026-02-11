'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Upload,
  Globe,
  DollarSign,
  RefreshCw,
  Check,
  AlertCircle,
  FileJson,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/layout/AppLayout';
import { useTranslation } from '@/app/i18n/useTranslation';

export default function ConfiguracoesPage() {
  const { t, locale, setLocale, currency, setCurrency, exchangeRates, refreshRates, ratesLoading } = useTranslation();
  const [backupStatus, setBackupStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExportData = () => {
    try {
      const data = {
        transactions: localStorage.getItem('finance_transactions'),
        investments: localStorage.getItem('finance_investments'),
        dashboardCards: localStorage.getItem('dashboard_cards'),
        locale: localStorage.getItem('app_locale'),
        currency: localStorage.getItem('app_currency'),
        exchangeRates: localStorage.getItem('exchange_rates'),
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `meu-dinheiro-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBackupStatus('success');
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      setBackupStatus('error');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Valida se é um backup válido
        if (!data.version || !data.exportDate) {
          throw new Error('Arquivo de backup inválido');
        }

        // Restaura os dados no localStorage
        if (data.transactions) localStorage.setItem('finance_transactions', data.transactions);
        if (data.investments) localStorage.setItem('finance_investments', data.investments);
        if (data.dashboardCards) localStorage.setItem('dashboard_cards', data.dashboardCards);
        if (data.locale) localStorage.setItem('app_locale', data.locale);
        if (data.currency) localStorage.setItem('app_currency', data.currency);
        if (data.exchangeRates) localStorage.setItem('exchange_rates', data.exchangeRates);

        setRestoreStatus('success');
        setTimeout(() => {
          setRestoreStatus('idle');
          // Recarrega a página para aplicar as mudanças
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        setRestoreStatus('error');
        setTimeout(() => setRestoreStatus('idle'), 3000);
      }
    };

    reader.readAsText(file);
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  const locales = [
    { value: 'pt-BR', label: 'Português (BR)' },
    { value: 'en-US', label: 'English (US)' },
  ];

  const currencies = [
    { value: 'BRL', label: 'Real (R$)' },
    { value: 'USD', label: 'Dólar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="text-gray-500 mt-1">{t('settings.subtitle')}</p>
          </motion.div>

          {/* Idioma e Moeda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t('settings.preferences')}</h2>
            
            <div className="space-y-6">
              {/* Idioma */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Globe className="w-4 h-4" />
                  {t('settings.language')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {locales.map((loc) => (
                    <button
                      key={loc.value}
                      onClick={() => setLocale(loc.value as 'pt-BR' | 'en-US')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        locale === loc.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{loc.label}</span>
                        {locale === loc.value && <Check className="w-5 h-5 text-blue-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Moeda */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <DollarSign className="w-4 h-4" />
                  {t('settings.currency')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {currencies.map((curr) => (
                    <button
                      key={curr.value}
                      onClick={() => setCurrency(curr.value as 'BRL' | 'USD' | 'EUR')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        currency === curr.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium text-gray-900">{curr.label}</span>
                        {currency === curr.value && <Check className="w-4 h-4 text-blue-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Taxas de Câmbio */}
              {exchangeRates && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        {t('settings.ratesUpdated')}: {new Date(exchangeRates.fetchedAt).toLocaleString(locale)}
                      </p>
                    </div>
                    <Button
                      onClick={refreshRates}
                      disabled={ratesLoading}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${ratesLoading ? 'animate-spin' : ''}`} />
                      {t('settings.refreshRates')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Backup e Restauração */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-6">
              <FileJson className="w-6 h-6 text-gray-700 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('settings.backupTitle')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.backupDescription')}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Exportar Dados */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('settings.exportData')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('settings.exportDescription')}
                    </p>
                  </div>
                  <Button
                    onClick={handleExportData}
                    className="bg-blue-600 hover:bg-blue-700 gap-2 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    {t('settings.export')}
                  </Button>
                </div>
                {backupStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 text-sm text-green-700"
                  >
                    <Check className="w-4 h-4" />
                    {t('settings.exportSuccess')}
                  </motion.div>
                )}
                {backupStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 text-sm text-red-700"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {t('settings.exportError')}
                  </motion.div>
                )}
              </div>

              {/* Importar Dados */}
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('settings.importData')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t('settings.importDescription')}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                      id="import-file"
                    />
                    <Button
                      onClick={() => document.getElementById('import-file')?.click()}
                      className="bg-orange-600 hover:bg-orange-700 gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {t('settings.import')}
                    </Button>
                  </div>
                </div>
                {restoreStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 text-sm text-green-700"
                  >
                    <Check className="w-4 h-4" />
                    {t('settings.importSuccess')}
                  </motion.div>
                )}
                {restoreStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 text-sm text-red-700"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {t('settings.importError')}
                  </motion.div>
                )}
              </div>

              {/* Aviso */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  {t('settings.backupWarning')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
