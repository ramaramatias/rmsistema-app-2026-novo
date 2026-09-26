import { PRODUTOS_POR_SECAO, type ProdutoSecao } from './secoesDados';
import { normalizarNomeProduto, tributacaoDoProduto } from './tributacao';

export type AjusteCusto = {
  id: string;
  nome: string;
  secao: string;
  custo: string;
  precoVenda?: string;
  pendenteVenda: boolean;
  alteradoEm: string;
};

export type CustosCatalogoState = {
  ajustes: Record<string, AjusteCusto>;
  margens: Record<string, number>;
};

export const MARGENS_PADRAO: Record<string, number> = {
  'Laticínios': 75.5,
  Mercearia: 70,
  Bebidas: 60,
  Sorvete: 60
};

export const MARGEM_LATICINIOS_REDUCAO_100 = 35;
export const MARGEM_MERCEARIA_REDUCAO_33 = 55.44;
export const MARGEM_MERCEARIA_REDUCAO_66 = 40.74;
export const MARGEM_BEBIDAS_LATA = 100;
export const MARGEM_SORVETE_PICOLE = 100;

export function ehRefrigeranteLata(nome?: string) {
  const n = normalizarNomeProduto(nome || '');
  if (!n || !/(\brefri\b|refrigerante)/.test(n)) return false;
  if (/\blata\b/.test(n)) return true;
  return /\b350\s*ml\b/.test(n) && /(coca|fanta|sprite|guarana|kuat|jesus|schweppes)/.test(n) && !/\bpet\b/.test(n);
}

export function ehPicole(nome?: string) {
  return /\bpicole\b/.test(normalizarNomeProduto(nome || ''));
}

export const custosCatalogoVazio = (): CustosCatalogoState => ({ ajustes: {}, margens: { ...MARGENS_PADRAO } });

export function margemDoProduto(nome?: string, secao?: string, tributacao?: string, margens?: Record<string, number>) {
  const reducao = tributacao || (nome ? tributacaoDoProduto(nome, secao) : undefined);
  if (secao === 'Laticínios' && reducao === '100%') return MARGEM_LATICINIOS_REDUCAO_100;
  if (secao === 'Mercearia' && reducao === '33.33%') return MARGEM_MERCEARIA_REDUCAO_33;
  if (secao === 'Mercearia' && reducao === '66.11%') return MARGEM_MERCEARIA_REDUCAO_66;
  if (secao === 'Bebidas' && ehRefrigeranteLata(nome)) return MARGEM_BEBIDAS_LATA;
  if (secao === 'Sorvete' && ehPicole(nome)) return MARGEM_SORVETE_PICOLE;
  if (secao == null) return undefined;
  return margens?.[secao] ?? MARGENS_PADRAO[secao];
}

export function textoPorcentagem(valor?: number) {
  if (valor == null || !Number.isFinite(valor)) return undefined;
  return `${valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

export function margemSobreVenda(custo?: string, precoVenda?: string) {
  const c = parseFloat(String(custo || '').replace(',', '.'));
  const v = parseFloat(String(precoVenda || '').replace(',', '.'));
  if (!Number.isFinite(c) || !Number.isFinite(v) || v <= 0) return undefined;
  return ((v - c) / v) * 100;
}

export function precoVendaDoCusto(custo?: string, secao?: string, margens?: Record<string, number>, nome?: string, tributacao?: string) {
  const pct = margemDoProduto(nome, secao, tributacao, margens);
  if (pct == null) return undefined;
  const n = parseFloat(String(custo || '').replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return (n * (1 + pct / 100)).toFixed(2);
}

export const lerCustosCatalogo = (bruto: unknown): CustosCatalogoState => {
  const dados = bruto && typeof bruto === 'object' ? bruto as CustosCatalogoState : { ajustes: {}, margens: {} };
  return {
    ajustes: dados.ajustes && typeof dados.ajustes === 'object' ? dados.ajustes : {},
    margens: { ...MARGENS_PADRAO, ...(dados.margens && typeof dados.margens === 'object' ? dados.margens : {}) }
  };
};

const cents = (valor: unknown) => {
  const n = parseFloat(String(valor ?? '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

const formatarValor = (valor: number) => valor.toFixed(2);

let indice: { porId: Map<string, ProdutoSecao>; porNome: Map<string, ProdutoSecao> } | null = null;

const indiceCatalogo = () => {
  if (indice) return indice;
  const porId = new Map<string, ProdutoSecao>();
  const porNome = new Map<string, ProdutoSecao>();
  Object.values(PRODUTOS_POR_SECAO).flat().forEach(produto => {
    if (!produto?.id) return;
    porId.set(produto.id, produto);
    porNome.set(normalizarNomeProduto(produto.nome), produto);
  });
  indice = { porId, porNome };
  return indice;
};

export function acharProdutoCatalogo(item: { id?: string; produto?: string; nome?: string }) {
  const { porId, porNome } = indiceCatalogo();
  if (item.id && porId.has(item.id)) return porId.get(item.id);
  const nome = normalizarNomeProduto(item.produto || item.nome || '');
  return nome ? porNome.get(nome) : undefined;
}

export function aplicarCustosRecebidos(atuais: CustosCatalogoState, recebido: unknown) {
  const uniao = mesclarCustosCatalogo(atuais, lerCustosCatalogo(recebido));
  try { localStorage.setItem('rm_custos_catalogo', JSON.stringify(uniao)); } catch { /* ignora */ }
  return uniao;
}

export function mesclarCustosCatalogo(local: CustosCatalogoState, recebido?: CustosCatalogoState | null): CustosCatalogoState {
  const outro = lerCustosCatalogo(recebido);
  const ajustes = { ...local.ajustes };
  Object.values(outro.ajustes).forEach(item => {
    if (!item?.id) return;
    const atual = ajustes[item.id];
    if (!atual || String(item.alteradoEm || '') >= String(atual.alteradoEm || '')) ajustes[item.id] = item;
  });
  return { ajustes, margens: { ...local.margens, ...outro.margens } };
}

export function aplicarAjustesCatalogo(lista: ProdutoSecao[], estado: CustosCatalogoState): Array<ProdutoSecao & { pendenteVenda?: boolean }> {
  return (lista || []).map(item => {
    const ajuste = estado.ajustes[item.id] || estado.ajustes[normalizarNomeProduto(item.nome)];
    const custo = ajuste?.custo || item.custo;
    return {
      ...item,
      custo,
      precoVenda: ajuste?.precoVenda || item.precoVenda || precoVendaDoCusto(custo, item.secao, estado.margens, item.nome, item.tributacao),
      pendenteVenda: ajuste?.pendenteVenda
    };
  });
}

export function registrarCustosDoPedido(
  estado: CustosCatalogoState,
  itens: Array<{ id?: string; produto?: string; nome?: string; valorUnitario?: number }>
) {
  const proximo = lerCustosCatalogo(estado);
  let alterados = 0;
  const agora = new Date().toISOString();
  itens.forEach(item => {
    const valor = Number(item.valorUnitario);
    if (!Number.isFinite(valor) || valor <= 0) return;
    const produto = acharProdutoCatalogo(item);
    if (!produto) return;
    const novo = formatarValor(valor);
    const atual = proximo.ajustes[produto.id]?.custo || produto.custo;
    if (cents(novo) === cents(atual)) return;
    const venda = precoVendaDoCusto(novo, produto.secao, proximo.margens, produto.nome, produto.tributacao);
    proximo.ajustes[produto.id] = {
      id: produto.id,
      nome: produto.nome,
      secao: produto.secao,
      custo: novo,
      precoVenda: venda || proximo.ajustes[produto.id]?.precoVenda || produto.precoVenda,
      pendenteVenda: !venda,
      alteradoEm: agora
    };
    alterados += 1;
  });
  return { estado: proximo, alterados };
}

export function aplicarMargemSecao(estado: CustosCatalogoState, secao: string, porcentagem: number) {
  const proximo = lerCustosCatalogo(estado);
    let atualizados = 0;
    Object.values(proximo.ajustes).forEach(item => {
    if (item.secao !== secao || !item.pendenteVenda) return;
    const custo = parseFloat(String(item.custo || '').replace(',', '.'));
    if (!Number.isFinite(custo) || custo <= 0) return;
    const pct = margemDoProduto(item.nome, item.secao, undefined, { ...proximo.margens, [secao]: porcentagem }) ?? porcentagem;
    item.precoVenda = formatarValor(custo * (1 + pct / 100));
    item.pendenteVenda = false;
    item.alteradoEm = new Date().toISOString();
    atualizados += 1;
  });
  proximo.margens = { ...proximo.margens, [secao]: porcentagem };
  return { estado: proximo, atualizados };
}

export function qtdPendentesSecao(estado: CustosCatalogoState, secao?: string) {
  return Object.values(estado.ajustes || {}).filter(item => item.pendenteVenda && (!secao || item.secao === secao)).length;
}
