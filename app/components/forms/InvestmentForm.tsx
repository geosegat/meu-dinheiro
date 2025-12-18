'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp } from 'lucide-react';
import { Investment } from '@/types/finance';

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
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    valor_inicial: '',
    percentual_cdi: '100',
    data_inicio: new Date().toISOString().split('T')[0],
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
      data_inicio: new Date().toISOString().split('T')[0],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div>
            <Label htmlFor="nome" className="text-sm font-medium text-gray-700 mb-2">
              Nome do Investimento
            </Label>
            <Input
              id="nome"
              type="text"
              placeholder="Ex: Tesouro Selic, CDB Banco X"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="valor" className="text-sm font-medium text-gray-700 mb-2">
              Valor Investido (R$)
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.valor_inicial}
              onChange={(e) => setFormData({ ...formData, valor_inicial: e.target.value })}
              className="mt-1 text-lg font-semibold"
            />
          </div>

          <div>
            <Label htmlFor="percentual" className="text-sm font-medium text-gray-700 mb-2">
              Percentual do CDI (%)
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
            <p className="text-xs text-gray-500 mt-1">Ex: 100% do CDI, 102% do CDI, 110% do CDI</p>
          </div>

          <div>
            <Label htmlFor="data" className="text-sm font-medium text-gray-700 mb-2">
              Data de Início
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
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.nome || !formData.valor_inicial}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {editingInvestment ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
