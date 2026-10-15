import type { ItemLoteConciliacao, LoteConciliacao, MarcaConciliacao } from '../../tipos';
import { calcularTotais } from './parserConciliacao';
import { marcaDaLinha, type LinhaRelatorio } from './relatorioConciliacao';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function mesDeDataBr(data: string) {
  const partes = String(data || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!partes) return '';
  const mes = partes[2].padStart(2, '0');
  return `${partes[3]}-${mes}`;
}

export function mesDoLote(lote: Pick<LoteConciliacao, 'dataNf' | 'dataCeasa' | 'arquivadoEm' | 'mes'>) {
  return lote.mes || mesDeDataBr(lote.dataNf) || mesDeDataBr(lote.dataCeasa) || mesDeIso(lote.arquivadoEm);
}

function mesDeIso(iso: string) {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) {
    const agora = new Date();
    return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  }
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

export function rotuloMes(mes: string) {
  const [ano, numero] = mes.split('-');
  const nome = MESES[Number(numero) - 1];
  return nome ? `${nome} de ${ano}` : mes;
}

export function unirLotesConciliacao(...listas: Array<LoteConciliacao[] | undefined>) {
  const porId = new Map<string, LoteConciliacao>();
  listas.forEach(lista => {
    (lista || []).forEach(lote => {
      if (!lote?.id) return;
      const atual = porId.get(lote.id);
      const candidato = normalizarLote(lote);
      if (!atual) {
        porId.set(lote.id, candidato);
        return;
      }
      const maisNovo = Date.parse(candidato.arquivadoEm) >= Date.parse(atual.arquivadoEm);
      const maisItens = (candidato.linhas || []).length > (atual.linhas || []).length;
      if (maisNovo || maisItens) porId.set(lote.id, candidato);
    });
  });
  return Array.from(porId.values()).sort((a, b) => Date.parse(b.arquivadoEm) - Date.parse(a.arquivadoEm));
}

export function normalizarLote(lote: LoteConciliacao): LoteConciliacao {
  const linhas = Array.isArray(lote.linhas) ? lote.linhas : [];
  return {
    ...lote,
    empresa: lote.empresa || '',
    numeroNf: lote.numeroNf || '',
    dataNf: lote.dataNf || '',
    dataCeasa: lote.dataCeasa || '',
    origem: lote.origem || 'tabela2',
    linhas,
    mes: mesDoLote(lote)
  };
}

export function lotesDoMes(lotes: LoteConciliacao[], mes: string) {
  return unirLotesConciliacao(lotes).filter(lote => mesDoLote(lote) === mes);
}

export function mesesComLote(lotes: LoteConciliacao[]) {
  const vistos = new Set<string>();
  unirLotesConciliacao(lotes).forEach(lote => vistos.add(mesDoLote(lote)));
  return Array.from(vistos).sort((a, b) => b.localeCompare(a));
}

export function mesAnterior(mes: string) {
  const [ano, numero] = mes.split('-').map(Number);
  if (!ano || !numero || numero < 1 || numero > 12) return '';
  const data = new Date(ano, numero - 2, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
}

export function resumoMensalConciliacao(lotes: LoteConciliacao[], mes: string) {
  const doMes = lotesDoMes(lotes, mes);
  const totalNf = doMes.reduce((total, lote) => total + (Number(lote.totalNf) || 0), 0);
  const totalCeasa = doMes.reduce((total, lote) => total + (Number(lote.totalCeasa) || 0), 0);
  const margemValor = doMes.reduce((total, lote) => total + (Number(lote.margemValor) || 0), 0);
  const totalProdutos = doMes.reduce((total, lote) => total + (lote.linhas || []).length, 0);
  const anterior = lotesDoMes(lotes, mesAnterior(mes)).reduce(
    (total, lote) => total + (Number(lote.totalNf) || 0),
    0
  );

  return {
    lotes: doMes,
    totalNf,
    totalCeasa,
    margemValor,
    totalProdutos,
    mediaProdutosPorNf: doMes.length > 0 ? totalProdutos / doMes.length : 0,
    mediaTotalPorNf: doMes.length > 0 ? totalNf / doMes.length : 0,
    margemPct: totalCeasa > 0 ? (margemValor / totalCeasa) * 100 : null,
    variacaoComprasPct: anterior > 0 ? ((totalNf - anterior) / anterior) * 100 : null,
    totalMesAnterior: anterior
  };
}

export function produtosVendidosNoMes(lotes: LoteConciliacao[]) {
  const produtos = new Map<string, {
    empresa: string;
    produto: string;
    unidade: string;
    quantidade: number;
    notas: Set<string>;
  }>();

  lotes.forEach(lote => {
    (lote.linhas || []).forEach(linha => {
      const empresa = lote.empresa.trim() || 'Empresa não informada';
      const produto = linha.produto.trim() || 'Produto não informado';
      const unidade = linha.unidade.trim() || 'UN';
      const chave = [empresa, produto, unidade]
        .map(valor => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase())
        .join('|');
      const atual = produtos.get(chave) || {
        empresa,
        produto,
        unidade,
        quantidade: 0,
        notas: new Set<string>()
      };
      atual.quantidade += Number(linha.quantidade) || 0;
      atual.notas.add(lote.id);
      produtos.set(chave, atual);
    });
  });

  return Array.from(produtos.values())
    .map(({ notas, ...produto }) => ({ ...produto, notas: notas.size }))
    .sort((a, b) => a.empresa.localeCompare(b.empresa, 'pt-BR') || a.produto.localeCompare(b.produto, 'pt-BR'));
}

export function montarLoteConciliacao(p: {
  id?: string;
  empresa: string;
  numeroNf: string;
  dataNf: string;
  dataCeasa: string;
  origem: string;
  linhas: Array<LinhaRelatorio & { unidade?: string; marca?: MarcaConciliacao; justificativa?: string }>;
}): LoteConciliacao {
  const totais = calcularTotais(p.linhas);
  const agora = new Date().toISOString();
  const linhas: ItemLoteConciliacao[] = p.linhas.map(linha => ({
    produto: linha.produto || '',
    quantidade: linha.quantidade,
    unidade: linha.unidade || 'KG',
    precoNf: linha.precoNf,
    precoCeasa: linha.precoCeasa,
    semPreco: linha.semPreco,
    detalhe: linha.detalhe || '',
    marca: marcaDaLinha(linha),
    justificativa: linha.justificativa || ''
  }));
  return normalizarLote({
    id: p.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `lote_${Date.now()}`),
    arquivadoEm: agora,
    mes: mesDeDataBr(p.dataNf) || mesDeDataBr(p.dataCeasa) || mesDeIso(agora),
    empresa: p.empresa,
    numeroNf: p.numeroNf,
    dataNf: p.dataNf,
    dataCeasa: p.dataCeasa,
    origem: p.origem,
    totalNf: totais.totalNf,
    totalCeasa: totais.totalCeasa,
    margemValor: totais.margemValor,
    margemPct: totais.margemPct,
    linhas
  });
}
