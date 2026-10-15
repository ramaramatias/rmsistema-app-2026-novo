import type { ItemInteligencia, RelatorioInteligencia } from './parserInteligenciaEstoque';
import { rotuloMes } from './lotesConciliacao';
import { sessaoDoProduto } from './markupSessoes';

export type ClassePreco = 'perda' | 'alterar' | 'adequada' | 'sem-preco' | 'sem-sessao';

export type AvaliacaoPreco = {
  classe: ClassePreco;
  markup: number | null;
  alvo: number | null;
  sessao: string;
};

export type LoteInteligencia = {
  id: string;
  arquivadoEm: string;
  mes: string;
  arquivo: string;
  paginasLidas: number;
  paginasArquivo: number;
  detalhePeriodo: string;
  avisoPrevisao: string;
  identificados: RelatorioInteligencia['identificados'];
  itens: ItemInteligencia[];
};

export function markupPraticado(item: Pick<ItemInteligencia, 'custo' | 'venda' | 'markupPct'>) {
  if (item.markupPct != null && Number.isFinite(item.markupPct)) return item.markupPct;
  if (item.custo != null && item.custo > 0 && item.venda != null && item.venda > 0) {
    return ((item.venda - item.custo) / item.custo) * 100;
  }
  return null;
}

export function avaliarPreco(item: ItemInteligencia): AvaliacaoPreco {
  const sessao = sessaoDoProduto(item.nome);
  const markup = markupPraticado(item);
  const alvo = sessao?.markup ?? null;
  const nomeSessao = sessao?.nome || 'Sem sessão';
  if ((item.venda != null && item.custo != null && item.custo > 0 && item.venda < item.custo) || (markup != null && markup < 0)) {
    return { classe: 'perda', markup, alvo, sessao: nomeSessao };
  }
  if (markup == null) return { classe: 'sem-preco', markup: null, alvo, sessao: nomeSessao };
  if (!sessao) return { classe: 'sem-sessao', markup, alvo: null, sessao: nomeSessao };
  if (markup + 0.05 < sessao.markup) return { classe: 'alterar', markup, alvo, sessao: nomeSessao };
  return { classe: 'adequada', markup, alvo, sessao: nomeSessao };
}

export const rotuloClassePreco: Record<ClassePreco, string> = {
  perda: 'Perda de vendas',
  alterar: 'Produtos a alterar',
  adequada: 'Adequada',
  'sem-preco': 'Sem preço de venda',
  'sem-sessao': 'Sem sessão'
};

const ordemClasse: Record<ClassePreco, number> = { perda: 0, alterar: 1, 'sem-sessao': 2, 'sem-preco': 3, adequada: 4 };

export function itensPorPreco(itens: ItemInteligencia[]) {
  return [...itens].sort((a, b) => {
    const classeA = avaliarPreco(a);
    const classeB = avaliarPreco(b);
    if (ordemClasse[classeA.classe] !== ordemClasse[classeB.classe]) return ordemClasse[classeA.classe] - ordemClasse[classeB.classe];
    return (classeA.markup ?? 999) - (classeB.markup ?? 999);
  });
}

export function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
}

export function montarLoteInteligencia(relatorio: RelatorioInteligencia, arquivo: string): LoteInteligencia {
  const agora = new Date().toISOString();
  const mes = relatorio.mesReferencia || mesAtual();
  return {
    id: `intel_${mes}`,
    arquivadoEm: agora,
    mes,
    arquivo,
    paginasLidas: relatorio.paginasLidas,
    paginasArquivo: relatorio.paginasArquivo,
    detalhePeriodo: relatorio.detalhePeriodo,
    avisoPrevisao: relatorio.avisoPrevisao,
    identificados: relatorio.identificados,
    itens: relatorio.itens
  };
}

export function relatorioDoLote(lote: LoteInteligencia): RelatorioInteligencia {
  return {
    paginasArquivo: lote.paginasArquivo,
    paginasLidas: lote.paginasLidas,
    identificados: lote.identificados,
    avisoPrevisao: lote.avisoPrevisao || '',
    detalhePeriodo: lote.detalhePeriodo || '',
    mesReferencia: lote.mes,
    itens: Array.isArray(lote.itens) ? lote.itens : []
  };
}

export function unirLotesInteligencia(...listas: Array<LoteInteligencia[] | undefined>) {
  const porMes = new Map<string, LoteInteligencia>();
  listas.forEach(lista => {
    (lista || []).forEach(lote => {
      if (!lote?.mes || !Array.isArray(lote.itens)) return;
      const atual = porMes.get(lote.mes);
      if (!atual || Date.parse(lote.arquivadoEm) >= Date.parse(atual.arquivadoEm)) porMes.set(lote.mes, lote);
    });
  });
  return [...porMes.values()].sort((a, b) => b.mes.localeCompare(a.mes));
}

export { rotuloMes };
