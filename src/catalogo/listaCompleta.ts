import texto from './dados/relatorioSaldoEstoque.csv?raw';

export type ItemListaCompleta = {
  id: string;
  codigo: string;
  codigoBarras: string;
  descricao: string;
  embalagem: string;
  estoque: string;
  custo: string;
  preco: string;
  temEstoque: boolean;
};

const valorNumero = (textoValor: string) => {
  const n = parseFloat(String(textoValor || '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const codigoLegivel = (codigo: string) => codigo.replace(/^0+/, '') || '0';

const linhas = texto.replace(/^\uFEFF/, '').split(/\r?\n/).slice(1);

export const LISTA_COMPLETA: ItemListaCompleta[] = linhas
  .map(linha => linha.trim())
  .filter(Boolean)
  .map((linha, indice) => {
    const colunas = linha.split(';');
    const codigoBarras = (colunas[2] || '').trim();
    const codigo = codigoLegivel(codigoBarras);
    const estoque = colunas[6] || '0,00';
    return {
      id: `${codigo}-${indice}`,
      codigo,
      codigoBarras,
      descricao: colunas[3] || '',
      embalagem: colunas[4] || '',
      estoque,
      custo: colunas[9] || '0,00',
      preco: colunas[10] || '0,00',
      temEstoque: valorNumero(estoque) > 0
    };
  })
  .sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt-BR', { numeric: true, sensitivity: 'base' }));
