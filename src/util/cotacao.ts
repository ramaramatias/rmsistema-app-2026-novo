import type { ItemCotacao } from '../tipos';
import { ITENS_COTACAO_OFICIAIS } from '../dados/padroes';

export const garantirItemCotacao = (item: ItemCotacao): ItemCotacao => ({
  id: item?.id || '',
  produto: item?.produto || '',
  unit: item?.unit || 'Kg',
  estoqueAtual: item?.estoqueAtual || '',
  qtdSugerida: item?.qtdSugerida || '',
  qtdPedir: item?.qtdPedir || '',
  menorCusto: item?.menorCusto,
  ultimoPrecoCompra: item?.ultimoPrecoCompra,
  precos: item?.precos && typeof item.precos === 'object' ? item.precos : {},
  atualizadoEm: item?.atualizadoEm,
  secao: item?.secao,
  fornecedorId: item?.fornecedorId
});

export const qtdPedirNumero = (item: { qtdPedir?: string }) => parseFloat(String(item?.qtdPedir || '').replace(',', '.')) || 0;

export const pesoItemCotacao = (item: ItemCotacao) =>
  Object.values(item.precos || {}).filter(valor => String(valor || '').trim()).length
  + (item.estoqueAtual?.trim() ? 1 : 0)
  + (item.qtdPedir?.trim() ? 1 : 0)
  + (item.qtdSugerida?.trim() ? 1 : 0);

export const tempoItemCotacao = (item?: ItemCotacao | null) => {
  if (!item?.atualizadoEm) return 0;
  const tempo = Date.parse(String(item.atualizadoEm));
  return Number.isNaN(tempo) ? 0 : tempo;
};

export const escolherItemCotacao = (atual: ItemCotacao, candidato: ItemCotacao) => {
  const tempoAtual = tempoItemCotacao(atual);
  const tempoNovo = tempoItemCotacao(candidato);
  if (tempoNovo !== tempoAtual) return tempoNovo > tempoAtual ? candidato : atual;
  const pesoAtual = pesoItemCotacao(atual);
  const pesoNovo = pesoItemCotacao(candidato);
  if (pesoNovo !== pesoAtual) return pesoNovo > pesoAtual ? candidato : atual;
  return candidato;
};

export const chaveNomeItemCotacao = (item: { produto?: string }) =>
  String(item?.produto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export const mesclarItensCotacao = (...listas: Array<ItemCotacao[] | undefined>) => {
  const porId = new Map<string, ItemCotacao>();
  listas.forEach(lista => {
    (lista || []).forEach(item => {
      if (!item?.id) return;
      const atual = porId.get(item.id);
      porId.set(item.id, garantirItemCotacao(atual ? escolherItemCotacao(atual, item) : item));
    });
  });
  const porNome = new Map<string, ItemCotacao>();
  const semNome: ItemCotacao[] = [];
  porId.forEach(item => {
    const chave = chaveNomeItemCotacao(item);
    if (!chave) {
      semNome.push(item);
      return;
    }
    const atual = porNome.get(chave);
    if (!atual) {
      porNome.set(chave, item);
      return;
    }
    const escolhido = escolherItemCotacao(atual, item);
    porNome.set(chave, garantirItemCotacao({
      ...escolhido,
      precos: { ...(atual.precos || {}), ...(item.precos || {}), ...(escolhido.precos || {}) }
    }));
  });
  return [...porNome.values(), ...semNome];
};

export const normalizarItensCotacao = (itensSalvos: ItemCotacao[]) => mesclarItensCotacao(ITENS_COTACAO_OFICIAIS, itensSalvos);

export const marcarItensCotacaoAgora = (itens: ItemCotacao[]) => {
  const agora = new Date().toISOString();
  return itens.map(item => ({ ...item, atualizadoEm: agora }));
};
