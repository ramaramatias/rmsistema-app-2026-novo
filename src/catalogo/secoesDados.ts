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
  return catalogo
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
    });
}
