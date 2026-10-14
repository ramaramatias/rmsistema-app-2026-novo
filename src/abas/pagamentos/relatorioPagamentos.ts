import type { ItemPagamento, LotePagamentoHistorico, PagamentosState } from '../../tipos';
import { parseDataDeletada } from '../../util/mesclar';

export type TipoPagamentoRelatorio = 'caixa' | 'cheque' | 'caben';

export type FiltroRelatorioPagamentos = {
  busca: string;
  inicio: string;
  fim: string;
  tipo?: TipoPagamentoRelatorio | 'todos';
};

export type LinhaRelatorioPagamento = {
  id: string;
  nome: string;
  valor: number;
  tipo: TipoPagamentoRelatorio;
  data: string;
  dataIso: string;
  origem: 'lote' | 'aberto';
  loteId?: string;
  loteData?: string;
};

export type GrupoNomePagamento = {
  nome: string;
  chave: string;
  linhas: LinhaRelatorioPagamento[];
  total: number;
  quantidade: number;
};

export type RelatorioPagamentos = {
  grupos: GrupoNomePagamento[];
  lotes: LotePagamentoHistorico[];
  total: number;
  quantidade: number;
};

const TIPOS: TipoPagamentoRelatorio[] = ['caixa', 'cheque', 'caben'];

export const ROTULO_TIPO_PAGAMENTO: Record<TipoPagamentoRelatorio, string> = {
  caixa: 'Caixa',
  cheque: 'Cheque',
  caben: 'CABEN'
};

export const normalizarNomePagamento = (texto: string) =>
  String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const mesChaveDeData = (data: Date) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

export const mesAtualChave = (agora = new Date()) => mesChaveDeData(agora);

export const rotuloMesChave = (chave: string) => {
  const [ano, mes] = chave.split('-');
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  const nome = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
};

export const intervaloDoMes = (chave: string) => {
  const [ano, mes] = chave.split('-').map(Number);
  const ultimo = new Date(ano, mes, 0).getDate();
  return {
    inicio: `${chave}-01`,
    fim: `${chave}-${String(ultimo).padStart(2, '0')}`
  };
};

export const dataIsoDeDate = (data: Date) => {
  const y = data.getFullYear();
  const m = String(data.getMonth() + 1).padStart(2, '0');
  const d = String(data.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const dataBrDeIso = (iso: string) => {
  const [ano, mes, dia] = String(iso || '').split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso;
};

export const parseDataPagamento = (valor?: string): Date | null => {
  if (!valor) return null;
  const iso = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const data = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(data.getTime()) ? null : data;
  }
  return parseDataDeletada(valor);
};

export const dataDoLote = (lote: LotePagamentoHistorico): Date | null => {
  const daData = parseDataPagamento(lote?.dataFechamento);
  if (daData) return daData;
  const doId = Number(lote?.id);
  if (Number.isFinite(doId) && doId > 1_000_000_000_000) return new Date(doId);
  return null;
};

const noPeriodo = (iso: string, inicio: string, fim: string) => {
  if (inicio && iso < inicio) return false;
  if (fim && iso > fim) return false;
  return true;
};

const itensDoEstado = (dados: PagamentosState | undefined, origem: LinhaRelatorioPagamento['origem'], lote?: LotePagamentoHistorico) => {
  const linhas: LinhaRelatorioPagamento[] = [];
  const dataLote = lote ? dataDoLote(lote) : null;
  TIPOS.forEach(tipo => {
    (dados?.[tipo] || []).forEach((item: ItemPagamento, indice) => {
      const dataItem = parseDataPagamento(item.data) || dataLote;
      if (!dataItem) return;
      const dataIso = dataIsoDeDate(dataItem);
      linhas.push({
        id: item.id || `${origem}_${tipo}_${lote?.id || 'aberto'}_${indice}`,
        nome: String(item.descricao || '').trim() || 'Sem nome',
        valor: Number(item.valor) || 0,
        tipo,
        data: dataBrDeIso(dataIso),
        dataIso,
        origem,
        loteId: lote?.id,
        loteData: lote?.dataFechamento
      });
    });
  });
  return linhas;
};

export const listarLinhasRelatorioPagamentos = (
  lotes: LotePagamentoHistorico[] | undefined,
  abertos?: PagamentosState
) => {
  const linhas: LinhaRelatorioPagamento[] = [];
  (lotes || []).forEach(lote => linhas.push(...itensDoEstado(lote.dados, 'lote', lote)));
  if (abertos) linhas.push(...itensDoEstado(abertos, 'aberto'));
  return linhas;
};

export const mesesDisponiveisPagamentos = (
  lotes: LotePagamentoHistorico[] | undefined,
  abertos?: PagamentosState,
  agora = new Date()
) => {
  const vistos = new Set<string>([mesAtualChave(agora)]);
  listarLinhasRelatorioPagamentos(lotes, abertos).forEach(linha => {
    const data = parseDataPagamento(linha.dataIso);
    if (data) vistos.add(mesChaveDeData(data));
  });
  return Array.from(vistos).sort().reverse();
};

export const calcularRelatorioPagamentos = (
  lotes: LotePagamentoHistorico[] | undefined,
  abertos: PagamentosState | undefined,
  filtro: FiltroRelatorioPagamentos
): RelatorioPagamentos => {
  const termo = normalizarNomePagamento(filtro.busca);
  const tipo = filtro.tipo && filtro.tipo !== 'todos' ? filtro.tipo : '';
  const linhas = listarLinhasRelatorioPagamentos(lotes, abertos).filter(linha => {
    if (!noPeriodo(linha.dataIso, filtro.inicio, filtro.fim)) return false;
    if (tipo && linha.tipo !== tipo) return false;
    if (termo && !normalizarNomePagamento(linha.nome).includes(termo)) return false;
    return true;
  });

  const porNome = new Map<string, GrupoNomePagamento>();
  linhas.forEach(linha => {
    const chave = normalizarNomePagamento(linha.nome);
    const atual = porNome.get(chave);
    if (atual) {
      atual.linhas.push(linha);
      atual.total += linha.valor;
      atual.quantidade += 1;
    } else {
      porNome.set(chave, { nome: linha.nome, chave, linhas: [linha], total: linha.valor, quantidade: 1 });
    }
  });

  const grupos = Array.from(porNome.values())
    .map(grupo => ({
      ...grupo,
      linhas: [...grupo.linhas].sort((a, b) => b.dataIso.localeCompare(a.dataIso) || b.nome.localeCompare(a.nome, 'pt-BR'))
    }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR'));

  const totalDoTipo = (lote: LotePagamentoHistorico) => {
    if (tipo === 'caixa') return Number(lote.totalCaixa) || 0;
    if (tipo === 'cheque') return Number(lote.totalCheque) || 0;
    if (tipo === 'caben') return Number(lote.totalCaben) || 0;
    return Number(lote.totalGeral) || 0;
  };
  const lotesPeriodo = (lotes || []).filter(lote => {
    const data = dataDoLote(lote);
    if (!data) return false;
    if (!noPeriodo(dataIsoDeDate(data), filtro.inicio, filtro.fim)) return false;
    if (tipo && totalDoTipo(lote) <= 0) return false;
    return true;
  }).sort((a, b) => Number(b.id) - Number(a.id));

  return {
    grupos,
    lotes: lotesPeriodo,
    total: linhas.reduce((soma, linha) => soma + linha.valor, 0),
    quantidade: linhas.length
  };
};
