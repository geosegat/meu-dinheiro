// Core data types for finance application

export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  date: string; // ISO 8601 format
}

export interface Investment {
  id: number;
  nome: string;
  valor_inicial: number;
  percentual_cdi: number;
  data_inicio: string; // ISO 8601 date
}

export interface RendimentoData {
  rendimentoDiario: number;
  rendimentoBruto: number;
  ir: number;
  rendimentoLiquido: number;
  saldoAtual: number;
  diasDecorridos: number;
  aliquotaIR: number;
}

export interface Template {
  name: string;
  icon: string;
  color: string;
}

export type PeriodFilter = 'month' | '3months' | '6months' | 'year' | 'all';
