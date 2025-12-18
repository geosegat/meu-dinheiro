'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, DollarSign, PiggyBank, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../components/hooks/useLocalStorage';
import InvestmentCard, { calcularRendimento } from '../components/finance/InvestmentCard';
import InvestmentForm from '../components/forms/InvestmentForm';
import AppLayout from '../components/layout/AppLayout';
import { Investment } from '@/types/finance';

export default function InvestimentosPage() {
  const [investments, setInvestments] = useLocalStorage<Investment[]>('finance_investments', []);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const handleAddOrUpdate = (investment: Investment) => {
    if (editingInvestment) {
      setInvestments(investments.map((inv) => (inv.id === investment.id ? investment : inv)));
    } else {
      setInvestments([...investments, investment]);
    }
    setEditingInvestment(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Deseja realmente excluir este investimento?')) {
      setInvestments(investments.filter((inv) => inv.id !== id));
    }
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const totalInvestido = investments.reduce((sum, inv) => sum + inv.valor_inicial, 0);
  const totalRendimentoLiquido = investments.reduce((sum, inv) => {
    const dados = calcularRendimento(inv);
    return sum + dados.rendimentoLiquido;
  }, 0);
  const totalSaldo = totalInvestido + totalRendimentoLiquido;
  const rendimentoDiarioTotal = investments.reduce((sum, inv) => {
    const dados = calcularRendimento(inv);
    return sum + dados.rendimentoDiario;
  }, 0);

  return (
    <AppLayout currentPageName="Investimentos">
      <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
              <p className="text-gray-500 mt-1">Acompanhe seus rendimentos</p>
            </div>
            <Button
              onClick={() => {
                setEditingInvestment(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Investimento
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Como funciona o cálculo?</p>
              <p className="text-blue-700">
                O rendimento é calculado com base no CDI atual (~13.65% a.a.) multiplicado pelo
                percentual do seu investimento. O IR é descontado automaticamente seguindo a tabela
                regressiva: 22.5% (até 180 dias), 20% (181-360), 17.5% (361-720) e 15% (acima de 720
                dias).
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="w-5 h-5" />
                <span className="text-sm opacity-90">Total Investido</span>
              </div>
              <p className="text-3xl font-bold">
                R${' '}
                {totalInvestido.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-600/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm opacity-90">Rendimento Líquido</span>
              </div>
              <p className="text-3xl font-bold">
                R${' '}
                {totalRendimentoLiquido.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-linear-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-violet-600/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm opacity-90">Saldo Total</span>
              </div>
              <p className="text-3xl font-bold">
                R${' '}
                {totalSaldo.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-600/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm opacity-90">Rendimento/Dia</span>
              </div>
              <p className="text-3xl font-bold">
                R${' '}
                {rendimentoDiarioTotal.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs opacity-75 mt-1">
                ~R${' '}
                {(rendimentoDiarioTotal * 30).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                /mês
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {investments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <PiggyBank className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum investimento cadastrado
                </h3>
                <p className="text-gray-500 mb-6">
                  Adicione seus investimentos para acompanhar os rendimentos
                </p>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Investimento
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {investments.map((investment, index) => (
                    <InvestmentCard
                      key={investment.id}
                      investment={investment}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        <InvestmentForm
          editingInvestment={editingInvestment}
          onSubmit={handleAddOrUpdate}
          open={showForm}
          onOpenChange={(open) => {
            setShowForm(open);
            if (!open) setEditingInvestment(null);
          }}
        />
      </div>
    </AppLayout>
  );
}
