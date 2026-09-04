import type {
  ItemPagamento,
  LotePagamentoHistorico,
  OrdemManutencao,
  PagamentosState,
  RegistroConferencia,
  RelatorioPedidoCotacao,
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
    if (setorSalvo) return setorSalvo;
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

export const unirTarefasDeletadas = (atuais: TarefaDeletada[], extras: Array<TarefaDeletada | { id: string }>) => {
  const porId = new Map<string, TarefaDeletada | { id: string }>();
  [...atuais, ...extras].forEach(item => {
    if (item?.id && !porId.has(item.id)) porId.set(item.id, item);
  });
  return Array.from(porId.values()) as TarefaDeletada[];
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
      porId.set(item.id, {
        ...atual,
        ...item,
        enviadoConferencia: Boolean(atual.enviadoConferencia || item.enviadoConferencia)
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

export const unirLotesPagamento = (...listas: Array<LotePagamentoHistorico[] | undefined>) => {
  const porId = new Map<string, LotePagamentoHistorico>();
  listas.forEach(lista => {
    (lista || []).forEach(lote => {
      if (!lote?.id) return;
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

export const garantirIdPagamento = (item: ItemPagamento, indice: number) => {
  if (item?.id) return item;
  return {
    ...item,
    id: `pag-${String(item?.descricao || 'item').toLowerCase().replace(/\s+/g, '-')}-${Number(item?.valor) || 0}-${indice}`
  };
};

export const unirListaPagamento = (a: ItemPagamento[] = [], b: ItemPagamento[] = [], idsFechados: Set<string>) => {
  const porId = new Map<string, ItemPagamento>();
  [...a, ...b].map(garantirIdPagamento).forEach(item => {
    if (!item?.id || idsFechados.has(item.id) || porId.has(item.id)) return;
    porId.set(item.id, item);
  });
  return Array.from(porId.values());
};

export const unirPagamentosAbertos = (a: PagamentosState | undefined, b: PagamentosState | undefined, lotes: LotePagamentoHistorico[]) => {
  const idsFechados = idsItensDeLotes(lotes);
  return {
    caixa: unirListaPagamento(a?.caixa, b?.caixa, idsFechados),
    cheque: unirListaPagamento(a?.cheque, b?.cheque, idsFechados),
    caben: unirListaPagamento(a?.caben, b?.caben, idsFechados)
  };
};

export const unirOrdensManutencao = (...listas: Array<OrdemManutencao[] | undefined>) => {
  const porId = new Map<string, OrdemManutencao>();
  listas.forEach(lista => {
    (lista || []).forEach(ordem => {
      if (!ordem?.id) return;
      const atual = porId.get(ordem.id);
      if (!atual || avancaoStatusOrdem(ordem.status) > avancaoStatusOrdem(atual.status) || (ordem.atualizadoEm || '') > (atual.atualizadoEm || '')) {
        porId.set(ordem.id, { ...atual, ...ordem, foto: ordem.foto || atual?.foto });
      }
    });
  });
  return Array.from(porId.values()).sort((a, b) => Number(b.id) - Number(a.id));
};
