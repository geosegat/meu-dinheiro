'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  Wallet,
  PiggyBank,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Rendas', icon: TrendingUp, href: '/rendas' },
  { name: 'Gastos', icon: TrendingDown, href: '/gastos' },
  { name: 'Investimentos', icon: PiggyBank, href: '/investimentos' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

export default function AppLayout({ children, currentPageName }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900">MeuDinheiro</span>
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">MeuDinheiro</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = currentPageName === item.name;
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
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">MeuDinheiro</h1>
              <p className="text-xs text-gray-500">Finanças Pessoais</p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = currentPageName === item.name;
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
                  <span className="font-medium">{item.name}</span>
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
