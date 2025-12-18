'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: 'green' | 'red' | 'blue' | 'purple';
  delay?: number;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color,
  delay = 0,
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    green: 'bg-linear-to-br from-emerald-500 to-teal-600',
    red: 'bg-linear-to-br from-rose-500 to-red-600',
    blue: 'bg-linear-to-br from-blue-500 to-indigo-600',
    purple: 'bg-linear-to-br from-violet-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div
        className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${colorClasses[color]} opacity-10`}
      />
    </motion.div>
  );
}
