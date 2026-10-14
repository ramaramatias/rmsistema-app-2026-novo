import type { RelatorioPedidoCotacao } from '../tipos';
import { pedidosSemPdfPesado, setoresSemFotos } from './armazenamento';
import { enxugarFotosNuvem } from './fotos';

export const publicarRegistroSemFotos = async (record: any) => {
  if (!record || typeof record !== 'object') return;
  try {
    await fetch('/api/nuvem', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, setores: setoresSemFotos(record.setores) })
    });
  } catch {}
};

export const recordDoJsonBin = (dados: any) =>
  dados?.record && typeof dados.record === 'object' && !Array.isArray(dados.record) ? dados.record : dados;

export const enviarRegistroNuvem = async (registro: Record<string, unknown>) => {
  const tentar = (corpo: Record<string, unknown>) => fetch(`/api/nuvem?t=${Date.now()}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify(corpo) });
  const leve: Record<string, unknown> = {
    ...registro,
    fotosPendencias: enxugarFotosNuvem((registro.fotosPendencias as { [id: string]: string }) || {}, 400000),
    relatoriosPedidosCotacao: pedidosSemPdfPesado(registro.relatoriosPedidosCotacao as RelatorioPedidoCotacao[])
  };
  let resposta = await tentar(leve);
  if (resposta.status === 413) {
    resposta = await tentar({
      setores: leve.setores,
      tarefasDeletadas: leve.tarefasDeletadas,
      pagamentos: leve.pagamentos,
      historicoPagamentos: leve.historicoPagamentos,
      historicoPagamentosDeletados: leve.historicoPagamentosDeletados,
      conferencias: leve.conferencias,
      fornecedoresCotacao: leve.fornecedoresCotacao,
      itensCotacao: leve.itensCotacao,
      quantidadesElieuda: leve.quantidadesElieuda,
      custosCatalogo: leve.custosCatalogo,
      pedidosConferidos: leve.pedidosConferidos,
      conferenciasDeletadas: leve.conferenciasDeletadas,
      pagamentosDeletados: leve.pagamentosDeletados,
      pedidosCotacaoDeletados: leve.pedidosCotacaoDeletados,
      relatoriosPedidosCotacao: leve.relatoriosPedidosCotacao,
      senhasUsuarios: leve.senhasUsuarios,
      usuariosExtra: leve.usuariosExtra,
      usuariosExtraDeletados: leve.usuariosExtraDeletados,
      permissoesUsuarios: leve.permissoesUsuarios,
      ordensManutencao: leve.ordensManutencao,
      ordensManutencaoDeletadas: leve.ordensManutencaoDeletadas,
      itensChecklist: leve.itensChecklist,
      itensChecklistDeletados: leve.itensChecklistDeletados,
      caixaOperacional: leve.caixaOperacional,
      caixaOperacionalDeletados: leve.caixaOperacionalDeletados,
      lotesConciliacao: leve.lotesConciliacao,
      lotesInteligencia: leve.lotesInteligencia,
      ultimaAtualizacao: leve.ultimaAtualizacao,
      versaoBase: leve.versaoBase
    });
  }
  return resposta;
};
