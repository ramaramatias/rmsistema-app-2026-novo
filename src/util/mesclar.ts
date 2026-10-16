import type {
  ItemPagamento,
  LotePagamentoHistorico,
  OrdemManutencao,
  PagamentosState,
  RegistroConferencia,
  RelatorioPedidoCotacao,
  LancamentoProducao,
  LancamentoRota,
  LancamentoDeposito,
  MovimentoCaixaOperacional,
  Setor,
  StatusTarefa,
  Tarefa,
  TarefaDeletada
} from '../tipos';
import { SETORES_PADRAO } from '../dados/padroes';
import { avancaoStatusOrdem } from './manutencao';

export const nomeSetorSemEmoji = (nome: string) => nome.replace(/^(🥖|🌳|🏢|⛪)\s*/, '');

export const normalizarSetores = (setoresSalvos: Setor[]) => {
  if (!Array.isArray(setoresSalvos)) return SETORES_PADRAO;
  const comTarefas = (setor?: Setor): Setor | undefined => setor ? { ...setor, tarefas: Array.isArray(setor.tarefas) ? setor.tarefas : [] } : setor;
  const setorAntigo = comTarefas(setoresSalvos.find(setor => setor.id === 'pao-da-vida'));
  const salvosPorId = new Map(setoresSalvos.filter(setor => setor.id !== 'pao-da-vida').map(setor => [setor.id, comTarefas(setor)!]));
  const setoresAtualizados = SETORES_PADRAO.map(setorPadrao => {
    const setorSalvo = salvosPorId.get(setorPadrao.id);
    if (setorSalvo) {
      return setorPadrao.id === 'manutencao'
        ? { ...setorSalvo, nome: setorPadrao.nome }
        : setorSalvo;
    }
    if (setorPadrao.id === 'padaria' && setorAntigo) return { ...setorPadrao, tarefas: setorAntigo.tarefas };
    return setorPadrao;
  });
  const idsAtuais = new Set(setoresAtualizados.map(setor => setor.id));
  return [...setoresAtualizados, ...setoresSalvos.filter(setor => setor.id !== 'pao-da-vida' && !idsAtuais.has(setor.id)).map(setor => comTarefas(setor)!)];
};

export const idsDeTarefasDeletadas = (lista: Array<{ id?: string } | string> = []) =>
  lista.map(item => (typeof item === 'string' ? item : item?.id)).filter((id): id is string => Boolean(id));

export const statusDaTarefa = (tarefa: Tarefa): StatusTarefa =>
  tarefa.status === 'concluida' || tarefa.concluida ? 'concluida' : 'aberta';

export const parseDataConclusao = (valor?: string): Date | null => {
  if (!valor) return null;
  const direto = new Date(valor);
  if (!Number.isNaN(direto.getTime())) return direto;
  const partes = valor.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?:,?\s*(\d{1,2}):(\d{2}))?/);
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]) - 1;
  const anoInformado = partes[3];
  const ano = anoInformado ? Number(anoInformado.length === 2 ? `20${anoInformado}` : anoInformado) : new Date().getFullYear();
  const hora = partes[4] ? Number(partes[4]) : 0;
  const minuto = partes[5] ? Number(partes[5]) : 0;
  const data = new Date(ano, mes, dia, hora, minuto);
  return Number.isNaN(data.getTime()) ? null : data;
};

export const escolherTarefaMaisAvancada = (local: Tarefa, recebida: Tarefa): Tarefa => {
  const statusLocal = statusDaTarefa(local);
  const statusRecebida = statusDaTarefa(recebida);
  const escolhida = statusLocal === 'concluida' && statusRecebida !== 'concluida'
    ? { ...local, status: 'concluida' as StatusTarefa }
    : statusRecebida === 'concluida' && statusLocal !== 'concluida'
      ? { ...recebida, status: 'concluida' as StatusTarefa }
      : local;
  return { ...escolhida, foto: escolhida.foto || local.foto || recebida.foto };
};

export const mesclarSetores = (setoresBase: Setor[], setoresNovos: Setor[], idsRemovidos: string[] = []) => {
  const removidos = new Set(idsRemovidos);
  const novosPorId = new Map((setoresNovos || []).map(setor => [setor.id, setor]));
  const idsBase = new Set((setoresBase || []).map(setor => setor.id));
  const setoresMesclados = (setoresBase || []).map(setorBase => {
    const tarefasBase = Array.isArray(setorBase.tarefas) ? setorBase.tarefas : [];
    const setorNovo = novosPorId.get(setorBase.id);
    if (!setorNovo) return { ...setorBase, tarefas: tarefasBase.filter(tarefa => !removidos.has(tarefa.id)) };
    const tarefasPorId = new Map<string, Tarefa>();
    const incorporar = (tarefa: Tarefa) => {
      if (!tarefa?.id || removidos.has(tarefa.id)) return;
      const existente = tarefasPorId.get(tarefa.id);
      tarefasPorId.set(tarefa.id, existente ? escolherTarefaMaisAvancada(existente, tarefa) : tarefa);
    };
    tarefasBase.forEach(incorporar);
    (setorNovo.tarefas || []).forEach(incorporar);
    return { ...setorBase, tarefas: Array.from(tarefasPorId.values()) };
  });
  const setoresSoNaNuvem = (setoresNovos || [])
    .filter(setor => !idsBase.has(setor.id))
    .map(setor => ({ ...setor, tarefas: (setor.tarefas || []).filter(tarefa => !removidos.has(tarefa.id)) }));
  return [...setoresMesclados, ...setoresSoNaNuvem];
};

/** Por quantos dias uma tarefa deletada fica visível no histórico antes de ser removida automaticamente. */
export const DIAS_HISTORICO_DELETADAS = 7;

/**
 * Lê a data em que a tarefa foi deletada. Aceita ISO e o formato brasileiro 'dd/mm/aaaa[, hh:mm]'.
 * O formato brasileiro é tratado antes do `new Date()` para não confundir dia com mês (ex.: 01/09 não vira 9 de janeiro).
 */
export const parseDataDeletada = (valor?: string): Date | null => {
  if (!valor) return null;
  const br = String(valor).match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:,?\s*(\d{1,2}):(\d{2}))?/);
  if (br) {
    const ano = Number(br[3].length === 2 ? `20${br[3]}` : br[3]);
    const data = new Date(ano, Number(br[2]) - 1, Number(br[1]), br[4] ? Number(br[4]) : 0, br[5] ? Number(br[5]) : 0);
    return Number.isNaN(data.getTime()) ? null : data;
  }
  return parseDataConclusao(valor);
};

/** Dias que ainda faltam para a tarefa deletada sair do histórico (0 = sai hoje). `null` se a data for desconhecida. */
export const diasRestantesHistoricoDeletada = (item: Pick<TarefaDeletada, 'deletadaEm'> | { id: string }, agora = Date.now()) => {
  const data = parseDataDeletada((item as Partial<TarefaDeletada>).deletadaEm);
  if (!data) return null;
  const passados = Math.floor((agora - data.getTime()) / 86_400_000);
  return Math.max(0, DIAS_HISTORICO_DELETADAS - passados);
};

export const tarefaDeletadaExpirou = (item: TarefaDeletada | { id: string }, agora = Date.now()) => {
  const data = parseDataDeletada((item as Partial<TarefaDeletada>).deletadaEm);
  if (!data) return false;
  return agora - data.getTime() > DIAS_HISTORICO_DELETADAS * 86_400_000;
};

/** Um item do histórico que ainda pode ser mostrado e recuperado (não é só uma lápide de id). */
export const ehHistoricoDeletada = (item: TarefaDeletada | { id: string } | undefined | null): item is TarefaDeletada =>
  Boolean(item?.id && (item as Partial<TarefaDeletada>).texto && (item as Partial<TarefaDeletada>).deletadaEm);

/**
 * Tarefas deletadas há mais de 7 dias são reduzidas a uma "lápide" só com o id: somem do histórico,
 * mas continuam impedindo que a tarefa volte quando os dados são mesclados com a nuvem ou com outro computador.
 * Itens que não expiraram são devolvidos com a mesma referência (permite comparar e saber se algo mudou).
 */
export const expirarTarefasDeletadas = (lista: Array<TarefaDeletada | { id: string }>, agora = Date.now()) =>
  (lista || []).map(item => (ehHistoricoDeletada(item) && tarefaDeletadaExpirou(item, agora) ? { id: item.id } : item)) as TarefaDeletada[];

export const unirTarefasDeletadas = (atuais: TarefaDeletada[], extras: Array<TarefaDeletada | { id: string }>) => {
  const porId = new Map<string, TarefaDeletada | { id: string }>();
  [...(atuais || []), ...(extras || [])].forEach(item => {
    if (item?.id && !porId.has(item.id)) porId.set(item.id, item);
  });
  return expirarTarefasDeletadas(Array.from(porId.values()));
};

export const contarItensPagamento = (dados?: PagamentosState) =>
  (dados?.caixa?.length || 0) + (dados?.cheque?.length || 0) + (dados?.caben?.length || 0);

export const unirRelatoriosPedidos = (...listas: Array<RelatorioPedidoCotacao[] | undefined>) => {
  const porId = new Map<string, RelatorioPedidoCotacao>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item?.id) return;
      const atual = porId.get(item.id);
      if (!atual) {
        porId.set(item.id, item);
        return;
      }
      const pesoPdf = (conteudo?: string) => {
        const valor = String(conteudo || '');
        if (valor.startsWith('/api/anexo')) return 4;
        if (valor.startsWith('http')) return 3;
        if (valor.startsWith('data:')) return 2;
        return valor ? 1 : 0;
      };
      const pdfAtual = atual.pdfFornecedor;
      const pdfNovo = item.pdfFornecedor;
      const pdfFornecedor = pesoPdf(pdfNovo?.conteudo) >= pesoPdf(pdfAtual?.conteudo) ? (pdfNovo || pdfAtual) : (pdfAtual || pdfNovo);
      porId.set(item.id, {
        ...atual,
        ...item,
        enviadoConferencia: Boolean(atual.enviadoConferencia || item.enviadoConferencia),
        bonificacaoResolvida: Boolean(atual.bonificacaoResolvida || item.bonificacaoResolvida),
        itens: (item.itens?.length || 0) >= (atual.itens?.length || 0) ? (item.itens || atual.itens) : atual.itens,
        pdfFornecedor
      });
    });
  });
  return Array.from(porId.values());
};

export const filtrarPedidosNaoDeletados = (lista: RelatorioPedidoCotacao[] | undefined, deletados: string[] | undefined) => {
  const ids = new Set(deletados || []);
  return (lista || []).filter(item => item?.id && !ids.has(item.id));
};

export const unirPedidosCotacao = (deletados: string[] | undefined, ...listas: Array<RelatorioPedidoCotacao[] | undefined>) =>
  filtrarPedidosNaoDeletados(unirRelatoriosPedidos(...listas), deletados);

export const unirConferencias = (...listas: Array<RegistroConferencia[] | undefined>) => {
  const porId = new Map<string, RegistroConferencia>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (item?.id && !porId.has(item.id)) porId.set(item.id, item);
    });
  });
  return Array.from(porId.values());
};

export const unirIds = (...listas: Array<string[] | undefined>) => Array.from(new Set(listas.flatMap(lista => lista || []).filter(Boolean)));

export const unirLotesPagamento = (deletados: string[] | undefined, ...listas: Array<LotePagamentoHistorico[] | undefined>) => {
  const bloqueados = new Set((deletados || []).filter(Boolean));
  const porId = new Map<string, LotePagamentoHistorico>();
  listas.forEach(lista => {
    (lista || []).forEach(lote => {
      if (!lote?.id || bloqueados.has(lote.id)) return;
      const atual = porId.get(lote.id);
      if (!atual || contarItensPagamento(lote.dados) > contarItensPagamento(atual.dados) || (lote.totalGeral || 0) > (atual.totalGeral || 0)) {
        porId.set(lote.id, lote);
      }
    });
  });
  return Array.from(porId.values()).sort((a, b) => Number(b.id) - Number(a.id));
};

export const idsItensDeLotes = (lotes: LotePagamentoHistorico[]) => {
  const ids = new Set<string>();
  lotes.forEach(lote => {
    (['caixa', 'cheque', 'caben'] as const).forEach(tipo => {
      (lote.dados?.[tipo] || []).forEach(item => {
        if (item?.id) ids.add(item.id);
      });
    });
  });
  return ids;
};

export const identidadePagamento = (item: Pick<ItemPagamento, 'descricao' | 'valor'> | undefined) =>
  `pag-${String(item?.descricao || 'item').trim().toLowerCase().replace(/\s+/g, '-')}-${Number(item?.valor) || 0}`;

export const marcasItensDoLote = (lote?: LotePagamentoHistorico) => {
  const marcas: string[] = [];
  if (!lote?.dados) return marcas;
  (['caixa', 'cheque', 'caben'] as const).forEach(tipo => {
    (lote.dados?.[tipo] || []).forEach(item => {
      if (item?.id) marcas.push(item.id);
      marcas.push(identidadePagamento(item));
    });
  });
  return marcas;
};

export const garantirIdPagamento = (item: ItemPagamento) => {
  if (item?.id) return item;
  return { ...item, id: identidadePagamento(item) };
};

export const unirListaPagamento = (a: ItemPagamento[] = [], b: ItemPagamento[] = [], idsFechados: Set<string>) => {
  const porId = new Map<string, ItemPagamento>();
  [...a, ...b].forEach(bruto => {
    if (!bruto) return;
    const identidade = identidadePagamento(bruto);
    const item = garantirIdPagamento(bruto);
    if (bruto.id && idsFechados.has(bruto.id)) return;
    if (!bruto.id && idsFechados.has(identidade)) return;
    if (idsFechados.has(item.id) || porId.has(item.id)) return;
    porId.set(item.id, item);
  });
  return Array.from(porId.values());
};

export const unirPagamentosAbertos = (
  a: PagamentosState | undefined,
  b: PagamentosState | undefined,
  lotes: LotePagamentoHistorico[],
  idsDeletados: string[] = []
) => {
  const idsFechados = idsItensDeLotes(lotes);
  idsDeletados.forEach(id => { if (id) idsFechados.add(id); });
  return {
    caixa: unirListaPagamento(a?.caixa, b?.caixa, idsFechados),
    cheque: unirListaPagamento(a?.cheque, b?.cheque, idsFechados),
    caben: unirListaPagamento(a?.caben, b?.caben, idsFechados)
  };
};

export const unirOrdensManutencao = (idsDeletados: string[] = [], ...listas: Array<OrdemManutencao[] | undefined>) => {
  const bloqueados = new Set((idsDeletados || []).filter(Boolean));
  const porId = new Map<string, OrdemManutencao>();
  listas.forEach(lista => {
    (lista || []).forEach(ordem => {
      if (!ordem?.id || bloqueados.has(ordem.id)) return;
      const atual = porId.get(ordem.id);
      if (!atual || avancaoStatusOrdem(ordem.status) > avancaoStatusOrdem(atual.status) || (ordem.atualizadoEm || '') > (atual.atualizadoEm || '')) {
        porId.set(ordem.id, { ...atual, ...ordem, foto: ordem.foto || atual?.foto });
      }
    });
  });
  return Array.from(porId.values()).sort((a, b) => Number(b.id) - Number(a.id));
};

export const unirNomesProdutosProducao = (...listas: Array<string[] | undefined>) => {
  const vistos = new Set<string>();
  const nomes: string[] = [];
  listas.forEach(lista => {
    (lista || []).forEach(nome => {
      const limpo = String(nome || '').trim();
      if (!limpo) return;
      const chave = limpo.toLowerCase();
      if (vistos.has(chave)) return;
      vistos.add(chave);
      nomes.push(limpo);
    });
  });
  return nomes;
};

export const unirLancamentosProducao = (idsDeletados: string[] = [], ...listas: Array<LancamentoProducao[] | undefined>) => {
  const bloqueados = new Set((idsDeletados || []).filter(Boolean));
  const porId = new Map<string, LancamentoProducao>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item?.id || bloqueados.has(item.id)) return;
      porId.set(item.id, item);
    });
  });
  return Array.from(porId.values());
};

export const unirLancamentosRota = (idsDeletados: string[] = [], ...listas: Array<LancamentoRota[] | undefined>) => {
  const bloqueados = new Set((idsDeletados || []).filter(Boolean));
  const porId = new Map<string, LancamentoRota>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item?.id || bloqueados.has(item.id)) return;
      porId.set(item.id, item);
    });
  });
  return Array.from(porId.values());
};

export const unirMovimentosCaixaOperacional = (idsDeletados: string[] = [], ...listas: Array<MovimentoCaixaOperacional[] | undefined>) => {
  const bloqueados = new Set((idsDeletados || []).filter(Boolean));
  const porId = new Map<string, MovimentoCaixaOperacional>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item?.id || bloqueados.has(item.id)) return;
      porId.set(item.id, item);
    });
  });
  return Array.from(porId.values());
};

export const unirFornecedoresCotacao = <T extends { id?: string; nome?: string }>(...listas: Array<T[] | undefined>) => {
  const mapa = new Map<string, T>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item) return;
      const chave = String(item.id || item.nome || '').trim();
      if (!chave) return;
      const anterior = mapa.get(chave);
      mapa.set(chave, anterior ? { ...anterior, ...item } : item);
    });
  });
  return [...mapa.values()];
};

type DiasElieuda = { terca?: string; quinta?: string; sabado?: string };

export const unirQuantidadesElieuda = (
  nuvem: Record<string, DiasElieuda> | undefined,
  local: Record<string, DiasElieuda> | undefined,
  localGanha: boolean
) => {
  if (!localGanha) return { ...(nuvem || {}) };
  if (local && Object.keys(local).length === 0) return {};
  const saida: Record<string, DiasElieuda> = { ...(nuvem || {}) };
  Object.entries(local || {}).forEach(([produto, dias]) => {
    saida[produto] = { ...(saida[produto] || {}), ...(dias || {}) };
  });
  return saida;
};

export const unirLancamentosDeposito = (idsDeletados: string[] = [], ...listas: Array<LancamentoDeposito[] | undefined>) => {
  const bloqueados = new Set((idsDeletados || []).filter(Boolean));
  const porId = new Map<string, LancamentoDeposito>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item?.id || bloqueados.has(item.id)) return;
      porId.set(item.id, item);
    });
  });
  return Array.from(porId.values());
};
