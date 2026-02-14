'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp } from 'lucide-react';
import { Investment } from '@/types/finance';
import { useTranslation } from '@/app/i18n/useTranslation';

interface InvestmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (investment: Investment) => void;
  editingInvestment?: Investment | null;
}

interface FormData {
  nome: string;
  valor_inicial: string;
  percentual_cdi: string;
  data_inicio: string;
}

export default function InvestmentForm({
  open,
  onOpenChange,
  onSubmit,
  editingInvestment,
}: InvestmentFormProps) {
  const { t, locale } = useTranslation();

  // Get current date in local timezone
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    valor_inicial: '',
    percentual_cdi: '100',
    data_inicio: getCurrentDate(),
  });

  useEffect(() => {
    if (editingInvestment) {
      setFormData({
        nome: editingInvestment.nome,
        valor_inicial: editingInvestment.valor_inicial.toString(),
        percentual_cdi: editingInvestment.percentual_cdi.toString(),
        data_inicio: editingInvestment.data_inicio,
      });
    }
  }, [editingInvestment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.valor_inicial || !formData.percentual_cdi) return;

    const investment: Investment = {
      // eslint-disable-next-line react-hooks/purity
      id: editingInvestment?.id || Date.now(),
      nome: formData.nome,
      valor_inicial: parseFloat(formData.valor_inicial),
      percentual_cdi: parseFloat(formData.percentual_cdi),
      data_inicio: formData.data_inicio,
    };

    onSubmit(investment);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      valor_inicial: '',
      percentual_cdi: '100',
      data_inicio: getCurrentDate(),
    });
    onOpenChange(false);
  };

  const decimalSep = locale === 'pt-BR' ? ',' : '.';
  const thousandsSep = locale === 'pt-BR' ? '.' : ',';

  const handleValueChange = (value: string) => {
    // Remove thousands separators, keep only digits and decimal separator
    let raw = value
      .replace(new RegExp(`\\${thousandsSep}`, 'g'), '')
      .replace(new RegExp(`[^\\d${decimalSep === ',' ? ',' : '.'}]`, 'g'), '');
    // Only allow one decimal separator
    const sepIndex = raw.indexOf(decimalSep);
    if (sepIndex !== -1) {
      raw =
        raw.slice(0, sepIndex + 1) +
        raw.slice(sepIndex + 1).replace(new RegExp(`\\${decimalSep}`, 'g'), '');
    }
    // Limit decimal to 2 places
    const parts = raw.split(decimalSep);
    if (parts[1] && parts[1].length > 2) return;
    // Store with dot for parseFloat compatibility
    setFormData({ ...formData, valor_inicial: raw.replace(decimalSep, '.') });
  };

  const formatDisplayAmount = (value: string) => {
    if (!value) return '';
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
    return parts.join(decimalSep);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {editingInvestment ? t('investments.editInvestment') : t('investments.newInvestment')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div>
            <Label htmlFor="nome" className="text-sm font-medium text-gray-700 mb-2">
              {t('forms.investmentName')}
            </Label>
            <Input
              id="nome"
              type="text"
              placeholder={t('forms.investmentNamePlaceholder')}
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="valor" className="text-sm font-medium text-gray-700 mb-2">
              {t('forms.investedValue')}
            </Label>
            <Input
              id="valor"
              type="text"
              inputMode="numeric"
              placeholder={locale === 'pt-BR' ? '0,00' : '0.00'}
              value={formatDisplayAmount(formData.valor_inicial)}
              onChange={(e) => handleValueChange(e.target.value)}
              className="mt-1 text-lg font-semibold"
            />
          </div>

          <div>
            <Label htmlFor="percentual" className="text-sm font-medium text-gray-700 mb-2">
              {t('forms.cdiPercentage')}
            </Label>
            <Input
              id="percentual"
              type="number"
              step="0.01"
              placeholder="100"
              value={formData.percentual_cdi}
              onChange={(e) => setFormData({ ...formData, percentual_cdi: e.target.value })}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">{t('forms.cdiExample')}</p>
          </div>

          <div>
            <Label htmlFor="data" className="text-sm font-medium text-gray-700 mb-2">
              {t('forms.startDate')}
            </Label>
            <Input
              id="data"
              type="date"
              value={formData.data_inicio}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              {t('forms.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!formData.nome || !formData.valor_inicial}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {editingInvestment ? t('forms.update') : t('forms.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
