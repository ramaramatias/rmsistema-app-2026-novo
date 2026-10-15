import type { MovimentoCaixaOperacional, NaturezaMovimentoCaixa } from '../../tipos';
import { SALDO_INICIAL_CAIXA_OPERACIONAL } from '../../tipos';

export const ROTULO_NATUREZA: Record<NaturezaMovimentoCaixa, string> = {
  aporte: 'Aporte',
  reposicao: 'Reposição',
  compra: 'Compra',
  emprestimo: 'Empréstimo',
  debito: 'Débito'
};

export const tipoDaNatureza = (natureza: NaturezaMovimentoCaixa) =>
  natureza === 'aporte' || natureza === 'reposicao' ? 'entrada' : 'saida';

export const formatarMoedaCaixa = (valor: number) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatarDataHoraCaixa = (iso: string) => {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso || '-';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export type LinhaHistoricoCaixa = MovimentoCaixaOperacional & { saldoResultante: number };

export const historicoComSaldo = (movimentos: MovimentoCaixaOperacional[]): LinhaHistoricoCaixa[] => {
  const cronologico = [...movimentos].sort((a, b) => String(a.criadoEm).localeCompare(String(b.criadoEm)) || String(a.id).localeCompare(String(b.id)));
  let saldo = SALDO_INICIAL_CAIXA_OPERACIONAL;
  const comSaldo = cronologico.map(item => {
    saldo += item.tipo === 'entrada' ? Number(item.valor || 0) : -Number(item.valor || 0);
    return { ...item, saldoResultante: saldo };
  });
  return comSaldo.reverse();
};

export const saldoAtualCaixa = (movimentos: MovimentoCaixaOperacional[]) => {
  const linhas = historicoComSaldo(movimentos);
  return linhas[0]?.saldoResultante ?? SALDO_INICIAL_CAIXA_OPERACIONAL;
};
