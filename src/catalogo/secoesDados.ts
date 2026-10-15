import bebidas from './dados/bebidas.json';
import betania from './dados/laticinios_betania_lacteos_s_a.json';
import beloVale from './dados/laticinios_belo_vale.json';
import lassa from './dados/laticinios_lassa.json';
import delta from './dados/laticinios_delta.json';
import embalagens from './dados/embalagens.json';
import embalagensPapelaria from './dados/embalagens_papelaria.json';
import bomboniere from './dados/bomboniere.json';
import materiaPrima from './dados/materia_prima.json';
import artesanato from './dados/artesanato.json';
import sorvete from './dados/sorvete.json';
import mercearia from './dados/mercearia.json';
import { CATEGORIAS_MATERIA_PRIMA, categoriaMateriaPrima } from './categoriaMateriaPrima';
import { CATEGORIAS_MERCEARIA, categoriaMercearia } from './categoriaMercearia';

export type ProdutoSecao = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  secao: string;
  custo?: string;
  precoVenda?: string;
  pendenteVenda?: boolean;
  tributacao?: string;
  categoria?: string;
  fornecedor?: string;
  ativo: boolean;
};

export const FORNECEDORES_LATICINIOS = [
  { id: 'f_lat_betania', nome: 'Betânia Lácteos' },
  { id: 'f_lat_belo_vale', nome: 'Laticínio Belo Vale' },
  { id: 'f_lat_lassa', nome: 'LASSA' },
  { id: 'f_lat_delta', nome: 'DELTA' }
];

export const LATICINIOS_POR_FORNECEDOR: Record<string, ProdutoSecao[]> = {
  'Betânia Lácteos': betania as ProdutoSecao[],
  'Laticínio Belo Vale': beloVale as ProdutoSecao[],
  LASSA: lassa as ProdutoSecao[],
  DELTA: delta as ProdutoSecao[]
};

export const ID_FORNECEDOR_LATICINIO: Record<string, string> = {
  'Betânia Lácteos': 'f_lat_betania',
  'Laticínio Belo Vale': 'f_lat_belo_vale',
  LASSA: 'f_lat_lassa',
  DELTA: 'f_lat_delta'
};

const laticiniosTodos = Object.values(LATICINIOS_POR_FORNECEDOR).flat();

const materiaPrimaLista = materiaPrima as ProdutoSecao[];

export const MATERIA_PRIMA_POR_CATEGORIA: Record<string, ProdutoSecao[]> = Object.fromEntries(
  CATEGORIAS_MATERIA_PRIMA.map(nome => [
    nome,
    materiaPrimaLista.filter(item => (item.categoria || categoriaMateriaPrima(item.nome)) === nome)
  ]).filter(([, lista]) => (lista as ProdutoSecao[]).length > 0)
);

const merceariaLista = mercearia as ProdutoSecao[];

export const MERCEARIA_POR_CATEGORIA: Record<string, ProdutoSecao[]> = Object.fromEntries(
  CATEGORIAS_MERCEARIA.map(nome => [
    nome,
    merceariaLista.filter(item => (item.categoria || categoriaMercearia(item.nome)) === nome)
  ]).filter(([, lista]) => (lista as ProdutoSecao[]).length > 0)
);

export const EMBALAGENS_POR_FORNECEDOR: Record<string, ProdutoSecao[]> = {
  Geral: embalagens as ProdutoSecao[],
  Papelaria: embalagensPapelaria as ProdutoSecao[]
};

export const FORNECEDORES_POR_SECAO: Record<string, Record<string, ProdutoSecao[]>> = {
  'Laticínios': LATICINIOS_POR_FORNECEDOR,
  Embalagens: EMBALAGENS_POR_FORNECEDOR,
  'Matéria prima': MATERIA_PRIMA_POR_CATEGORIA,
  Mercearia: MERCEARIA_POR_CATEGORIA
};

export const PRODUTOS_POR_SECAO: Record<string, ProdutoSecao[]> = {
  Bebidas: bebidas as ProdutoSecao[],
  'Laticínios': laticiniosTodos,
  'Matéria prima': materiaPrima as ProdutoSecao[],
  Embalagens: Object.values(EMBALAGENS_POR_FORNECEDOR).flat(),
  Artesanato: artesanato as ProdutoSecao[],
  Mercearia: mercearia as ProdutoSecao[],
  Bomboniere: bomboniere as ProdutoSecao[],
  Sorvete: sorvete as ProdutoSecao[]
};

/** Seções do cadastro que ainda não tinham lista própria na Cotação. */
export const SECOES_COTACAO_EXTRAS = [
  'Bebidas',
  'Matéria prima',
  'Artesanato',
  'Mercearia',
  'Bomboniere',
  'Sorvete'
] as const;

const PREFIXO_SECAO: Record<string, string> = {
  beb: 'Bebidas',
  mp: 'Matéria prima',
  art: 'Artesanato',
  mer: 'Mercearia',
  bom: 'Bomboniere',
  sor: 'Sorvete'
};

export function secaoCatalogoDoId(id: string) {
  return PREFIXO_SECAO[String(id || '').split('_')[0]] || '';
}

export function montarItensLaticinios(salvos: Array<{
  id: string;
  estoqueAtual?: string;
  qtdSugerida?: string;
  qtdPedir?: string;
  precos?: Record<string, string>;
  ultimoPrecoCompra?: number;
}> = []) {
  const porId = new Map(salvos.map(item => [item.id, item]));
  const lista: Array<{
    id: string;
    produto: string;
    unit: string;
    secao: string;
    fornecedorId?: string;
    estoqueAtual: string;
    qtdSugerida: string;
    qtdPedir: string;
    precos: Record<string, string>;
    ultimoPrecoCompra?: number;
  }> = [];
  Object.entries(LATICINIOS_POR_FORNECEDOR).forEach(([nome, produtos]) => {
    const fornecedorId = ID_FORNECEDOR_LATICINIO[nome];
    const arr = Array.isArray(produtos) ? produtos : [];
    arr.forEach(produto => {
      if (!produto?.id || produto.ativo === false) return;
      const salvo = porId.get(produto.id);
      const custo = parseFloat(String(produto.custo || '').replace(',', '.'));
      const custoOk = Number.isFinite(custo) && custo > 0;
      lista.push({
        id: produto.id,
        produto: produto.nome,
        unit: produto.unidade || 'un',
        secao: 'Laticínios',
        fornecedorId,
        estoqueAtual: salvo?.estoqueAtual || '',
        qtdSugerida: salvo?.qtdSugerida || '',
        qtdPedir: salvo?.qtdPedir || '',
        precos: salvo?.precos && Object.keys(salvo.precos).length
          ? salvo.precos
          : (fornecedorId && custoOk ? { [fornecedorId]: custo.toFixed(2) } : {}),
        ultimoPrecoCompra: salvo?.ultimoPrecoCompra ?? (custoOk ? custo : undefined)
      });
    });
  });
  return lista;
}

type ItemCotacaoSalvo = {
  id: string;
  estoqueAtual?: string;
  qtdSugerida?: string;
  qtdPedir?: string;
  precos?: Record<string, string>;
  ultimoPrecoCompra?: number;
};

export function montarItensSecao(secao: string, salvos: ItemCotacaoSalvo[] = []) {
  const porId = new Map(salvos.map(item => [item.id, item]));
  const catalogo = Array.isArray(PRODUTOS_POR_SECAO[secao]) ? PRODUTOS_POR_SECAO[secao] : [];
  return catalogo
    .filter(produto => produto?.id && produto.ativo !== false)
    .map(produto => {
      const salvo = porId.get(produto.id);
      const custo = parseFloat(String(produto.custo || '').replace(',', '.'));
      const custoOk = Number.isFinite(custo) && custo > 0;
      const categoria = produto.categoria
        || (secao === 'Matéria prima' ? categoriaMateriaPrima(produto.nome) : '')
        || (secao === 'Mercearia' ? categoriaMercearia(produto.nome) : '');
      return {
        id: produto.id,
        produto: produto.nome,
        unit: produto.unidade || 'un',
        secao,
        categoria,
        estoqueAtual: salvo?.estoqueAtual || '',
        qtdSugerida: salvo?.qtdSugerida || '',
        qtdPedir: salvo?.qtdPedir || '',
        precos: salvo?.precos && Object.keys(salvo.precos).length ? salvo.precos : {},
        ultimoPrecoCompra: salvo?.ultimoPrecoCompra ?? (custoOk ? custo : undefined)
      };
    });
}

export function acharItemCatalogoCotacao(id: string, salvos: ItemCotacaoSalvo[] = []) {
  if (String(id).startsWith('lat_')) return montarItensLaticinios(salvos).find(item => item.id === id);
  if (String(id).startsWith('emb_')) return montarItensEmbalagens(salvos).find(item => item.id === id);
  const secao = secaoCatalogoDoId(id);
  if (!secao) return undefined;
  return montarItensSecao(secao, salvos).find(item => item.id === id);
}

const FAMILIA_EMBALAGEM: Array<[RegExp, string]> = [
  [/saco de lixo/, 'saco de lixo'],
  [/saco de papel|saco p\/ talher|saco de papel person/, 'saco de papel'],
  [/caixa/, 'caixa'],
  [/saco hot dog/, 'saco hot dog'],
  [/saco p\/ cesta/, 'saco para cesta'],
  [/sacola/, 'sacola'],
  [/fecho/, 'fecho'],
  [/bobina impressora/, 'bobina termica'],
  [/bobina/, 'saco bobina'],
  [/saco transparente|saco pp |saco baixa|leitos/, 'saco plastico'],
  [/^saco \d/, 'saco bobina'],
  [/bandeja laminada/, 'bandeja laminada'],
  [/bandeja isopor/, 'bandeja isopor'],
  [/bandeja/, 'bandeja'],
  [/prato laminado/, 'prato laminado'],
  [/prato/, 'prato'],
  [/marmitex/, 'marmitex'],
  [/potes ultra|tampas ultra/, 'copo'],
  [/pote|potes/, 'pote'],
  [/garrafa/, 'garrafa'],
  [/copo/, 'copo'],
  [/colher sobremesa/, 'colher sobremesa'],
  [/colher/, 'colher'],
  [/faca/, 'faca'],
  [/garfo/, 'garfo'],
  [/canudo/, 'canudo'],
  [/palito/, 'palito'],
  [/guardanapo/, 'guardanapo'],
  [/touca/, 'touca'],
  [/luva/, 'luva'],
  [/filme/, 'filme pvc'],
  [/papel manteiga/, 'papel manteiga'],
  [/aluminio/, 'aluminio'],
  [/forminha/, 'forminha'],
  [/hamburgu/, 'hamburguer'],
  [/bolo ingles|embalagem b10|embalagem termica bolo/, 'bolo ingles'],
  [/embalagem para bolo|embalagem bolo|embalagem p bolo|^g 56 |^g 35ma /, 'embalagem bolo'],
  [/torta|fatia torta|^g60ma |^g 630 /, 'torta'],
  [/cupcake/, 'cupcake'],
  [/colomba/, 'colomba'],
  [/embalagem/, 'embalagem'],
  [/cesta/, 'cesta'],
  [/laco/, 'laco'],
  [/disco de isopor/, 'disco isopor'],
  [/cake board/, 'cake board'],
  [/etiqueta/, 'etiqueta'],
  [/papel a4/, 'papel a4'],
  [/fita/, 'fita'],
  [/caneta/, 'caneta'],
  [/corretivo/, 'corretivo'],
  [/liga elastica/, 'liga'],
  [/pincel|marcador/, 'marcador'],
  [/grampo|grampe/, 'grampo'],
  [/estilete|lamina/, 'estilete'],
  [/cola /, 'cola'],
  [/caderneta/, 'caderneta']
];

const ORDEM_FAMILIA_EMBALAGEM = [
  'sacola', 'saco de papel', 'caixa', 'saco bobina', 'saco plastico', 'fecho', 'saco hot dog', 'saco para cesta', 'saco de lixo',
  'bandeja laminada', 'bandeja isopor', 'bandeja', 'prato laminado', 'prato', 'marmitex', 'pote', 'garrafa', 'copo',
  'colher', 'colher sobremesa', 'faca', 'garfo', 'canudo', 'palito', 'guardanapo', 'touca', 'luva',
  'filme pvc', 'papel manteiga', 'aluminio', 'forminha', 'hamburguer', 'embalagem bolo', 'bolo ingles', 'torta', 'cupcake', 'colomba', 'embalagem',
  'cesta', 'laco', 'disco isopor', 'cake board',
  'etiqueta', 'bobina termica', 'papel a4', 'fita', 'caneta', 'corretivo', 'liga', 'marcador', 'grampo', 'estilete', 'cola', 'caderneta'
];

function familiaEmbalagem(nome: string) {
  const texto = String(nome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const achou = FAMILIA_EMBALAGEM.find(([regra]) => regra.test(texto));
  return achou ? achou[1] : 'outros';
}

function ordenarEmbalagens<T extends { produto: string }>(itens: T[]) {
  const ordem = new Map(ORDEM_FAMILIA_EMBALAGEM.map((nome, indice) => [nome, indice]));
  return [...itens].sort((a, b) => {
    const familiaA = familiaEmbalagem(a.produto);
    const familiaB = familiaEmbalagem(b.produto);
    const posA = ordem.get(familiaA) ?? 900;
    const posB = ordem.get(familiaB) ?? 900;
    if (posA !== posB) return posA - posB;
    return a.produto.localeCompare(b.produto, 'pt-BR', { numeric: true, sensitivity: 'base' });
  });
}

export function montarItensEmbalagens(salvos: Array<{
  id: string;
  estoqueAtual?: string;
  qtdSugerida?: string;
  qtdPedir?: string;
  precos?: Record<string, string>;
  ultimoPrecoCompra?: number;
}> = []) {
  const porId = new Map(salvos.map(item => [item.id, item]));
  const catalogo = Array.isArray(PRODUTOS_POR_SECAO.Embalagens) ? PRODUTOS_POR_SECAO.Embalagens : [];
  return ordenarEmbalagens(catalogo
    .filter(produto => produto?.id && produto.ativo !== false)
    .map(produto => {
      const salvo = porId.get(produto.id);
      const custo = parseFloat(String(produto.custo || '').replace(',', '.'));
      const custoOk = Number.isFinite(custo) && custo > 0;
      return {
        id: produto.id,
        produto: produto.nome,
        unit: produto.unidade || 'un',
        secao: 'Embalagens',
        estoqueAtual: salvo?.estoqueAtual || '',
        qtdSugerida: salvo?.qtdSugerida || '',
        qtdPedir: salvo?.qtdPedir || '',
        precos: salvo?.precos && Object.keys(salvo.precos).length ? salvo.precos : {},
        ultimoPrecoCompra: salvo?.ultimoPrecoCompra ?? (custoOk ? custo : undefined)
      };
    }));
}
