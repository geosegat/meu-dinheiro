'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
      border: 'border-l-4 border-emerald-500',
      text: 'text-emerald-800',
    },
    error: {
      icon: <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
      border: 'border-l-4 border-rose-500',
      text: 'text-rose-800',
    },
    info: {
      icon: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
      border: 'border-l-4 border-blue-500',
      text: 'text-blue-800',
    },
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 64, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.94 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-start gap-3 bg-white ${config.border} rounded-xl shadow-lg px-4 py-3 min-w-[220px] max-w-[300px]`}
    >
      {config.icon}
      <p className={`text-sm font-medium flex-1 leading-snug ${config.text}`}>{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-300 hover:text-gray-500 shrink-0 mt-0.5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
