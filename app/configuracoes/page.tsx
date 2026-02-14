'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Check,
  AlertCircle,
  Cloud,
  CloudOff,
  LogOut,
  Trash2,
  X,
  Download,
  Upload,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/layout/AppLayout';
import { useTranslation } from '@/app/i18n/useTranslation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useAutoSync } from '@/app/components/hooks/useAutoSync';

const localeOptions = [
  { value: 'pt-BR' as const, flag: '🇧🇷', label: 'PT' },
  { value: 'en-US' as const, flag: '🇺🇸', label: 'EN' },
  { value: 'es-ES' as const, flag: '🇪🇸', label: 'ES' },
];

const currencyOptions = [
  { value: 'BRL' as const, symbol: 'R$' },
  { value: 'USD' as const, symbol: '$' },
  { value: 'EUR' as const, symbol: '€' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CloudData = Record<string, any> | null;

function hasLocalData(): boolean {
  const transactions = localStorage.getItem('finance_transactions');
  const investments = localStorage.getItem('finance_investments');
  const parsedT = transactions ? JSON.parse(transactions) : [];
  const parsedI = investments ? JSON.parse(investments) : [];
  return parsedT.length > 0 || parsedI.length > 0;
}

function hasCloudData(data: CloudData): boolean {
  if (!data) return false;
  const t = data.transactions || [];
  const i = data.investments || [];
  return t.length > 0 || i.length > 0;
}

function applyCloudData(data: CloudData) {
  if (!data) return;
  if (data.transactions)
    localStorage.setItem('finance_transactions', JSON.stringify(data.transactions));
  if (data.investments)
    localStorage.setItem('finance_investments', JSON.stringify(data.investments));
  if (data.dashboard_cards)
    localStorage.setItem('dashboard_cards', JSON.stringify(data.dashboard_cards));
  if (data.locale) localStorage.setItem('app_locale', data.locale);
  if (data.currency) localStorage.setItem('app_currency', data.currency);
  if (data.exchange_rates)
    localStorage.setItem('exchange_rates', JSON.stringify(data.exchange_rates));
}

export default function ConfiguracoesPage() {
  const { t, locale, setLocale, currency, setCurrency, exchangeRates, refreshRates, ratesLoading } =
    useTranslation();
  const { data: session } = useSession();
  const { isSyncing, lastSyncTime, upload, download, error: syncError } = useAutoSync();
  const [loadingFromCloud, setLoadingFromCloud] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingCloudData, setPendingCloudData] = useState<CloudData>(null);
  const [conflictInfo, setConflictInfo] = useState({
    localTransactions: 0,
    localInvestments: 0,
    cloudTransactions: 0,
    cloudInvestments: 0,
  });
  const hasCheckedCloud = useRef(false);

  const handleSignOut = async () => {
    localStorage.removeItem('cloud_loaded');
    hasCheckedCloud.current = false;
    await signOut();
  };

  const handleConflictChoice = (choice: 'cloud' | 'local') => {
    if (choice === 'cloud') {
      applyCloudData(pendingCloudData);
    } else {
      upload();
    }

    localStorage.setItem('cloud_loaded', 'true');
    setPendingCloudData(null);
    setShowConflictModal(false);
  };

  const handleClearData = () => {
    localStorage.removeItem('finance_transactions');
    localStorage.removeItem('finance_investments');
    localStorage.removeItem('dashboard_cards');
    localStorage.removeItem('exchange_rates');
    localStorage.removeItem('cloud_loaded');

    upload();

    setShowDeleteModal(false);
    setDeleteConfirmText('');
    window.location.reload();
  };

  useEffect(() => {
    if (session?.user?.email && !hasCheckedCloud.current && !localStorage.getItem('cloud_loaded')) {
      hasCheckedCloud.current = true;
      const loadFromCloud = async () => {
        try {
          setLoadingFromCloud(true);

          const response = await fetch('/api/sync');

          if (response.ok) {
            const { data } = await response.json();

            const localHasData = hasLocalData();
            const cloudHasData = hasCloudData(data);

            if (localHasData && cloudHasData) {
              const localT = JSON.parse(localStorage.getItem('finance_transactions') || '[]');
              const localI = JSON.parse(localStorage.getItem('finance_investments') || '[]');
              setPendingCloudData(data);
              setConflictInfo({
                localTransactions: localT.length,
                localInvestments: localI.length,
                cloudTransactions: (data.transactions || []).length,
                cloudInvestments: (data.investments || []).length,
              });
              setShowConflictModal(true);
              return;
            } else if (cloudHasData) {
              applyCloudData(data);
            } else if (localHasData) {
              upload();
            }
          }

          localStorage.setItem('cloud_loaded', 'true');
        } catch (error) {
          console.error('Erro ao carregar dados da nuvem:', error);
          hasCheckedCloud.current = false;
        } finally {
          setLoadingFromCloud(false);
        }
      };

      loadFromCloud();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="text-gray-500 mt-1">{t('settings.subtitle')}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
          >
            <div className="flex items-start gap-3 mb-4">
              {session ? (
                <Cloud className="w-6 h-6 text-blue-600 mt-0.5" />
              ) : (
                <CloudOff className="w-6 h-6 text-gray-400 mt-0.5" />
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {session ? t('settings.cloudSync') : t('settings.connectGoogle')}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {session ? t('settings.cloudSyncDesc') : t('settings.connectGoogleDesc')}
                </p>
              </div>
            </div>

            {!session ? (
              <Button
                onClick={() => signIn('google')}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('settings.connectGoogle')}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{session.user?.name}</p>
                    <p className="text-sm text-gray-600 truncate">{session.user?.email}</p>
                  </div>
                  <Button
                    onClick={() => handleSignOut()}
                    variant="outline"
                    size="sm"
                    className="gap-2 shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('settings.signOut')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {t('settings.syncing')}
                          </p>
                          <p className="text-xs text-gray-500">{t('settings.savingData')}</p>
                        </div>
                      </>
                    ) : syncError ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {t('settings.syncError')}
                          </p>
                          <p className="text-xs text-gray-500">{syncError}</p>
                        </div>
                      </>
                    ) : lastSyncTime ? (
                      <>
                        <Check className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {t('settings.synced')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t('settings.lastSync')}:{' '}
                            {new Date(lastSyncTime).toLocaleTimeString(locale)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {t('settings.waitingChanges')}
                          </p>
                          <p className="text-xs text-gray-500">{t('settings.autoSyncActive')}</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => download()}
                      disabled={isSyncing}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Download className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      {t('settings.download')}
                    </Button>
                    <Button
                      onClick={() => upload()}
                      disabled={isSyncing}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Upload className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      {t('settings.upload')}
                    </Button>
                  </div>
                </div>

                {loadingFromCloud && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                    <p className="text-sm text-blue-700">{t('settings.loadingCloud')}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t('settings.preferences')}</h2>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t('settings.language')}</span>
                <div className="flex gap-2">
                  {localeOptions.map((loc) => (
                    <button
                      key={loc.value}
                      onClick={() => setLocale(loc.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        locale === loc.value
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-base">{loc.flag}</span>
                      <span>{loc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{t('settings.currency')}</span>
                <div className="flex gap-2">
                  {currencyOptions.map((curr) => (
                    <button
                      key={curr.value}
                      onClick={() => setCurrency(curr.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currency === curr.value
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-base font-bold">{curr.symbol}</span>
                      <span>{curr.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {exchangeRates && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {t('settings.ratesUpdated')}:{' '}
                      {new Date(exchangeRates.fetchedAt).toLocaleString(locale)}
                    </p>
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
                </>
              )}
            </div>
          </motion.div>

          {/* Zona de Perigo - Limpar dados */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('settings.clearData')}</h2>
                <p className="text-sm text-gray-500 mt-1">{t('settings.clearDataDesc')}</p>
              </div>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                {t('settings.clearAll')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal de conflito de sincronização */}
      <AnimatePresence>
        {showConflictModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t('settings.conflictTitle')}</h3>
                  <p className="text-sm text-gray-500">{t('settings.conflictDesc')}</p>
                </div>
              </div>

              {/* Comparação visual */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">
                      {t('settings.cloudData')}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    {conflictInfo.cloudTransactions} {t('settings.conflictTransactions')}
                  </p>
                  <p className="text-xs text-blue-700">
                    {conflictInfo.cloudInvestments} {t('settings.conflictInvestments')}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">
                      {t('settings.localData')}
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    {conflictInfo.localTransactions} {t('settings.conflictTransactions')}
                  </p>
                  <p className="text-xs text-green-700">
                    {conflictInfo.localInvestments} {t('settings.conflictInvestments')}
                  </p>
                </div>
              </div>

              {/* Opções */}
              <div className="space-y-3">
                <button
                  onClick={() => handleConflictChoice('cloud')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100 transition-colors text-left"
                >
                  <Download className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t('settings.useCloudData')}
                    </p>
                    <p className="text-xs text-gray-500">{t('settings.useCloudDataDesc')}</p>
                  </div>
                </button>

                <button
                  onClick={() => handleConflictChoice('local')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-green-200 bg-green-50/50 hover:bg-green-100 transition-colors text-left"
                >
                  <Upload className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t('settings.useLocalData')}
                    </p>
                    <p className="text-xs text-gray-500">{t('settings.useLocalDataDesc')}</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmação de limpeza */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('settings.clearConfirmTitle')}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">{t('settings.clearConfirmDesc')}</p>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {t('settings.clearConfirmType')}{' '}
                  <span className="font-bold text-red-600">{t('settings.clearConfirmWord')}</span>{' '}
                  {t('settings.clearConfirmToConfirm')}:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={t('settings.clearConfirmWord')}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {t('forms.cancel')}
                </Button>
                <Button
                  onClick={handleClearData}
                  disabled={deleteConfirmText !== t('settings.clearConfirmWord')}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('settings.clearConfirmBtn')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
