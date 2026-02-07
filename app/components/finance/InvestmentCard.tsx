'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Investment, RendimentoData } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';

const CDI_ANUAL = 13.65;

interface InvestmentCardProps {
  investment: Investment;
  onDelete: (id: number) => void;
  onEdit: (investment: Investment) => void;
  index: number;
}

export function calcularRendimento(investment: Investment): RendimentoData {
  const taxaCDI = (CDI_ANUAL * investment.percentual_cdi) / 100;
  const rendimentoAnual = (investment.valor_inicial * taxaCDI) / 100;
  const rendimentoDiario = rendimentoAnual / 365;

  const dataInicio = new Date(investment.data_inicio);
  const hoje = new Date();
  const diasDecorridos = Math.floor(
    (hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
  );

  let aliquotaIR = 0.225;
  if (diasDecorridos > 720) aliquotaIR = 0.15;
  else if (diasDecorridos > 360) aliquotaIR = 0.175;
  else if (diasDecorridos > 180) aliquotaIR = 0.2;

  const rendimentoBruto = rendimentoDiario * diasDecorridos;
  const ir = rendimentoBruto * aliquotaIR;
  const rendimentoLiquido = rendimentoBruto - ir;
  const saldoAtual = investment.valor_inicial + rendimentoLiquido;

  return {
    rendimentoDiario: rendimentoDiario,
    rendimentoBruto: rendimentoBruto,
    ir: ir,
    rendimentoLiquido: rendimentoLiquido,
    saldoAtual: saldoAtual,
    diasDecorridos: diasDecorridos,
    aliquotaIR: aliquotaIR * 100,
  };
}

export default function InvestmentCard({
  investment,
  onDelete,
  onEdit,
  index,
}: InvestmentCardProps) {
  const { t, formatCurrency } = useTranslation();
  const dados = calcularRendimento(investment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{investment.nome}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              {dados.diasDecorridos} {t('investments.daysInvested')}
            </span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(investment)}
            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(investment.id)}
            className="text-gray-400 hover:text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 mb-1">{t('investments.investedAmount')}</p>
          <p className="text-lg font-bold text-blue-900">
            {formatCurrency(investment.valor_inicial)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3">
          <p className="text-xs text-emerald-600 mb-1">{t('investments.currentBalance')}</p>
          <p className="text-lg font-bold text-emerald-900">{formatCurrency(dados.saldoAtual)}</p>
        </div>
      </div>

      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t('investments.dailyReturn')}</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(dados.rendimentoDiario)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{t('investments.grossReturn')}</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(dados.rendimentoBruto)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">IR ({dados.aliquotaIR}%)</span>
          <span className="font-semibold text-rose-600">- {formatCurrency(dados.ir)}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
          <span className="text-gray-700 font-medium">{t('investments.netReturn')}</span>
          <span className="font-bold text-emerald-600">
            {formatCurrency(dados.rendimentoLiquido)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <span className="text-gray-600">
          {investment.percentual_cdi}% do CDI (
          {((CDI_ANUAL * investment.percentual_cdi) / 100).toFixed(2)}% a.a.)
        </span>
      </div>
    </motion.div>
  );
}
