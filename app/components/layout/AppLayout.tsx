'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  PiggyBank,
  Settings,
  Tags,
} from 'lucide-react';
import { useTranslation } from '@/app/i18n/useTranslation';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/' },
  { key: 'income', icon: TrendingUp, href: '/rendas' },
  { key: 'expenses', icon: TrendingDown, href: '/gastos' },
  { key: 'investments', icon: PiggyBank, href: '/investimentos' },
  { key: 'categories', icon: Tags, href: '/categorias' },
  { key: 'settings', icon: Settings, href: '/configuracoes' },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Image src="/images/logo3.png" alt="MeuDinheiro" width={56} height={56} />
          <span className="font-bold" style={{ color: '#1B5E20' }}>
            MeuDinheiro
          </span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center">
                  <Image src="/images/logo3.png" alt="MeuDinheiro" width={40} height={40} />
                  <span className="font-bold" style={{ color: '#1B5E20' }}>
                    MeuDinheiro
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <nav className="p-4 space-y-2 flex-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{t(`nav.${item.key}`)}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 z-30 flex-col">
        <div className="p-6 flex-1">
          <div className="flex items-center mb-8">
            <Image src="/images/logo3.png" alt="MeuDinheiro" width={56} height={56} />

            <div>
              <h1 className="font-bold" style={{ color: '#1B5E20' }}>
                MeuDinheiro
              </h1>
              <p className="text-xs text-gray-500">{t('nav.personalFinance')}</p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{t(`nav.${item.key}`)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="lg:pl-64 pt-16 lg:pt-0">{children}</div>
    </div>
  );
}
