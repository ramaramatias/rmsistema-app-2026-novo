import * as XLSX from 'xlsx';
import type { ProdutoCatalogo } from './tipos';

const normalizar = (valor: unknown) =>
  String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const chaveColuna = (titulo: string) => {
  const n = normalizar(titulo);
  if (/(^| )(codigo|código|sku|cod|ean|barras)($| )/.test(` ${n} `) || n === 'id') return 'codigo';
  if (/(produto|nome|descricao|descrição|item|mercadoria)/.test(n)) return 'nome';
  if (/(unidade|unid|^un$|^und$)/.test(n)) return 'unidade';
  if (/(secao|seção|categoria|grupo|departamento|setor)/.test(n)) return 'secao';
  if (/(ativo|status|situacao|situação)/.test(n)) return 'ativo';
  return '';
};

const textoAtivo = (valor: unknown) => {
  const n = normalizar(valor);
  if (!n) return true;
  return !['nao', 'não', 'n', '0', 'inativo', 'desativado', 'false'].includes(n);
};

export async function lerPlanilhaProdutos(arquivo: File): Promise<ProdutoCatalogo[]> {
  const buffer = await arquivo.arrayBuffer();
  const livro = XLSX.read(buffer, { type: 'array' });
  const aba = livro.Sheets[livro.SheetNames[0]];
  if (!aba) return [];
  const linhas = XLSX.utils.sheet_to_json<(string | number)[]>(aba, { header: 1, defval: '', raw: false }) as unknown[][];
  if (linhas.length < 2) return [];

  const cabecalho = (linhas[0] || []).map(celula => chaveColuna(String(celula)));
  const idxNome = cabecalho.findIndex(c => c === 'nome');
  const idxCodigo = cabecalho.findIndex(c => c === 'codigo');
  const idxUnidade = cabecalho.findIndex(c => c === 'unidade');
  const idxSecao = cabecalho.findIndex(c => c === 'secao');
  const idxAtivo = cabecalho.findIndex(c => c === 'ativo');

  const produtos: ProdutoCatalogo[] = [];
  const vistos = new Set<string>();

  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i] || [];
    const nome = String(idxNome >= 0 ? linha[idxNome] : linha[0] ?? '').trim();
    if (!nome) continue;
    const codigo = String(idxCodigo >= 0 ? linha[idxCodigo] : '').trim() || `p${i}`;
    const chave = `${normalizar(codigo)}|${normalizar(nome)}`;
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    produtos.push({
      id: `cat_${codigo || i}_${i}`,
      codigo,
      nome,
      unidade: String(idxUnidade >= 0 ? linha[idxUnidade] : 'un').trim() || 'un',
      secao: String(idxSecao >= 0 ? linha[idxSecao] : 'Outros produtos').trim() || 'Outros produtos',
      ativo: idxAtivo >= 0 ? textoAtivo(linha[idxAtivo]) : true
    });
  }
  return produtos;
}
